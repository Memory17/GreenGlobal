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

import '../style/ChatBubble.css';

const { Text, Title } = Typography;

const channel = new BroadcastChannel('chat_channel');

const ChatBubble = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'admin', 
      type: 'text', 
      text: 'Xin chào! Tôi là hỗ trợ. Bạn cần giúp gì?',
      timestamp: new Date(Date.now() - 300000),
      isRead: true
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const location = useLocation();
  const currentUserRole = location.pathname.startsWith('/admin') ? 'admin' : 'user';

  // Typing indicator simulation
  useEffect(() => {
    const handleTypingMessage = (event) => {
      if (event.data.type === 'typing') {
        setIsAdminTyping(event.data.isTyping);
      } else if (event.data.sender !== currentUserRole) {
        setMessages((prev) => [...prev, event.data]);
        setIsAdminTyping(false);
      }
    };

    channel.addEventListener('message', handleTypingMessage);
    return () => {
      channel.removeEventListener('message', handleTypingMessage);
    };
  }, [currentUserRole]);

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

    const newMsg = { 
      id: Date.now(), 
      sender: currentUserRole, 
      type: 'text', 
      text,
      timestamp: new Date(),
      isRead: currentUserRole === 'admin' ? true : false
    };
    
    setMessages((prev) => [...prev, newMsg]);
    channel.postMessage(newMsg);
    
    // Stop typing indicator when message sent
    channel.postMessage({ type: 'typing', isTyping: false, sender: currentUserRole });
    
    setInputValue('');
  };

  const handleImageSend = (dataUrl) => {
    if (!dataUrl) return;
    const imgMsg = { 
      id: Date.now(), 
      sender: currentUserRole, 
      type: 'image', 
      content: dataUrl,
      timestamp: new Date(),
      isRead: currentUserRole === 'admin' ? true : false
    };
    
    setMessages((prev) => [...prev, imgMsg]);
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
            {messages.map((m) => (
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
        icon={isMessengerOpen ? <CloseOutlined /> : <WechatOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 88,
          zIndex: 1001,
          transform: 'scale(1.5)'
        }}
        onClick={toggleMessenger}
        tooltip={<div>{isMessengerOpen ? 'Đóng Messenger' : 'Mở Messenger'}</div>}
      />

      <FloatButton
        icon={isPopupVisible ? <CloseOutlined /> : <CustomerServiceOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 24,
          zIndex: 1001,
          transform: 'scale(1.5)',
        }}
        onClick={togglePopup}
        tooltip={<div>{isPopupVisible ? 'Đóng hỗ trợ' : 'Mở hỗ trợ'}</div>}
      />
    </>
  );
};

export default ChatBubble;