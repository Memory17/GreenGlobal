import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FloatButton, Card, List, Avatar, Typography, Input } from 'antd';
import {
  CloseOutlined,
  SendOutlined,
  WechatOutlined,
  ExclamationCircleOutlined,
  SmileOutlined,
  PictureOutlined,
  CustomerServiceOutlined,
  
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import messageService from '../data/messageService';

import '../style/ChatBubble.css';

const { Text, Title } = Typography;

const channel = new BroadcastChannel('chat_channel');
// eslint-disable-next-line no-unused-vars
const LOCAL_CHAT_KEY = 'local_chat_messages_v1';

const ChatBubble = () => {
  const { currentUser } = useAuth();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Load tin nhắn từ messageService
  useEffect(() => {
    if (currentUser) {
      const conversation = messageService.getConversation(currentUser.id);
      if (conversation && conversation.messages) {
        setMessages(conversation.messages);
      } else {
        // Tin nhắn chào mừng mặc định
        const welcomeMsg = {
          id: 1,
          sender: 'admin',
          text: 'Xin chào! Tôi là hỗ trợ. Bạn cần giúp gì?',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString('vi-VN'),
          read: false
        };
        setMessages([welcomeMsg]);
      }
    }
  }, [currentUser]);

  // Lắng nghe tin nhắn mới từ admin
  useEffect(() => {
    if (!currentUser) return;

    // Load tin nhắn ban đầu
    const loadMessages = () => {
      const conversation = messageService.getConversation(currentUser.id);
      if (conversation && conversation.messages) {
        setMessages(conversation.messages);
      }
    };

    loadMessages();

    // Đăng ký listener để nhận tin nhắn real-time
    messageService.onUpdate(loadMessages);

    // Không destroy service khi unmount vì service là singleton
    return () => {
      // Chỉ cleanup listener, không destroy toàn bộ service
    };
  }, [currentUser]);
  const [inputValue, setInputValue] = useState('');
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [footerHeight, setFooterHeight] = useState(50);
  const [systemStatusOffset, setSystemStatusOffset] = useState(0);
  // distance from the viewport bottom to the TOP edge of the system-status element
  const [systemStatusTopOffset, setSystemStatusTopOffset] = useState(0);
  const [floatBtnHeight, setFloatBtnHeight] = useState(56);
  // Small manual nudge (in px) to ensure no overlap after collision calc
  // eslint-disable-next-line no-unused-vars
  const [manualNudge, setManualNudge] = useState(0);

  const location = useLocation();
  const currentUserRole = location.pathname.startsWith('/admin') ? 'admin' : 'user';

  // Extra margin above system status (in px)
  // Small upward nudge to ensure the floats don't overlap the footer system-status text
  const EXTRA_MARGIN = 92;
  // Visual scaling applied to the FloatButtons (keep in sync with transform scale in inline style)
  const FLOAT_SCALE = 1.5;
  // Calculate bottom offsets for floating buttons to avoid overlapping footer
  const calcBottom = (base) => {
    const baseWithFooter = base + footerHeight;
    // prefer using the top-offset of the status element so we ensure the float's TOP doesn't overlap
    const minFromStatus = systemStatusTopOffset ? Math.max(0, systemStatusTopOffset + EXTRA_MARGIN - floatBtnHeight)
      : (systemStatusOffset ? systemStatusOffset + EXTRA_MARGIN + floatBtnHeight : 0);
    // Always pick a bottom that keeps the button above both footer and system status
    // This avoids overlap at any screen width (desktop or mobile).
    return Math.max(baseWithFooter, minFromStatus, base) + (manualNudge || 0);
  };

  // Update footerHeight and system status offset when needed
  useEffect(() => {
    const updateFooterHeight = () => {
      try {
        const footer = document.querySelector('.AppFooter');
        const height = footer ? Math.round(footer.getBoundingClientRect().height) : 50;
        setFooterHeight(height);
        document.documentElement.style.setProperty('--app-footer-height', `${height}px`);
        // system status (distance from top to bottom of viewport -> distance from bottom)
        const statusElem = document.querySelector('.system-status-container');
        // distance from the viewport bottom to the bottom edge of the system-status element
        const statusOffset = statusElem ? Math.round(window.innerHeight - statusElem.getBoundingClientRect().bottom) : 0;
        setSystemStatusOffset(statusOffset);
        document.documentElement.style.setProperty('--app-status-offset', `${statusOffset}px`);
        // also compute distance from the viewport bottom to the TOP edge of the status element
        const statusTopOffset = statusElem ? Math.round(window.innerHeight - statusElem.getBoundingClientRect().top) : 0;
        setSystemStatusTopOffset(statusTopOffset);
        document.documentElement.style.setProperty('--app-status-top-offset', `${statusTopOffset}px`);
        document.documentElement.style.setProperty('--app-extra-margin', `${EXTRA_MARGIN}px`);
        // measure float button height (for bottom-calculation)
        const floatEls = document.querySelectorAll('.ant-float-btn');
        if (floatEls && floatEls.length) {
          let maxH = 0;
          floatEls.forEach((el) => { maxH = Math.max(maxH, el.offsetHeight); });
          const visualHeight = Math.round((maxH || 56) * FLOAT_SCALE);
          setFloatBtnHeight(visualHeight);
          document.documentElement.style.setProperty('--app-float-btn-height', `${visualHeight}px`);
        }
      } catch (e) {}
    };
    updateFooterHeight();
    window.addEventListener('resize', updateFooterHeight);
    const footerNode = document.querySelector('.AppFooter');
    const observer = footerNode ? new MutationObserver(updateFooterHeight) : null;
    if (observer && footerNode) observer.observe(footerNode, { attributes: true, childList: true, subtree: true });
    return () => {
      window.removeEventListener('resize', updateFooterHeight);
      if (observer) observer.disconnect();
    };
  }, []);

  // Typing indicator simulation
  useEffect(() => {
    const handleTypingMessage = (event) => {
        const data = event.data;
        if (data.type === 'typing') {
          setIsAdminTyping(data.isTyping);
        } else if (data.type === 'message_read') {
          setMessages((prev) => prev.map(m => ({ ...m, isRead: true })));
        } else if (data.sender !== currentUserRole) {
          // normalize timestamp to Date if necessary
          const normalized = { ...data, timestamp: data.timestamp ? new Date(data.timestamp) : new Date() };
          setMessages((prev) => [...prev, normalized]);
          setIsAdminTyping(false);
        }
      };

    channel.addEventListener('message', handleTypingMessage);
    return () => {
      channel.removeEventListener('message', handleTypingMessage);
    };
  }, [currentUserRole]);

  // Read/unread badge
  const unreadCount = messages.filter(m => !m.isRead && m.sender !== currentUserRole).length;

  // Handle user typing - broadcast typing status
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Broadcast typing indicator
    if (newValue.trim().length > 0 && !inputValue.trim().length) {
      // User started typing
      channel.postMessage({ type: 'typing', isTyping: true, sender: currentUserRole });
    } else if (newValue.trim().length === 0 && inputValue.trim().length > 0) {
      // User stopped typing
      channel.postMessage({ type: 'typing', isTyping: false, sender: currentUserRole });
    }
  };

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isAdminTyping]);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
    if (!isPopupVisible) setIsMessengerOpen(false);
  };

  const toggleMessenger = () => {
    setIsMessengerOpen((prev) => {
      const next = !prev;
      if (next) setIsPopupVisible(false);
      return next;
    });
  };

  const formatTime = (timestamp) => {
    // Xử lý trường hợp timestamp là string
    if (typeof timestamp === 'string') {
      return timestamp; // Đã được format sẵn
    }
    
    // Xử lý trường hợp timestamp là Date object
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
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
    if (!text || !currentUser) return;

    // Gửi tin nhắn qua messageService
    messageService.sendMessage(
      currentUser.id,
      currentUser.username || currentUser.email || 'Khách hàng',
      text,
      'user'
    );
    
    // Cập nhật local state
    const conversation = messageService.getConversation(currentUser.id);
    if (conversation && conversation.messages) {
      setMessages(conversation.messages);
    }
    
    setInputValue('');
  };

  // mark user-sent messages as read when admin opens the messenger
  useEffect(() => {
    if (isMessengerOpen && currentUserRole === 'admin') {
      const needUpdate = messages.some((m) => m.sender !== 'admin' && !m.isRead);
      if (needUpdate) {
        const updated = messages.map((m) => m.sender !== 'admin' ? { ...m, isRead: true } : m);
        setMessages(updated);
        // notify others
        channel.postMessage({ type: 'message_read', timestamp: Date.now() });
      }
    }
  }, [isMessengerOpen, currentUserRole, messages]);

  const handleImageSend = (dataUrl) => {
    if (!dataUrl || !currentUser) return;
    
    // Tạo object ảnh message
    const imgMsg = { 
      id: Date.now(), 
      sender: currentUserRole, 
      type: 'image', 
      content: dataUrl,
      text: dataUrl, // Lưu URL vào text để admin nhìn thấy
      timestamp: new Date(),
      isRead: currentUserRole === 'admin' ? true : false,
      metadata: {
        type: 'image',
        isImage: true
      }
    };
    
    // Cập nhật local state
    setMessages((prev) => [...prev, imgMsg]);
    
    // Gửi qua messageService để admin thấy
    if (currentUserRole === 'user') {
      messageService.sendMessage(
        currentUser.id,
        currentUser.username || currentUser.email || 'Khách hàng',
        dataUrl, // Gửi image URL
        'user',
        null,
        {
          type: 'image',
          isImage: true
        }
      );
    }
    
    // Gửi qua broadcast channel
    channel.postMessage(imgMsg);
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

  const emojiList = ['😊','😁','😂','😮','😢','👍','🙏','🔥','🎉','💯','❤️','🤔'];
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

  // Helper: group messages, and insert date separators
  const groupMessagesWithDates = (msgs) => {
    const out = [];
    let lastDate = null;
    msgs.forEach((m) => {
      const day = new Date(m.timestamp).toDateString();
      if (day !== lastDate) {
        out.push({ type: 'date', id: `d-${m.id}`, day });
        lastDate = day;
      }
      out.push({ type: 'message', ...m });
    });
    return out;
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

    // Kiểm tra nếu m.text là URL ảnh (blob, http, base64 hoặc data URL)
    if (m.text && (m.text.startsWith('blob:') || m.text.startsWith('http') || m.text.startsWith('data:image/') || m.text.includes('base64') || /\.(jpg|jpeg|png|gif|webp)$/i.test(m.text))) {
      return (
        <div className="message-bubble">
          <img 
            src={m.text} 
            alt="shared" 
            className="message-image"
            style={{
              maxWidth: '200px',
              maxHeight: '300px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'block'
            }}
            onClick={() => window.open(m.text, '_blank')}
            onError={(e) => {
              // Nếu ảnh load lỗi, hiển thị text thay thế
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div>${m.text}</div>`;
            }}
          />
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
            {groupMessagesWithDates(messages).map((m) => {
              if (m.type === 'date') {
                return (<div key={m.id} className="message-date-separator">{m.day}</div>);
              }
              return (
                <div key={m.id} className={getMessageClass(m.sender)}>
                  {renderMessage(m)}
                  <div className="message-footer">
                    <span className="message-time">{formatTime(m.timestamp)}</span>
                    {m.sender === currentUserRole && currentUserRole === 'user' && (
                      <span className="read-status">{m.isRead ? '✓✓' : '✓'}</span>
                    )}
                  </div>
                </div>
              );
            })}

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

          {currentUserRole === 'user' && messages.length === 1 && (
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
        className="chat-float-button"
        icon={isMessengerOpen ? <CloseOutlined /> : <WechatOutlined />}
        type="primary"
        style={{
          right: 14,
          bottom: calcBottom(48),
          zIndex: 1300,
        }}
        badge={{ count: unreadCount, offset: [2, 5], size: 'small' }}
        onClick={toggleMessenger}
        tooltip={<div>{isMessengerOpen ? 'Đóng Messenger' : 'Mở Messenger'}</div>}
      />

      <FloatButton
        className="chat-float-button"
        icon={isPopupVisible ? <CloseOutlined /> : <CustomerServiceOutlined />}
        type="primary"
        style={{
          right: 14,
          bottom: calcBottom(-20),
          zIndex: 1300,
          // transform removed, handled in CSS
        }}
        onClick={togglePopup}
        tooltip={<div>{isPopupVisible ? 'Đóng hỗ trợ' : 'Mở hỗ trợ'}</div>}
      />
    </>
  );
};

export default ChatBubble;