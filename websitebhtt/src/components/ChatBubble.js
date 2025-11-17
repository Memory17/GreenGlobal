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
  CustomerServiceOutlined
} from '@ant-design/icons';

import '../style/ChatBubble.css';

const { Text, Title } = Typography;

// --- Broadcast Channel for tab-to-tab communication ---
const channel = new BroadcastChannel('chat_channel');

const ChatBubble = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'admin', type: 'text', text: 'Xin chào! Tôi là hỗ trợ. Bạn cần giúp gì?' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // --- Determine role based on URL ---
  const location = useLocation();
  const currentUserRole = location.pathname.startsWith('/admin') ? 'admin' : 'user';

  // --- Effect for Broadcast Channel ---
  useEffect(() => {
    // Function to handle incoming messages
    const handleNewMessage = (event) => {
      const message = event.data;
      // Add message to state only if it's from the other role
      if (message.sender !== currentUserRole) {
        setMessages((prev) => [...prev, message]);
      }
    };

    // Add event listener
    channel.addEventListener('message', handleNewMessage);

    // Cleanup on component unmount
    return () => {
      channel.removeEventListener('message', handleNewMessage);
    };
  }, [currentUserRole]); // Re-run if role changes (e.g., admin logs out)

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

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

  // --- Updated message sending function ---
  const handleSendMessage = () => {
    const text = inputValue && inputValue.trim();
    if (!text) return;
    const newMsg = { id: Date.now(), sender: currentUserRole, type: 'text', text };
    
    // Add to local state
    setMessages((prev) => [...prev, newMsg]);
    // Broadcast to other tabs
    channel.postMessage(newMsg);
    
    setInputValue('');
  };

  // --- Updated image sending function ---
  const handleImageSend = (dataUrl) => {
    if (!dataUrl) return;
    const imgMsg = { id: Date.now(), sender: currentUserRole, type: 'image', content: dataUrl };
    
    // Add to local state
    setMessages((prev) => [...prev, imgMsg]);
    // Broadcast to other tabs
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

  // 👈 Hàm để xác định class cho tin nhắn dựa trên role hiện tại
  const getMessageClass = (senderRole) => {
    if (senderRole === currentUserRole) {
      return 'message-item current-user'; // Tin nhắn của người hiện tại (xanh)
    } else {
      return 'message-item other-user'; // Tin nhắn của người khác (xám)
    }
  };

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
                <div style={{ fontSize: 12, color: '#888' }}>Trực tuyến</div>
              </div>
            </div>
            <div className="messenger-header-right">
              <ExclamationCircleOutlined className="messenger-alert-icon" />
            </div>
          </div>

          <div className="messenger-messages" ref={messagesContainerRef}>
            {messages.map((m) => (
              <div key={m.id} className={getMessageClass(m.sender)}>
                {m.type === 'image' ? (
                  <div className="message-bubble">
                    <img src={m.content} alt="uploaded" className="message-image" />
                  </div>
                ) : (
                  <div className="message-bubble">{m.text}</div>
                )}
              </div>
            ))}
          </div>

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
                onChange={(e) => setInputValue(e.target.value)}
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