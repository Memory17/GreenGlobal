import React, { useState, useRef, useEffect } from 'react';
import { useLocation} from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // BƯỚC 1: IMPORT useAuth
import { FloatButton, Card, List, Avatar, Typography, Input } from 'antd';
import {
  CloseOutlined,
  SendOutlined,
  WechatOutlined,
  ExclamationCircleOutlined,
  SmileOutlined,
  PictureOutlined,
  CustomerServiceOutlined, UserOutlined,
  
} from '@ant-design/icons';

import '../style/ChatBubble.css';

const { Text, Title } = Typography;

const ChatBubble = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);

  // --- THAY ĐỔI STATE ĐỂ QUẢN LÝ NHIỀU CUỘC TRÒ CHUYỆN ---
  // State cho User: messages là một mảng
  const [messages, setMessages] = useState([]);
  // State cho Admin: conversations là một object, key là userId
  const [conversations, setConversations] = useState({});
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const [inputValue, setInputValue] = useState('');
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // --- THAY ĐỔI QUAN TRỌNG: Quản lý channel bằng useRef ---
  // Điều này đảm bảo chúng ta luôn có một đối tượng channel duy nhất cho component.
  const channelRef = useRef(null);

  const { currentUser } = useAuth(); // Lấy người dùng hiện tại
  const location = useLocation();
  const currentUserRole = location.pathname.startsWith('/admin') ? 'admin' : 'user';
  
  // --- THAY ĐỔI CƠ CHẾ ĐỊNH DANH ---
  // Sử dụng username làm ID duy nhất, nếu không có thì là 'guest'
  const currentUserId = currentUserRole === 'user' 
    ? (currentUser?.username || 'guest') 
    : 'admin';

  // --- NÂNG CẤP: Tải và lưu trạng thái chat từ localStorage ---
  // BƯỚC 2: Thêm `currentUser` vào dependency array và cập nhật logic
  useEffect(() => {
    if (currentUserRole === 'admin') {
      const savedConversations = localStorage.getItem('admin_chat_conversations');
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
    } else {
      // BƯỚC 3: Logic reset tin nhắn cho người dùng
      if (currentUser) {
        // Nếu có người dùng đăng nhập, bắt đầu cuộc trò chuyện mới
        const initialUserMessage = { 
          id: 1, 
          sender: 'admin', 
          type: 'text', 
          text: 'Xin chào! Tôi là hỗ trợ. Bạn cần giúp gì?',
          timestamp: new Date(Date.now() - 300000),
          isRead: true
        };
        setMessages([initialUserMessage]);
      } else {
        // Nếu không có ai đăng nhập (vừa logout), xóa sạch tin nhắn
        setMessages([]);
      }
    }
  }, [currentUserRole, currentUser]);

  // Lưu lại khi conversations thay đổi (cho admin)
  useEffect(() => {
    if (currentUserRole === 'admin' && Object.keys(conversations).length > 0) {
      // --- GIẢI PHÁP: Không lưu nội dung ảnh Base64 vào localStorage ---
      try {
        // Tạo một bản sao sâu để không làm thay đổi state gốc
        const conversationsToSave = JSON.parse(JSON.stringify(conversations));

        // Lặp qua tất cả các cuộc trò chuyện và tin nhắn
        for (const userId in conversationsToSave) {
          conversationsToSave[userId].messages = conversationsToSave[userId].messages.map(msg => {
            // Nếu là tin nhắn hình ảnh, thay thế nội dung Base64
            if (msg.type === 'image' && msg.content) {
              return { ...msg, content: '[Image Content]' }; // Thay bằng placeholder
            }
            return msg;
          });
        }
        
        localStorage.setItem('admin_chat_conversations', JSON.stringify(conversationsToSave));
      } catch (error) {
        console.error("Lỗi khi lưu cuộc trò chuyện vào localStorage:", error);
      }
    }
  }, [conversations, currentUserRole]);


  // --- NÂNG CẤP: Xử lý tin nhắn đến ---
  useEffect(() => {
    // --- THAY ĐỔI QUAN TRỌNG: Khởi tạo channel nếu chưa có ---
    // Đảm bảo channel luôn tồn tại khi component được render.
    if (!channelRef.current) {
      channelRef.current = new BroadcastChannel('chat_channel');
    }
    const channel = channelRef.current;
    const handleNewMessage = (event) => {
      const msg = event.data;

      if (msg.type === 'typing') {
        // Xử lý typing indicator (giữ nguyên)
        if (msg.sender !== currentUserRole) {
          setIsAdminTyping(msg.isTyping);
        }
        return;
      }

      // Nếu là admin, thêm tin nhắn vào đúng cuộc trò chuyện
      if (currentUserRole === 'admin') {
        const fromUserId = msg.userId;
        // Lấy thông tin người dùng từ tin nhắn (nếu có)
        const userInfo = {
          username: msg.userInfo?.username,
          avatar: msg.userInfo?.avatar,
        };

        setConversations(prev => {
          const userConvo = prev[fromUserId] || { messages: [], unread: 0, userInfo: {} };
          const newMessages = [...userConvo.messages, msg];
          const newUnread = selectedConversationId === fromUserId ? 0 : (userConvo.unread || 0) + 1;
          
          // Cập nhật thông tin user nếu có
          const updatedUserInfo = { ...userConvo.userInfo, ...userInfo };

          return {
            ...prev,
            [fromUserId]: { ...userConvo, messages: newMessages, unread: newUnread, userInfo: updatedUserInfo }
          };
        });
      } 
      // Nếu là user, chỉ nhận tin nhắn từ admin hoặc từ chính mình (để đồng bộ tab)
      else {
        // --- SỬA LỖI: User chỉ nhận tin nhắn khi nó dành cho mình ---
        // Điều kiện: (Người gửi là admin VÀ người nhận là tôi) HOẶC (Người gửi là chính tôi - để đồng bộ tab)
        const isForMe = (msg.sender === 'admin' && msg.userId === currentUserId);
        const isFromSelfForSync = (msg.sender === 'user' && msg.userId === currentUserId);
        if (isForMe || isFromSelfForSync) {
          setMessages((prev) => [...prev, msg]);
          setIsAdminTyping(false);
        }
      }
    };

    channel.addEventListener('message', handleNewMessage);
    return () => {
      channel.removeEventListener('message', handleNewMessage);
    };
  }, [currentUserRole, currentUserId, selectedConversationId]);

  // Handle user typing - broadcast typing status
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Broadcast typing indicator
    if (newValue.trim().length > 0 && !inputValue.trim().length) {
      // User started typing
      channelRef.current?.postMessage({ type: 'typing', isTyping: true, sender: currentUserRole });
    } else if (newValue.trim().length === 0 && inputValue.trim().length > 0) {
      // User stopped typing
      channelRef.current?.postMessage({ type: 'typing', isTyping: false, sender: currentUserRole });
    }
  };

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, conversations, selectedConversationId, isAdminTyping]);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
    if (!isPopupVisible) setIsMessengerOpen(false);
  };

  const selectConversation = (userId) => {
    setSelectedConversationId(userId);
    // Reset unread count
    setConversations(prev => ({...prev, [userId]: {...prev[userId], unread: 0}}));
  };

  const toggleMessenger = () => {
    setIsMessengerOpen((prev) => {
      const next = !prev;
      if (next) setIsPopupVisible(false);
      return next;
    });
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const handleSendMessage = () => {
    const text = inputValue && inputValue.trim();
    if (!text) return;

    // --- NÂNG CẤP: Thêm userId vào tin nhắn ---
    const newMsg = { 
      id: Date.now(), 
      sender: currentUserRole, 
      type: 'text', 
      text,
      timestamp: new Date(),
      isRead: currentUserRole === 'admin' ? true : false,
      userId: currentUserRole === 'admin' ? selectedConversationId : currentUserId,
      // Đính kèm thông tin người gửi nếu là user
      userInfo: currentUserRole === 'user' ? {
        username: currentUser?.username,
        avatar: currentUser?.image,
      } : null,
    };
    
    // Cập nhật state tương ứng với vai trò
    if (currentUserRole === 'admin') {
      if (!selectedConversationId) return; // Không gửi nếu chưa chọn convo
      setConversations(prev => {
        const userConvo = prev[selectedConversationId] || { messages: [], userInfo: {} };
        const newMessages = [...userConvo.messages, newMsg];
        return {
          ...prev,
          [selectedConversationId]: { ...userConvo, messages: newMessages }
        };
      });
    } else {
      setMessages((prev) => [...prev, newMsg]);
    }

    channelRef.current?.postMessage(newMsg);
    
    // Stop typing indicator when message sent
    channelRef.current?.postMessage({ type: 'typing', isTyping: false, sender: currentUserRole });
    
    setInputValue('');
  };

  // Lấy danh sách tin nhắn hiện tại để hiển thị
  const currentMessages = currentUserRole === 'admin'
    ? (conversations[selectedConversationId]?.messages || [])
    : messages;

  const handleImageSend = (dataUrl) => {
    if (!dataUrl) return;
    const imgMsg = { 
      id: Date.now(), 
      sender: currentUserRole, 
      type: 'image', 
      content: dataUrl,
      timestamp: new Date(),
      isRead: currentUserRole === 'admin' ? true : false,
      userId: currentUserRole === 'admin' ? selectedConversationId : currentUserId,
      // Đính kèm thông tin người gửi nếu là user
      userInfo: currentUserRole === 'user' ? {
        username: currentUser?.username,
        avatar: currentUser?.image,
      } : null,
    };
    
    if (currentUserRole === 'admin') {
      if (!selectedConversationId) return;
      setConversations(prev => {
        const userConvo = prev[selectedConversationId] || { messages: [], userInfo: {} };
        const newMessages = [...userConvo.messages, imgMsg];
        return {
          ...prev,
          [selectedConversationId]: { ...userConvo, messages: newMessages }
        };
      });
    } else {
      setMessages((prev) => [...prev, imgMsg]);
    }

    channelRef.current?.postMessage(imgMsg);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleImageSend(ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const emojiList = [
  '😊','😁','😂','😮','😢','👍','🙏','🔥','🎉','💯','❤️','🤔',

  '😎','🥰','🤩','😆','😇','😏','🤗','😴','🤤','😱',
  '😡','🤯','🥲','😋','😜','😝','🤪','😤','🤬','😭',
  '😐','😑','😔','😞','😕','🙄','🤨','🤝','👏','🙌',
  '💪','🤝','✌️','👌','🫶','🤝','👉','👈','👇','👆',
  '⭐','⚡','🌈','🌟','✨','🎁','🎶','🏆','🚀','🍀',
  '🌸','🔥','💥','💎','🧡','💙','💚','🤍','🖤','💫'
];

  const insertEmoji = (emoji) => {
    setInputValue((prev) => (prev ? prev + emoji : emoji));
    setShowEmojiPicker(false);
  };

  const quickReplies = [
    "Tôi muốn hỏi về đơn hàng",
    "Giúp tôi hoàn trả sản phẩm",
    "Vấn đề giao hàng"
  ];

  const handleQuickReply = (reply) => {
    setInputValue(reply);
  };

  const getMessageClass = (senderRole) => {
    return senderRole === currentUserRole 
      ? 'message-item current-user' 
      : 'message-item other-user';
  };

  const renderMessage = (m) => {
    if (m.type === 'image') {
      return (
        <div className="message-bubble">
          <img src={m.content} alt="uploaded" className="message-image" />
        </div>
      );
    }
    
    if (m.type === 'product') {
      return (
        <div className="message-bubble product-card">
          <img src={m.product.image} alt={m.product.name} className="product-image" />
          <div className="product-info">
            <div className="product-name">{m.product.name}</div>
            <div className="product-price">{m.product.price}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="message-bubble">
        {m.text}
      </div>
    );
  };

  const supportOptions = [
    {
      id: 'zalo-247',
      icon: 'https://cdn-icons-png.flaticon.com/512/739/739178.png',
      title: 'Hỗ trợ trực tuyến 24/7',
      description: 'Liên hệ qua Zalo để được hỗ trợ nhanh nhất',
      link: 'https://zalo.me/your-zalo-id'
    },
    {
      id: 'zalo-group',
      icon: 'https://cdn-icons-png.flaticon.com/512/739/739178.png',
      title: 'Nhóm Zalo',
      description: 'Cập nhật thông tin mới nhất và thảo luận',
      link: 'https://zalo.me/g/your-zalo-group-id'
    },
    {
      id: 'telegram',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
      title: 'Hỗ trợ qua Telegram',
      description: 'Tư vấn qua kênh Telegram',
      link: 'https://t.me/your-telegram-username'
    },
  ];

  // --- GIAO DIỆN MỚI CHO ADMIN ---
  if (currentUserRole === 'admin') {
    return (
      <>
        {isMessengerOpen && (
          <div className="messenger-panel admin-view">
            <div className="conversation-list">
              <div className="conversation-list-header">
                <Title level={5} style={{ margin: 0 }}>Các cuộc trò chuyện</Title>
              </div>
              <List
                dataSource={Object.keys(conversations)}
                renderItem={userId => {
                  const convo = conversations[userId];
                  const lastMessage = convo.messages[convo.messages.length - 1];
                  return (
                    <List.Item
                      className={`conversation-list-item ${selectedConversationId === userId ? 'selected' : ''}`}
                      onClick={() => selectConversation(userId)}
                    >
                      <List.Item.Meta
                        // --- HIỂN THỊ AVATAR VÀ TÊN THẬT ---
                        avatar={<Avatar src={convo.userInfo?.avatar} icon={<UserOutlined />} />}
                        title={<div className="convo-title">{convo.userInfo?.username || userId}</div>}
                        description={<div className="convo-desc">{lastMessage?.text || '...'}</div>}
                      />
                      {convo.unread > 0 && <div className="unread-badge">{convo.unread}</div>}
                    </List.Item>
                  );
                }}
              />
            </div>
            <div className="chat-area">
              {selectedConversationId ? (
                <>
                  {/* --- START: HOÀN THIỆN GIAO DIỆN ADMIN --- */}
                  <div className="messenger-header">
                    {/* --- HIỂN THỊ AVATAR VÀ TÊN THẬT TRONG HEADER --- */}
                    <div className="messenger-header-left">
                      <Avatar src={conversations[selectedConversationId]?.userInfo?.avatar} icon={<UserOutlined />} size={40} />
                      <div className="messenger-header-title" style={{ marginLeft: 12 }}>
                        <div style={{ fontWeight: 600 }}>{conversations[selectedConversationId]?.userInfo?.username || selectedConversationId}</div>
                        <div style={{ fontSize: 12, color: '#fff' }}>
                          {/* Typing indicator có thể thêm sau */}
                          🟢 Trực tuyến
                        </div>
                      </div>
                    </div>
                    <div className="messenger-header-right">
                      <CloseOutlined className="messenger-alert-icon" onClick={toggleMessenger} />
                    </div>
                  </div>

                  <div className="messenger-messages" ref={messagesContainerRef}>
                    {currentMessages.map((m) => (
                      <div key={m.id} className={getMessageClass(m.sender)}>
                        {renderMessage(m)}
                        <div className="message-footer">
                          <span className="message-time">{formatTime(new Date(m.timestamp))}</span>
                          {m.sender === currentUserRole && (
                            <span className="read-status">✓✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {/* Typing indicator có thể thêm sau nếu cần */}
                  </div>

                  <div className="messenger-input">
                    <div className="messenger-textarea">
                      <Input.TextArea
                        rows={2}
                        value={inputValue}
                        onChange={handleInputChange}
                        onPressEnter={(e) => {
                          if (!e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Gửi tin nhắn..."
                      />
                    </div>
                    <div className="messenger-send-row">
                      <button
                        className="icon-action-button emoji-button"
                        title="Emoji"
                        onClick={() => setShowEmojiPicker((s) => !s)}
                      >
                        <SmileOutlined />
                      </button>
                      <button
                        className="icon-action-button picture-button"
                        title="Gửi ảnh"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      >
                        <PictureOutlined />
                      </button>
                      <button className="send-icon-button" onClick={handleSendMessage}>
                        <SendOutlined />
                      </button>
                    </div>
                    {showEmojiPicker && (
                      <div className="emoji-picker">
                        {emojiList.map((em) => (
                          <button key={em} className="emoji-btn" onClick={() => insertEmoji(em)} type="button">{em}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* --- END: HOÀN THIỆN GIAO DIỆN ADMIN --- */}
                </>
              ) : (
                <div className="no-conversation-selected">Chọn một cuộc trò chuyện để bắt đầu</div>
              )}
            </div>
          </div>
        )}
        <FloatButton 
          icon={isMessengerOpen ? <CloseOutlined /> : <WechatOutlined />} 
          onClick={toggleMessenger}
          type="primary"
          style={{ right: 24, bottom: 24, transform: 'scale(1.5)' }}
          tooltip={<div>{isMessengerOpen ? 'Đóng Chat' : 'Mở Chat'}</div>}
        />
      </>
    )
  }

  return (
    <>
      {isPopupVisible && (
        <Card
          className="support-popup-card"
          bordered={false}
          bodyStyle={{ padding: '0 24px 24px 24px' }}
          title={
            <div className="support-popup-header">
              <Title level={4} style={{ margin: 0 }}>Chọn kênh hỗ trợ</Title>
            </div>
          }
        >
          <List
            itemLayout="horizontal"
            dataSource={supportOptions}
            renderItem={item => (
              <List.Item
                className="support-option-item"
                actions={[
                  <a href={item.link} target="_blank" rel="noopener noreferrer" key="list-loadmore-edit">
                    <SendOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                  </a>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.icon} size="large" />}
                  title={<a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>}
                  description={<Text type="secondary">{item.description}</Text>}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {isMessengerOpen && (
        <div className="messenger-panel">
          <div className="messenger-header">
            <div className="messenger-header-left">
              <Avatar src="https://i.imgur.com/W0ESUyO.jpeg" size={48} />
              <div className="messenger-header-title" style={{ marginLeft: 12 }}>
                <div style={{ fontWeight: 600 }}>Hỗ trợ trực tiếp</div>
                <div style={{ fontSize: 12, color: '#fff' }}>
                  {isAdminTyping ? '🟢 Đang gõ...' : '🟢 Trực tuyến'}
                </div>
              </div>
            </div>
            <div className="messenger-header-right">
              <ExclamationCircleOutlined className="messenger-alert-icon" />
            </div>
          </div>

          <div className="messenger-messages" ref={messagesContainerRef}>
            {currentMessages.map((m) => (
              <div key={m.id} className={getMessageClass(m.sender)}>
                {renderMessage(m)}
                <div className="message-footer">
                  <span className="message-time">{formatTime(m.timestamp)}</span>
                  {m.sender === currentUserRole && currentUserRole === 'user' && (
                    <span className="read-status">
                      {m.isRead ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isAdminTyping && (
              <div className="message-item other-user">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {currentUserRole === 'user' && currentMessages.length === 1 && (
            <div className="quick-replies">
              {quickReplies.map((reply, idx) => (
                <button 
                  key={idx}
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div className="messenger-input">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div className="messenger-textarea">
              <Input.TextArea
                rows={2}
                value={inputValue}
                onChange={handleInputChange}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Gửi tin nhắn..."
              />
            </div>

            <div className="messenger-send-row">
              <button
                className="icon-action-button emoji-button"
                title="Emoji"
                onClick={() => setShowEmojiPicker((s) => !s)}
                aria-label="Emoji picker"
              >
                <SmileOutlined />
              </button>

              <button
                className="icon-action-button picture-button"
                title="Gửi ảnh"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                aria-label="Gửi ảnh"
              >
                <PictureOutlined />
              </button>

              <button className="send-icon-button" onClick={handleSendMessage} aria-label="Gửi">
                <SendOutlined />
              </button>
            </div>

            {showEmojiPicker && (
              <div className="emoji-picker">
                {emojiList.map((em) => (
                  <button key={em} className="emoji-btn" onClick={() => insertEmoji(em)} type="button">
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <FloatButton
        className="chat-bubble-float-btn messenger-btn"
        icon={isMessengerOpen ? <CloseOutlined /> : <WechatOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 100,
          zIndex: 1001,
        }}
        onClick={toggleMessenger}
        tooltip={<div>{isMessengerOpen ? 'Đóng Messenger' : 'Mở Messenger'}</div>}
      />

      <FloatButton
        className="chat-bubble-float-btn support-btn"
        icon={isPopupVisible ? <CloseOutlined /> : <CustomerServiceOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 24,
          zIndex: 1001,
        }}
        onClick={togglePopup}
        tooltip={<div>{isPopupVisible ? 'Đóng hỗ trợ' : 'Mở hỗ trợ'}</div>}
      />
    </>
  );
};

export default ChatBubble;