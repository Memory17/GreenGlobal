import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { message } from 'antd';

const Web3Context = createContext();

// Địa chỉ ví nhận tiền của Shop (có thể thay đổi)
// ⚠️ Replace this with your shop wallet address. If you're testing locally, the code can fallback to signer (dev only).
const SHOP_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE7C'; // ⚠️ Thay bằng ví thật của bạn
let NORMALIZED_SHOP_WALLET_ADDRESS = SHOP_WALLET_ADDRESS;
try {
  NORMALIZED_SHOP_WALLET_ADDRESS = ethers.utils.getAddress(SHOP_WALLET_ADDRESS);
} catch (e) {
  console.warn('[Web3] SHOP_WALLET_ADDRESS is not checksummed or invalid. Using raw value; sendTransaction might fail.', e);
}

// Allow fallback to signer (connected account) when testing locally, so developers can test transactions.
const ALLOW_FALLBACK_TO_SIGNER = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// Tỷ giá VND/ETH (demo - trong thực tế cần lấy từ API)
const VND_TO_ETH_RATE = 0.0000000125; // 1 VND ≈ 0.0000000125 ETH (giả sử 1 ETH = 80,000,000 VND)

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isUserDisconnected, setIsUserDisconnected] = useState(false);
  const [, forceUpdate] = useState(0);

  // Kiểm tra xem MetaMask có được cài đặt không
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Lấy balance của account
  const fetchBalance = useCallback(async (address, web3Provider) => {
    if (!address || !web3Provider) return;
    try {
      const bal = await web3Provider.getBalance(address);
      setBalance(ethers.utils.formatEther(bal));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, []);

  // Kết nối MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      message.error('Vui lòng cài đặt MetaMask!');
      window.open('https://metamask.io/download/', '_blank');
      return null;
    }

    setIsConnecting(true);
    try {
      // Yêu cầu quyền truy cập tài khoản
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        message.error('Không tìm thấy tài khoản MetaMask!');
        return null;
      }

      // Tạo provider và signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setIsUserDisconnected(false);
      console.debug('[Web3] connectWallet -> connected account', accounts[0]);
      setIsUserDisconnected(false);
      setChainId(network.chainId);

      await fetchBalance(accounts[0], web3Provider);

      message.success(`Đã kết nối ví: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        message.warning('Bạn đã từ chối kết nối ví.');
      } else {
        message.error('Lỗi kết nối ví MetaMask!');
      }
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  // Ngắt kết nối ví
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setBalance('0');
    setChainId(null);
    setIsUserDisconnected(true);
    console.debug('[Web3] disconnectWallet -> user requested disconnect');
    forceUpdate(prev => prev + 1); // Force re-render
    message.info('Đã ngắt kết nối ví.');
  }, [forceUpdate]);

  // Chuyển đổi VND sang ETH
  const convertVNDtoETH = (amountVND) => {
    return (amountVND * VND_TO_ETH_RATE).toFixed(8);
  };

  // Chuyển đổi USD sang ETH (giả sử 1 ETH = $3,400)
  const convertUSDtoETH = (amountUSD) => {
    const ETH_PRICE_USD = 3400;
    return (amountUSD / ETH_PRICE_USD).toFixed(8);
  };

  // Thực hiện thanh toán bằng ETH
  // amount: numeric amount, currency: 'USD' | 'VND' | 'ETH'
  const payWithETH = async (amount, currency = 'USD', orderInfo = {}) => {
    if (!account || !signer) {
      message.error('Vui lòng kết nối ví MetaMask trước!');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsProcessingPayment(true);

    try {
      console.debug('[Web3] payWithETH -> initiating', { amount, currency, account, chainId });
      // Chuyển đổi dựa trên currency
      let ethAmount;
      if (currency === 'USD') {
        ethAmount = convertUSDtoETH(amount);
      } else if (currency === 'VND') {
        ethAmount = convertVNDtoETH(amount);
      } else if (currency === 'ETH') {
        ethAmount = amount.toString(); // assume already ETH decimal string/number
      } else {
        ethAmount = convertUSDtoETH(amount);
      }
      const ethAmountWei = ethers.utils.parseEther(ethAmount);
      console.debug('[Web3] payWithETH -> amounts', { ethAmount, ethAmountWei: ethAmountWei.toString(), chainId });

      // Kiểm tra số dư + ước tính phí gas
      const currentBalance = await provider.getBalance(account);
      console.debug('[Web3] payWithETH -> currentBalance (wei)', currentBalance.toString());
      let gasCostWei = ethers.BigNumber.from('0');
      try {
        const gasEstimate = await provider.estimateGas({ to: SHOP_WALLET_ADDRESS, value: ethAmountWei });
        const gasPrice = await provider.getGasPrice();
        gasCostWei = gasEstimate.mul(gasPrice);
      } catch (gasErr) {
        // Estimate failed; use a conservative default gas (21k) for a simple transfer
        const defaultGas = ethers.BigNumber.from(21000);
        const gasPrice = await provider.getGasPrice();
        gasCostWei = defaultGas.mul(gasPrice);
      }
      const totalCostWei = ethAmountWei.add(gasCostWei);
      if (currentBalance.lt(totalCostWei)) {
        message.error('Số dư không đủ để thực hiện giao dịch (bao gồm phí gas)!');
        return { success: false, error: 'Insufficient balance incl gas' };
      }

      // Hiển thị thông tin giao dịch
      message.loading({
        content: `Đang gửi ${ethAmount} ETH (~${currency} ${amount})...`,
        key: 'payment',
        duration: 0,
      });

      // Tạo và gửi giao dịch
      let toAddress = NORMALIZED_SHOP_WALLET_ADDRESS;
      try {
        toAddress = ethers.utils.getAddress(toAddress);
      } catch (e) {
        console.error('[Web3] Invalid recipient address', toAddress, e);
        // If in dev/testing, fallback to signing account so the developer can test the flow end-to-end
        if (ALLOW_FALLBACK_TO_SIGNER && account) {
          console.warn('[Web3] Shop wallet invalid, falling back to connected account for testing:', account);
          message.warning('Địa chỉ ví nhận thanh toán không hợp lệ. Sử dụng ví của bạn để thử nghiệm.');
          toAddress = account; // do a harmless self-transfer to allow smooth testing
        } else {
          message.error('Địa chỉ ví nhận thanh toán không hợp lệ. Liên hệ admin.');
          return { success: false, error: 'Invalid shop wallet address' };
        }
      }
      console.debug('[Web3] payWithETH -> sending tx to address', toAddress);
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethAmountWei,
        // Gas sẽ được tự động ước tính bởi MetaMask
      });

      message.loading({
        content: 'Đang xử lý giao dịch trên blockchain...',
        key: 'payment',
        duration: 0,
      });

      // Đợi giao dịch được xác nhận
      const receipt = await tx.wait();
      console.debug('[Web3] payWithETH -> tx receipt', { transactionHash: receipt.transactionHash, blockNumber: receipt.blockNumber });

      // Cập nhật lại balance
      await fetchBalance(account, provider);

      message.success({
        content: 'Thanh toán thành công!',
        key: 'payment',
        duration: 3,
      });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        from: receipt.from,
        to: receipt.to,
        amountETH: ethAmount,
        amount: amount,
        currency: currency,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('[Web3] Payment error:', error);
      
      let errorMessage = 'Giao dịch thất bại!';
      // Ethers and MetaMask provide different error codes/messages
      if (error?.code === 4001) {
        errorMessage = 'Bạn đã hủy giao dịch.';
      } else if (error?.reason?.includes('insufficient funds') || error?.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Số dư không đủ để thực hiện giao dịch!';
      } else if (error.code === -32603) {
        errorMessage = 'Lỗi mạng blockchain. Vui lòng thử lại!';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      message.error({
        content: errorMessage,
        key: 'payment',
        duration: 5,
      });

      return { success: false, error: error.message };
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Ước tính gas và tổng chi phí cho một thanh toán (dùng để hiển thị ở UI)
  const estimateGasForPayment = useCallback(async (amount, currency = 'USD') => {
    if (!provider) return null;
    try {
      let ethAmount;
      if (currency === 'USD') ethAmount = convertUSDtoETH(amount);
      else if (currency === 'VND') ethAmount = convertVNDtoETH(amount);
      else if (currency === 'ETH') ethAmount = amount.toString();
      else ethAmount = convertUSDtoETH(amount);

      const ethAmountWei = ethers.utils.parseEther(ethAmount);

      // Determine toAddress (normalize)
      let toAddress = NORMALIZED_SHOP_WALLET_ADDRESS;
      try { toAddress = ethers.utils.getAddress(toAddress); } catch (e) { /* ignore */ }

      // Estimate gas and gas price
      const gasEstimate = await provider.estimateGas({ to: toAddress, value: ethAmountWei });
      const gasPrice = await provider.getGasPrice();
      const gasCostWei = gasEstimate.mul(gasPrice);
      const totalCostWei = ethAmountWei.add(gasCostWei);

      return {
        ethAmount,
        ethAmountWei: ethAmountWei.toString(),
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        gasCostWei: gasCostWei.toString(),
        totalCostWei: totalCostWei.toString(),
        gasCostEth: ethers.utils.formatEther(gasCostWei),
        totalCostEth: ethers.utils.formatEther(totalCostWei),
      };
    } catch (err) {
      console.error('[Web3] estimateGasForPayment error', err);
      return null;
    }
  }, [provider]);

  // Lắng nghe sự thay đổi account và chain
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      // If user explicitly disconnected in-app, don't auto re-connect
      if (isUserDisconnected) {
        // If user has disconnected and MetaMask reports accounts, ignore auto connect
        if (accounts.length === 0) {
          // nothing to do
          return;
        }
        console.debug('[Web3] handleAccountsChanged -> ignored due to user disconnect flag', accounts);
        return;
      }

      if (accounts.length === 0) {
        // Ngắt kết nối nếu không có account
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setBalance('0');
        setChainId(null);
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        if (provider) {
          fetchBalance(accounts[0], provider);
        }
        message.info(`Đã chuyển sang ví: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
        console.debug('[Web3] handleAccountsChanged -> new account set', accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      message.info(`Đã chuyển sang mạng: Chain ID ${newChainId}`);
      // Reload provider
      if (window.ethereum) {
        const newProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(newProvider);
        setSigner(newProvider.getSigner());
      }
    };

    try {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    } catch (error) {
      console.warn('[Web3] Failed to add event listeners:', error);
    }

    // Kiểm tra nếu đã kết nối trước đó
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;
      
      try {
        // Thêm delay nhỏ để đảm bảo MetaMask đã inject xong
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Kiểm tra xem có thể gọi request không
        if (!window.ethereum || !window.ethereum.request) return;

        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          .catch(err => {
            console.warn('[Web3] Failed to get accounts (likely locked or not ready):', err);
            return [];
          });

        console.debug('[Web3] checkConnection -> accounts', accounts, 'isUserDisconnected', isUserDisconnected);
        if (accounts && accounts.length > 0 && !isUserDisconnected) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const web3Signer = web3Provider.getSigner();
          const network = await web3Provider.getNetwork();
          
          setProvider(web3Provider);
          setSigner(web3Signer);
          setAccount(accounts[0]);
          setChainId(network.chainId);
          await fetchBalance(accounts[0], web3Provider);
        }
      } catch (error) {
        console.warn('Error checking wallet connection (handled):', error);
      }
    };

    checkConnection();

    return () => {
      try {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      } catch (error) {
        console.warn('[Web3] Failed to remove event listeners:', error);
      }
    };
  }, [account, provider, fetchBalance, isUserDisconnected]);

  // Lấy tên mạng từ chainId
  const getNetworkName = (id) => {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
    };
    return networks[id] || `Chain ID: ${id}`;
  };

  const value = {
    // State
    account,
    balance,
    chainId,
    isConnecting,
    isProcessingPayment,
    isUserDisconnected,
    
    // Methods
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    payWithETH,
    estimateGasForPayment,
    convertVNDtoETH,
    convertUSDtoETH,
    getNetworkName,
    
    // Constants
    SHOP_WALLET_ADDRESS,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;
