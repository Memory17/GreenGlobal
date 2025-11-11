import React, { useState, useRef, useEffect } from 'react';
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

// Import CSS, chúng ta sẽ dùng file này để định vị
import '../style/ChatBubble.css'; 

const { Text, Title } = Typography;

/**
 * Component ChatBubble (giờ đây là một Widget Hỗ trợ đầy đủ)
 * Nó tự quản lý state của mình, không cần App.js can thiệp.
 */
const ChatBubble = () => {
  // 1. State quản lý hiển thị popup, đặt BÊN TRONG component
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  // State cho messenger chat (giống Messenger)
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'admin', text: 'Xin chào! Tôi là hỗ trợ. Bạn cần giúp gì?' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Khi messages thay đổi, cuộn vùng messages xuống cuối (cuộn trong container, không cuộn toàn trang)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      // scroll to bottom smoothly
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // 2. Hàm để bật/tắt popup
  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
    // Khi mở support popup thì đóng messenger (tránh chồng giao diện)
    if (!isPopupVisible) setIsMessengerOpen(false);
  };

  const toggleMessenger = () => {
    setIsMessengerOpen((prev) => {
      const next = !prev;
      if (next) setIsPopupVisible(false); // đóng support khi mở messenger
      return next;
    });
  };

  // scroll handled by messagesContainerRef effect

  const handleSendMessage = () => {
    const text = inputValue && inputValue.trim();
    if (!text) return;
    const newMsg = { id: Date.now(), sender: 'user', type: 'text', text };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    // Simulate admin reply after short delay
    setTimeout(() => {
      const reply = { id: Date.now() + 1, sender: 'admin', type: 'text', text: 'Cảm ơn, chúng tôi sẽ phản hồi sớm.' };
      setMessages((prev) => [...prev, reply]);
    }, 900);
  };

  const handleImageSend = (dataUrl) => {
    if (!dataUrl) return;
    const imgMsg = { id: Date.now(), sender: 'user', type: 'image', content: dataUrl };
    setMessages((prev) => [...prev, imgMsg]);
    // simulated admin ack
    setTimeout(() => {
      const reply = { id: Date.now() + 1, sender: 'admin', type: 'text', text: 'Cảm ơn, chúng tôi đã nhận ảnh của bạn.' };
      setMessages((prev) => [...prev, reply]);
    }, 900);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleImageSend(ev.target.result);
    };
    reader.readAsDataURL(file);
    // reset input so same file can be selected later
    e.target.value = null;
  };

  const emojiList = ['😊','😁','😂','😮','😢','👍','🙏','🔥','🎉','💯','❤️','🤔'];
  const insertEmoji = (emoji) => {
    setInputValue((prev) => (prev ? prev + emoji : emoji));
    setShowEmojiPicker(false);
  };

  // 3. Dữ liệu các kênh hỗ trợ
  const supportOptions = [
    {
      id: 'zalo-247',
      icon: 'https://cdn-icons-png.flaticon.com/512/739/739178.png', // Zalo
      title: 'Hỗ trợ trực tuyến 24/7',
      description: 'Liên hệ qua Zalo để được hỗ trợ nhanh nhất',
      link: 'https://zalo.me/your-zalo-id' // Thay link Zalo của bạn
    },
    {
      id: 'zalo-group',
      icon: 'https://cdn-icons-png.flaticon.com/512/739/739178.png', // Zalo
      title: 'Nhóm Zalo',
      description: 'Cập nhật thông tin mới nhất và thảo luận',
      link: 'https://zalo.me/g/your-zalo-group-id' // Thay link nhóm Zalo
    },
    {
      id: 'telegram',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg', // Telegram
      title: 'Hỗ trợ qua Telegram',
      description: 'Tư vấn qua kênh Telegram',
      link: 'https://t.me/your-telegram-username' // Thay link Telegram
    },
  ];

  // Component trả về một Fragment chứa cả Popup và Nút bấm
  return (
    <>
      {/* 4. Popup Hỗ trợ (Chỉ hiện khi isPopupVisible = true) */}
      {isPopupVisible && (
        <Card
          className="support-popup-card" // Class CSS để định vị
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

      {/* Messenger-like chat panel (open when isMessengerOpen) */}
      {isMessengerOpen && (
        /* Use a plain div as the panel root so flex children are exactly header/messages/input
           (AntD Card can add extra wrapper elements which interferes with our flex math). */
        <div className="messenger-panel">
          <div className="messenger-header">
            <div className="messenger-header-left">
              <Avatar src="https://i.pravatar.cc/150?img=11" size={48} />
              <div className="messenger-header-title" style={{ marginLeft: 12 }}>
                <div style={{ fontWeight: 600 }}>Hỗ trợ trực tiếp</div>
                <div style={{ fontSize: 12, color: '#888' }}>Trực tuyến • Trả lời trong vài phút</div>
              </div>
            </div>

            <div className="messenger-header-right">
              <ExclamationCircleOutlined className="messenger-alert-icon" />
            </div>
          </div>

          <div className="messenger-messages" ref={messagesContainerRef}>
            {messages.map((m) => (
              <div key={m.id} className={`message-item ${m.sender === 'user' ? 'user' : 'admin'}`}>
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
                placeholder="Gửi tin nhắn cho hỗ trợ..."
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

      {/* 5. Nút tròn (Live Messenger) */}
      <FloatButton
        icon={isMessengerOpen ? <CloseOutlined /> : <WechatOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 88, /* đặt sát trên support bubble (24 + ~56 button + 8 gap) */
          zIndex: 1001,
          transform: 'scale(1.5)'
        }}
        onClick={toggleMessenger}
        tooltip={<div>{isMessengerOpen ? 'Đóng Messenger' : 'Mở Messenger'}</div>}
      />

      {/* 6. Nút tròn (Hỗ trợ nhanh - giữ như cũ) */}
      <FloatButton
        icon={isPopupVisible ? <CloseOutlined /> : <CustomerServiceOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 24,
          zIndex: 1001, // Đảm bảo nút này LUÔN nổi trên popup
          transform: 'scale(1.5)',
        }}
        onClick={togglePopup}
        tooltip={<div>{isPopupVisible ? 'Đóng hỗ trợ' : 'Mở hỗ trợ'}</div>}
      />
    </>
  );
};

export default ChatBubble;