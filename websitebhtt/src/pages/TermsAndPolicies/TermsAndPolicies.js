import React, { useEffect } from 'react';
import './TermsAndPolicies.css';
import { BackTop } from 'antd';
import { 
  SafetyCertificateOutlined, 
  FileProtectOutlined, 
  UserSwitchOutlined, 
  CreditCardOutlined, 
  
  TeamOutlined,
  ShopOutlined,
  SyncOutlined,
  GiftOutlined,
  ContactsOutlined,
  CrownOutlined,
  LockOutlined,
  SafetyOutlined,
  StopOutlined,
  CheckCircleOutlined,
  
  CarOutlined,
  DollarOutlined,
  BankOutlined,
  WalletOutlined,
  RocketOutlined
} from '@ant-design/icons';



const TermsAndPolicies = () => {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-container">
      <div className="terms-wrapper">
        <div className="terms-header">
          <h1>Điều Khoản & Chính Sách</h1>
          <p>Cam kết của chúng tôi về sự minh bạch, bảo mật và quyền lợi của khách hàng.</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2><SafetyCertificateOutlined /> 1. Chính Sách Bảo Mật</h2>
            <p className="section-intro">
              Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Dưới đây là 3 trụ cột bảo mật của chúng tôi:
            </p>
            <div className="privacy-grid">
              <div className="privacy-item">
                <div className="privacy-icon"><LockOutlined /></div>
                <h4>Mã Hóa Dữ Liệu</h4>
                <p>Mọi thông tin giao dịch và cá nhân đều được mã hóa SSL 256-bit an toàn tuyệt đối.</p>
              </div>
              <div className="privacy-item">
                <div className="privacy-icon"><SafetyOutlined /></div>
                <h4>Quyền Riêng Tư</h4>
                <p>Cam kết không chia sẻ thông tin với bên thứ 3 nếu không có sự đồng ý của bạn.</p>
              </div>
              <div className="privacy-item">
                <div className="privacy-icon"><UserSwitchOutlined /></div>
                <h4>Quyền Kiểm Soát</h4>
                <p>Bạn có toàn quyền truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu của mình bất cứ lúc nào.</p>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2><FileProtectOutlined /> 2. Điều Khoản Sử Dụng</h2>
            <div className="terms-rules-container">
              <div className="rule-box allowed">
                <h3><CheckCircleOutlined /> Được Phép</h3>
                <ul>
                  <li>Mua sắm và sử dụng các dịch vụ tích hợp trên website.</li>
                  <li>Chia sẻ nhận xét, đánh giá trung thực về sản phẩm.</li>
                  <li>Tham gia các chương trình khuyến mãi công khai.</li>
                </ul>
              </div>
              <div className="rule-box forbidden">
                <h3><StopOutlined /> Nghiêm Cấm</h3>
                <ul>
                  <li>Sử dụng tool/bot để gian lận đơn hàng hoặc tấn công hệ thống.</li>
                  <li>Phát tán nội dung độc hại, virus hoặc spam.</li>
                  <li>Mạo danh người khác hoặc cung cấp thông tin sai lệch.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2><SyncOutlined /> 3. Chính Sách Đổi Trả</h2>
            <div className="return-policy-banner">
              <div className="return-badge">
                <span className="days">30</span>
                <span className="text">NGÀY ĐỔI TRẢ</span>
              </div>
              <div className="return-details">
                <div className="return-step">
                  <CheckCircleOutlined /> <span>Sản phẩm nguyên tem mác</span>
                </div>
                <div className="return-step">
                  <CheckCircleOutlined /> <span>Lỗi do nhà sản xuất</span>
                </div>
                <div className="return-step">
                  <CheckCircleOutlined /> <span>Hoàn tiền siêu tốc</span>
                </div>
              </div>
            </div>
            <p className="return-note">Chúng tôi luôn mong muốn bạn hài lòng. Nếu sản phẩm không ưng ý, hãy liên hệ ngay để được hỗ trợ đổi trả miễn phí.</p>
          </section>

          <section className="terms-section">
            <h2><CreditCardOutlined /> 4. Phương Thức Thanh Toán</h2>
            <div className="payment-grid">
              <div className="payment-card">
                <DollarOutlined className="pay-icon" />
                <h4>COD</h4>
                <p>Thanh toán khi nhận hàng</p>
              </div>
              <div className="payment-card">
                <BankOutlined className="pay-icon" />
                <h4>Chuyển Khoản</h4>
                <p>Internet Banking 24/7</p>
              </div>
              <div className="payment-card">
                <CreditCardOutlined className="pay-icon" />
                <h4>Thẻ Quốc Tế</h4>
                <p>Visa, Mastercard, JCB</p>
              </div>
              <div className="payment-card">
                <WalletOutlined className="pay-icon" />
                <h4>Ví Điện Tử</h4>
                <p>Momo, ZaloPay, VNPay</p>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2><RocketOutlined /> 5. Vận Chuyển & Giao Hàng</h2>
            <div className="shipping-container">
              <div className="shipping-info">
                <div className="shipping-icon-wrapper">
                  <CarOutlined />
                </div>
                <div className="shipping-text">
                  <h3>Giao Hàng Toàn Quốc</h3>
                  <p>Thời gian dự kiến: <strong>2 - 5 ngày</strong> làm việc</p>
                </div>
              </div>
              <div className="freeship-banner">
                <GiftOutlined />
                <span>Miễn phí vận chuyển cho đơn hàng từ <strong>1.000.000 VNĐ</strong></span>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2><TeamOutlined /> 6. Quyền & Nghĩa Vụ Của Khách Hàng</h2>
            <div className="terms-grid-2">
              <div className="terms-card">
                <h3>Quyền Lợi</h3>
                <ul>
                  <li>Xem, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân trong hệ thống.</li>
                  <li>Khiếu nại và yêu cầu hỗ trợ 24/7 về đơn hàng, sản phẩm.</li>
                  <li>Từ chối nhận email marketing hoặc thông báo quảng cáo bất cứ lúc nào.</li>
                </ul>
              </div>
              <div className="terms-card">
                <h3>Nghĩa Vụ</h3>
                <ul>
                  <li>Cung cấp thông tin giao hàng chính xác và đầy đủ.</li>
                  <li>Bảo mật thông tin tài khoản và mật khẩu đăng nhập.</li>
                  <li>Không lợi dụng lỗi hệ thống hoặc gian lận trong các chương trình khuyến mãi.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2><ShopOutlined /> 7. Quyền & Trách Nhiệm Của Website</h2>
            <p>Chúng tôi cam kết mang đến trải nghiệm mua sắm an toàn và minh bạch nhất cho mọi khách hàng.</p>
            <ul>
              <li><strong>Cam kết chất lượng:</strong> Đảm bảo sản phẩm chính hãng, xử lý đơn hàng đúng hạn và bảo vệ dữ liệu khách hàng tuyệt đối.</li>
              <li><strong>Quyền hạn xử lý:</strong> Chúng tôi có quyền tạm khóa tài khoản hoặc hủy đơn hàng trong trường hợp phát hiện gian lận, vi phạm pháp luật, hoặc lỗi giá hiển thị rõ ràng trên hệ thống.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2><SyncOutlined /> 8. Quy Trình Đặt Hàng & Khiếu Nại</h2>
            <div className="process-steps">
              <div className="step-item">
                <div className="step-number">1</div>
                <span>Chọn Sản Phẩm</span>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-item">
                <div className="step-number">2</div>
                <span>Đặt Hàng</span>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-item">
                <div className="step-number">3</div>
                <span>Xác Nhận</span>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-item">
                <div className="step-number">4</div>
                <span>Thanh Toán</span>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-item">
                <div className="step-number">5</div>
                <span>Giao Hàng</span>
              </div>
            </div>
            <div className="complaint-box">
              <h3>Quy Trình Hủy & Khiếu Nại</h3>
              <p>Khách hàng có thể hủy đơn hàng trực tiếp trên website trước khi trạng thái chuyển sang "Đang giao". Mọi khiếu nại sẽ được tiếp nhận qua Hotline/Email và xử lý trong vòng 24-48h làm việc.</p>
            </div>
          </section>

          <section className="terms-section">
            <h2><GiftOutlined /> 9. Chính Sách Khuyến Mãi</h2>
            <ul>
              <li>Mã giảm giá và Voucher có thời hạn sử dụng và số lượng có hạn.</li>
              <li>Không áp dụng đồng thời nhiều mã giảm giá cho một đơn hàng (trừ khi có quy định khác).</li>
              <li>Điểm tích lũy không có giá trị quy đổi thành tiền mặt và không được chuyển nhượng.</li>
              <li>Chúng tôi có quyền thay đổi hoặc chấm dứt chương trình khuyến mãi nhưng vẫn đảm bảo quyền lợi đã phát sinh hợp lệ của khách hàng trước thời điểm thay đổi.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2><ContactsOutlined /> 10. Thông Tin Liên Hệ</h2>
            <div className="contact-info-box">
              <p><strong>CÔNG TY CỔ PHẦN GREEN GLOBAL</strong></p>
              <p>📍 Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
              <p>📧 Email: support@greenglobal.com</p>
              <p>☎️ Hotline: 1900 1234</p>
              <p>🏢 Mã số thuế: 0123456789</p>
              <p>⏰ Giờ làm việc: 8:00 - 17:30 (Thứ 2 - Thứ 6)</p>
            </div>
          </section>

          <section className="terms-section vip-terms-section">
            <h2><CrownOutlined /> 11. Điều Khoản Gói VIP</h2>
            <div className="vip-terms-content">
              <p>Chương trình thành viên VIP mang lại những đặc quyền riêng biệt cho khách hàng thân thiết.</p>
              <ul>
                <li><strong>Thời hạn & Gia hạn:</strong> Gói VIP được tính theo chu kỳ tháng hoặc năm. Hệ thống sẽ tự động gia hạn trừ khi khách hàng hủy trước ngày thanh toán tiếp theo.</li>
                <li><strong>Phạm vi ưu đãi:</strong> Ưu đãi giảm giá áp dụng cho hầu hết sản phẩm (trừ một số bộ sưu tập giới hạn). Quyền lợi VIP là định danh và không được chuyển nhượng.</li>
                <li><strong>Hoàn tiền:</strong> Không hỗ trợ hoàn tiền cho thời gian chưa sử dụng nếu khách hàng hủy gói giữa chu kỳ.</li>
                <li><strong>Thu hồi quyền lợi:</strong> Chúng tôi có quyền ngưng cung cấp dịch vụ VIP nếu phát hiện tài khoản có dấu hiệu lạm dụng hoặc gian lận trục lợi.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
      <BackTop />
    </div>
  );
};

export default TermsAndPolicies;
