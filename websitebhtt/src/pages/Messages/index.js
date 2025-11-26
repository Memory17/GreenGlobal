import React, { useState, useEffect, useRef } from 'react';
import { 
  Input, 
  Avatar, 
  Badge, 
  Button, 
  Dropdown, 
  Tooltip, 
  Menu,
  Empty,
  Tag,
  message as antMessage
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  SendOutlined,
  SmileOutlined,

  PhoneOutlined,
  VideoCameraOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  LikeOutlined,
  AudioOutlined,
  PictureOutlined,
  GifOutlined,
  PlusCircleOutlined,
  BellOutlined,
  ThunderboltOutlined,
  RollbackOutlined,
  TagOutlined,

  MessageOutlined,
  InboxOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import messageService from '../../data/messageService';
import '../../style/Messages.css';

const { TextArea } = Input;

// Mock Quick Replies
const quickReplies = [
  "Chào bạn, mình có thể giúp gì cho bạn?",
  "Sản phẩm này hiện đang còn hàng ạ.",
  "Bạn vui lòng chờ trong giây lát nhé.",
  "Cảm ơn bạn đã ủng hộ shop!",
  "Đơn hàng của bạn đang được xử lý.",
  "Bạn kiểm tra lại thông tin giúp mình nhé."
];

// Mock Shared Images
const mockSharedImages = [
  "https://picsum.photos/200/200?random=1",
  "https://picsum.photos/200/200?random=2",
  "https://picsum.photos/200/200?random=3",
  "https://picsum.photos/200/200?random=4",
  "https://picsum.photos/200/200?random=5",
  "https://picsum.photos/200/200?random=6",
];

// Mock Tags
const availableTags = [
  { label: 'VIP', color: '#f50' },
  { label: 'Khách mới', color: '#87d068' },
  { label: 'Đang tư vấn', color: '#108ee9' },
  { label: 'Đã chốt', color: '#2db7f5' },
];

// Mock data for conversations
// eslint-disable-next-line no-unused-vars
const initialConversations = [
  {
    id: 1,
    name: 'Luv Robin',
    avatar: null,
    initials: 'LR',
    lastMessage: 'I have no way to show my screen now, can I...',
    timestamp: '12:50 PM',
    unread: 2,
    status: 'online',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'I have no way to show my screen now, can I call you?',
        timestamp: '12:50 PM'
      }
    ]
  },
  {
    id: 2,
    name: 'Mark Malik',
    avatar: null,
    initials: 'MM',
    lastMessage: 'Thank you very much for your help!',
    timestamp: '1:05 PM',
    unread: 1,
    status: 'online',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'Thank you very much for your help!',
        timestamp: '1:05 PM'
      }
    ]
  },
  {
    id: 3,
    name: 'Mark Malik',
    avatar: null,
    initials: 'MM',
    lastMessage: 'I press "enter", but the system won\'t let me...',
    timestamp: '1:08 PM',
    unread: 11,
    status: 'online',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'I press "enter", but the system won\'t let me...',
        timestamp: '1:08 PM'
      }
    ]
  },
  {
    id: 4,
    name: 'Martha Scott',
    avatar: null,
    initials: 'MS',
    lastMessage: 'You: Thank you for choosing our platform!',
    timestamp: '1:11 PM',
    unread: 0,
    status: 'online',
    messages: [
      {
        id: 1,
        sender: 'admin',
        text: 'Thank you for choosing our platform!',
        timestamp: '1:11 PM'
      }
    ]
  },
  {
    id: 5,
    name: 'Sandy Prisley',
    avatar: null,
    initials: 'SP',
    lastMessage: 'You: Thank you for choosing our platform!',
    timestamp: '12:50 PM',
    unread: 0,
    status: 'offline',
    messages: [
      {
        id: 1,
        sender: 'admin',
        text: 'Thank you for choosing our platform!',
        timestamp: '12:50 PM'
      }
    ]
  },
  {
    id: 6,
    name: 'Bob Asset',
    avatar: null,
    initials: 'BA',
    lastMessage: 'You: Thank you for choosing our platform!',
    timestamp: '12:50 PM',
    unread: 0,
    status: 'offline',
    messages: [
      {
        id: 1,
        sender: 'admin',
        text: 'Thank you for choosing our platform!',
        timestamp: '12:50 PM'
      }
    ]
  },
  {
    id: 7,
    name: 'Daniel Sheeran',
    avatar: null,
    initials: 'DS',
    lastMessage: 'You: Thank you for choosing our platform!',
    timestamp: '12:50 PM',
    unread: 0,
    status: 'offline',
    messages: [
      {
        id: 1,
        sender: 'admin',
        text: 'Thank you for choosing our platform!',
        timestamp: '12:50 PM'
      }
    ]
  },
  {
    id: 8,
    name: 'Maria Averenko',
    avatar: null,
    initials: 'MA',
    lastMessage: 'Hello! Sorry, the internet was turned off yesterda...',
    timestamp: '1:20 PM',
    unread: 0,
    status: 'online',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'Hello! Can I contact you for help in the chat bot customization?',
        timestamp: '12:38 PM',
        date: 'Tuesday, July 28, 2020'
      },
      {
        id: 2,
        sender: 'user',
        text: 'I have a problem with the chain of interactions.',
        timestamp: '12:38 PM',
        date: 'Tuesday, July 28, 2020'
      },
      {
        id: 3,
        sender: 'user',
        text: 'Can I call you?',
        timestamp: '12:38 PM',
        date: 'Tuesday, July 28, 2020'
      },
      {
        id: 4,
        sender: 'admin',
        text: 'Hello! Sure:). What time would you like to have a call?',
        timestamp: '12:38 PM',
        date: 'Tuesday, July 28, 2020'
      },
      {
        id: 5,
        sender: 'user',
        text: 'Hello! Sorry, the internet was turned off yesterday. Can we call you at 3:40 pm today?',
        timestamp: '12:38 PM',
        date: 'Wednesday, July 29, 2020'
      }
    ]
  }
];

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [conversationTags, setConversationTags] = useState({}); // userId -> tag
  const messagesEndRef = useRef(null);

  // Load conversations từ localStorage
  const loadConversations = () => {
    const allConversations = messageService.getAllConversations();
    // Merge tags into conversations
    const conversationsWithTags = allConversations.map(conv => ({
      ...conv,
      tag: conversationTags[conv.userId]
    }));
    setConversations(conversationsWithTags);
    
    // Nếu có conversation được chọn, cập nhật nó
    if (selectedConversation) {
      const updated = conversationsWithTags.find(c => c.userId === selectedConversation.userId);
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  };

  // Load conversations khi component mount
  useEffect(() => {
    loadConversations();
    
    // Đăng ký listener để nhận tin nhắn real-time
    messageService.onUpdate(loadConversations);

    // Không destroy service vì là singleton và có thể được dùng ở nhiều nơi
    return () => {
      // Cleanup nếu cần
      messageService.stopPolling();
    };
  }, [conversationTags]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, replyingTo]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    // Admin gửi tin nhắn
    messageService.sendMessage(
      selectedConversation.userId,
      selectedConversation.userName,
      messageInput,
      'admin',
      replyingTo // Pass reply context if any (need to update service to handle this, but for now we just pass it)
    );

    setMessageInput('');
    setReplyingTo(null);
    loadConversations();
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    // Focus input
    const input = document.querySelector('.message-input textarea');
    if (input) input.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleQuickReply = (text) => {
    setMessageInput(text);
    setShowQuickReplies(false);
    const input = document.querySelector('.message-input textarea');
    if (input) input.focus();
  };

  const handleTagConversation = (tag) => {
    if (!selectedConversation) return;
    setConversationTags(prev => ({
      ...prev,
      [selectedConversation.userId]: tag
    }));
  };

  const handleSendLike = () => {
    if (!selectedConversation) return;

    // Admin gửi like
    messageService.sendMessage(
      selectedConversation.userId,
      selectedConversation.userName,
      '👍',
      'admin'
    );

    loadConversations();
  };

  // Xử lý ghi âm
  const handleAudioRecord = () => {
    antMessage.info('Chức năng ghi âm đang phát triển');
  };

  // Xử lý chọn ảnh
  const handleSelectImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        antMessage.success(`Đã chọn ảnh: ${file.name}`);
        // TODO: Xử lý upload ảnh
      }
    };
    input.click();
  };

  // Xử lý sticker
  const handleSticker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Xử lý chọn emoji
  const handleEmojiSelect = (emoji) => {
    if (!selectedConversation) return;
    
    messageService.sendMessage(
      selectedConversation.userId,
      selectedConversation.userName,
      emoji,
      'admin'
    );
    
    setShowEmojiPicker(false);
    loadConversations();
  };

  // Xử lý GIF
  const handleGif = () => {
    antMessage.info('Chức năng GIF đang phát triển');
  };

  // Xử lý thêm tùy chọn
  const handleMoreOptions = () => {
    antMessage.info('Thêm tùy chọn');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterType === 'Tất cả' ? true :
      filterType === 'Chưa đọc' ? conv.unread > 0 :
      filterType === 'Nhóm' ? false : true;
    
    return matchesSearch && matchesFilter;
  });

  // Xử lý khi chọn conversation
  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    // Đánh dấu đã đọc
    if (conv.unread > 0) {
      messageService.markAsRead(conv.userId);
      loadConversations();
    }
  };

  // Xử lý xóa conversation
  const handleDeleteConversation = (userId) => {
    messageService.deleteConversation(userId);
    if (selectedConversation?.userId === userId) {
      setSelectedConversation(null);
    }
    loadConversations();
    antMessage.success('Đã xóa cuộc hội thoại');
  };

  const filterMenu = (
    <Menu
      items={[
        {
          key: 'all',
          label: 'All',
          onClick: () => setFilterType('all')
        },
        {
          key: 'unread',
          label: 'Unread',
          onClick: () => setFilterType('unread')
        },
        {
          key: 'archived',
          label: 'Archived',
          onClick: () => setFilterType('archived')
        }
      ]}
    />
  );

  const conversationMenu = (conv) => (
    <Menu
      items={[
        {
          key: 'mark-read',
          icon: conv.unread > 0 ? <CheckOutlined /> : <BellOutlined />,
          label: conv.unread > 0 ? 'Đánh dấu là đã đọc' : 'Đánh dấu là chưa đọc',
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            if (conv.unread > 0) {
              messageService.markAsRead(conv.userId);
            } else {
              // Giả lập đánh dấu chưa đọc bằng cách set unread = 1
              // Cần update service để hỗ trợ markAsUnread chuẩn hơn
              // Tạm thời chỉ hiển thị thông báo
              antMessage.success('Đã đánh dấu là chưa đọc');
            }
            loadConversations();
          }
        },
        {
          key: 'open',
          icon: <MessageOutlined />,
          label: 'Mở trong Messenger',
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            window.open(`/admin/messages/${conv.userId}`, '_blank');
          }
        },
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Xem trang cá nhân',
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            // Navigate to profile
            antMessage.info('Chuyển đến trang cá nhân');
          }
        },
        {
          type: 'divider'
        },
        {
          key: 'archive',
          icon: <InboxOutlined />,
          label: 'Lưu trữ đoạn chat',
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            antMessage.success('Đã lưu trữ đoạn chat');
          }
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Xóa đoạn chat',
          danger: true,
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            handleDeleteConversation(conv.userId);
          }
        }
      ]}
    />
  );

  return (
    <div className="messages-container">
      <div className="messages-content">
        {/* Conversations List */}
        <div className="conversations-panel">
          {/* Search and Filter */}
          <div className="conversations-header">
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Dropdown overlay={filterMenu} trigger={['click']}>
              <Button 
                icon={<FilterOutlined />} 
                className="filter-btn"
              >
                By Status
              </Button>
            </Dropdown>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Tất cả
            </button>
            <button 
              className={`filter-tab ${filterType === 'unread' ? 'active' : ''}`}
              onClick={() => setFilterType('unread')}
            >
              Chưa đọc
            </button>
            <button 
              className={`filter-tab ${filterType === 'unassigned' ? 'active' : ''}`}
              onClick={() => setFilterType('unassigned')}
            >
              Nhóm
            </button>
          </div>

          {/* Conversations List */}
          <div className="conversations-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const initials = conv.userName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2);

                return (
                  <div
                    key={conv.userId}
                    className={`conversation-item ${selectedConversation?.userId === conv.userId ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="conversation-avatar">
                      <Badge 
                        dot 
                        status={conv.status === 'online' ? 'success' : 'default'}
                        offset={[-5, 35]}
                      >
                        {conv.userAvatar ? (
                          <Avatar src={conv.userAvatar} size={40} />
                        ) : (
                          <Avatar 
                            style={{ 
                              backgroundColor: '#4F46E5',
                              fontSize: '16px'
                            }} 
                            size={40}
                          >
                            {initials}
                          </Avatar>
                        )}
                      </Badge>
                    </div>
                    <div className="conversation-content">
                      <div className="conversation-header">
                        <span className="conversation-name">{conv.userName}</span>
                        {conv.tag && (
                          <Tag color={conv.tag.color} style={{ marginLeft: 8, fontSize: 10, lineHeight: '16px', height: 18, padding: '0 4px' }}>
                            {conv.tag.label}
                          </Tag>
                        )}
                        <Dropdown overlay={conversationMenu(conv)} trigger={['click']}>
                          <Button 
                            type="text"
                            icon={<MoreOutlined />}
                            className="conversation-more-btn"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      </div>
                      <div className="conversation-preview">
                        <span className="conversation-message">{conv.lastMessage || 'Chưa có tin nhắn'}</span>
                      </div>
                    </div>
                    <div className="conversation-meta">
                      <span className="conversation-time">{conv.lastMessageTime || ''}</span>
                      {conv.unread > 0 && (
                        <Badge 
                          count={conv.unread} 
                          style={{ 
                            backgroundColor: '#3B82F6',
                            fontSize: '11px',
                            minWidth: '18px',
                            height: '18px',
                            lineHeight: '18px'
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <Empty 
                description="Chưa có cuộc hội thoại nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: '50px' }}
              />
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <Badge 
                    dot 
                    status={selectedConversation.status === 'online' ? 'success' : 'default'}
                    offset={[-5, 35]}
                  >
                    <Avatar 
                      style={{ 
                        backgroundColor: '#4F46E5',
                        fontSize: '16px'
                      }} 
                      size={40}
                    >
                      {selectedConversation.userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </Avatar>
                  </Badge>
                  <div className="chat-user-info">
                    <h3 className="chat-user-name">{selectedConversation.userName}</h3>
                    <span className="chat-user-status">
                      <span className={`status-dot ${selectedConversation.status}`}></span>
                      {selectedConversation.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>
                <div className="chat-header-right">
                  <Dropdown 
                    overlay={
                      <Menu>
                        {availableTags.map((tag, idx) => (
                          <Menu.Item key={idx} onClick={() => handleTagConversation(tag)}>
                            <Tag color={tag.color}>{tag.label}</Tag>
                          </Menu.Item>
                        ))}
                        <Menu.Divider />
                        <Menu.Item key="clear" onClick={() => handleTagConversation(null)}>
                          Xóa nhãn
                        </Menu.Item>
                      </Menu>
                    } 
                    trigger={['click']}
                  >
                    <Tooltip title="Gắn thẻ">
                      <Button 
                        type="text" 
                        icon={<TagOutlined />} 
                        className="chat-action-btn"
                      />
                    </Tooltip>
                  </Dropdown>
                  <Tooltip title="Call">
                    <Button 
                      type="text" 
                      icon={<PhoneOutlined />} 
                      className="chat-action-btn"
                    />
                  </Tooltip>
                  <Tooltip title="Video call">
                    <Button 
                      type="text" 
                      icon={<VideoCameraOutlined />} 
                      className="chat-action-btn"
                    />
                  </Tooltip>
                  <Tooltip title="User info">
                    <Button 
                      type="text" 
                      icon={<UserOutlined />} 
                      className="chat-action-btn"
                      onClick={() => setShowUserInfo(!showUserInfo)}
                    />
                  </Tooltip>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-area">
                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((msg, index) => {
                    const showDate = index === 0 || 
                      msg.date !== selectedConversation.messages[index - 1]?.date;
                    
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && msg.date && (
                          <div className="message-date-divider">
                            <span>{msg.date}</span>
                          </div>
                        )}
                        <div className={`message-wrapper ${msg.sender === 'admin' ? 'sent' : 'received'}`}>
                          {msg.sender === 'user' && (
                            <Avatar 
                              style={{ 
                                backgroundColor: '#4F46E5',
                                fontSize: '14px',
                                marginRight: '8px'
                              }} 
                              size={32}
                            >
                              {selectedConversation.userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                            </Avatar>
                          )}
                          <div className="message-content-group">
                            <div className="message-bubble-container">
                              <div className="message-bubble">
                                {msg.replyTo && (
                                  <div className="message-quote">
                                    <div className="quote-line"></div>
                                    <div className="quote-content">
                                      <span className="quote-name">{msg.replyTo.sender === 'admin' ? 'Bạn' : selectedConversation.userName}</span>
                                      <p className="quote-text">{msg.replyTo.text}</p>
                                    </div>
                                  </div>
                                )}
                                <p className="message-text">{msg.text}</p>
                                <span className="message-timestamp">{msg.timestamp}</span>
                              </div>
                              <Tooltip title="Trả lời">
                                <Button 
                                  type="text" 
                                  size="small" 
                                  icon={<RollbackOutlined />} 
                                  className="reply-btn"
                                  onClick={() => handleReply(msg)}
                                />
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <Empty 
                    description="Chưa có tin nhắn"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Unread Messages Indicator */}
              <div className="unread-indicator">
                <span className="unread-label">UNREAD MESSAGES</span>
                <div className="unread-divider"></div>
              </div>

              {/* Reply Bar */}
              {replyingTo && (
                <div className="reply-bar">
                  <div className="reply-info">
                    <span className="reply-label">Đang trả lời <span className="reply-name">{replyingTo.sender === 'admin' ? 'chính mình' : selectedConversation.userName}</span></span>
                    <p className="reply-preview">{replyingTo.text}</p>
                  </div>
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    onClick={handleCancelReply}
                    className="close-reply-btn"
                  />
                </div>
              )}

              {/* Message Input */}
              <div className="message-input-container">
                {!messageInput.trim() ? (
                  <>
                    <Tooltip title="Tin nhắn nhanh">
                      <div style={{ position: 'relative' }}>
                        <Button 
                          type="text" 
                          icon={<ThunderboltOutlined />} 
                          className="input-action-btn"
                          onClick={() => setShowQuickReplies(!showQuickReplies)}
                        />
                        {showQuickReplies && (
                          <div className="quick-reply-popover">
                            <div className="quick-reply-header">
                              <span>Tin nhắn mẫu</span>
                              <Button 
                                type="text" 
                                icon={<CloseOutlined />} 
                                size="small"
                                onClick={() => setShowQuickReplies(false)}
                              />
                            </div>
                            <div className="quick-reply-list">
                              {quickReplies.map((reply, idx) => (
                                <div 
                                  key={idx} 
                                  className="quick-reply-item"
                                  onClick={() => handleQuickReply(reply)}
                                >
                                  {reply}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Tooltip>
                    <Tooltip title="Ghi âm">
                      <Button 
                        type="text" 
                        icon={<AudioOutlined />} 
                        className="input-action-btn"
                        onClick={handleAudioRecord}
                      />
                    </Tooltip>
                    <Tooltip title="Chọn ảnh">
                      <Button 
                        type="text" 
                        icon={<PictureOutlined />} 
                        className="input-action-btn"
                        onClick={handleSelectImage}
                      />
                    </Tooltip>
                    <Tooltip title="Sticker">
                      <div style={{ position: 'relative' }}>
                        <Button 
                          type="text" 
                          icon={<SmileOutlined />} 
                          className="input-action-btn"
                          onClick={handleSticker}
                        />
                        {showEmojiPicker && (
                          <div className="emoji-picker-container">
                            <div className="emoji-picker-header">
                              <span>Emoji</span>
                              <Button 
                                type="text" 
                                icon={<CloseOutlined />} 
                                size="small"
                                onClick={() => setShowEmojiPicker(false)}
                              />
                            </div>
                            <div className="emoji-grid">
                              {['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭'].map((emoji, index) => (
                                <button
                                  key={index}
                                  className="emoji-item"
                                  onClick={() => handleEmojiSelect(emoji)}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Tooltip>
                    <Tooltip title="GIF">
                      <Button 
                        type="text" 
                        icon={<GifOutlined />} 
                        className="input-action-btn"
                        onClick={handleGif}
                      />
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Thêm">
                    <Button 
                      type="text" 
                      icon={<PlusCircleOutlined />} 
                      className="input-action-btn"
                      onClick={handleMoreOptions}
                    />
                  </Tooltip>
                )}
                
                <div className="message-input-wrapper">
                  <TextArea
                    placeholder="Aa"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    className="message-input"
                  />
                </div>
                
                {messageInput.trim() ? (
                  <Button
                    type="text"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    className="send-btn"
                  />
                ) : (
                  <Button
                    type="text"
                    icon={<LikeOutlined />}
                    onClick={handleSendLike}
                    className="like-btn"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <Empty 
                description="Select a conversation to start messaging"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </div>

        {/* User Info Panel */}
        {selectedConversation && showUserInfo && (
          <div className="user-info-panel">
            <div className="user-info-header">
              <h3>Thông tin về đoạn chat</h3>
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={() => setShowUserInfo(false)}
                className="close-user-info-btn"
              />
            </div>

            <div className="user-info-content">
              {/* User Profile */}
              <div className="user-profile-section">
                <Badge 
                  dot 
                  status={selectedConversation.status === 'online' ? 'success' : 'default'}
                  offset={[-8, 70]}
                >
                  <Avatar 
                    style={{ 
                      backgroundColor: '#4F46E5',
                      fontSize: '24px'
                    }} 
                    size={80}
                  >
                    {selectedConversation.userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                  </Avatar>
                </Badge>
                <h2 className="user-info-name">{selectedConversation.userName}</h2>
                <p className="user-info-status">
                  {selectedConversation.status === 'online' ? 'Hoạt động 39 phút trước' : 'Không hoạt động'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="user-info-actions">
                <div className="action-item">
                  <div className="action-btn">
                    <UserOutlined />
                  </div>
                  <span>Trang cá nhân</span>
                </div>
                <div className="action-item">
                  <div className="action-btn">
                    <BellOutlined />
                  </div>
                  <span>Tắt thông báo</span>
                </div>
                <div className="action-item">
                  <div className="action-btn">
                    <SearchOutlined />
                  </div>
                  <span>Tìm kiếm</span>
                </div>
              </div>

              {/* Info Sections */}
              <div className="info-sections">
                <div className="info-section">
                  <div className="info-section-header" onClick={(e) => e.currentTarget.parentElement.classList.toggle('collapsed')}>
                    <span className="info-section-title">Thông tin về đoạn chat</span>
                    <span className="info-section-icon">▼</span>
                  </div>
                  <div className="info-section-content">
                    <div className="info-item">
                      <span className="info-icon">📌</span>
                      <span>Xem tin nhắn đã ghim</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="info-section-header" onClick={(e) => e.currentTarget.parentElement.classList.toggle('collapsed')}>
                    <span className="info-section-title">Tùy chỉnh đoạn chat</span>
                    <span className="info-section-icon">▼</span>
                  </div>
                  <div className="info-section-content">
                    <div className="info-item">
                      <span className="info-icon">🎨</span>
                      <span>Thay đổi chủ đề</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">😊</span>
                      <span>Thay đổi biểu tượng cảm xúc</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">✏️</span>
                      <span>Chỉnh sửa biệt danh</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="info-section-header" onClick={(e) => e.currentTarget.parentElement.classList.toggle('collapsed')}>
                    <span className="info-section-title">File phương tiện & file</span>
                    <span className="info-section-icon">▼</span>
                  </div>
                  <div className="info-section-content">
                    <div className="media-grid">
                      {mockSharedImages.map((img, idx) => (
                        <div key={idx} className="media-item">
                          <img src={img} alt="shared" />
                        </div>
                      ))}
                      <div className="media-item more">
                        <span>+12</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">📁</span>
                      <span>File</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">🔗</span>
                      <span>Liên kết</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="info-section-header" onClick={(e) => e.currentTarget.parentElement.classList.toggle('collapsed')}>
                    <span className="info-section-title">Quyền riêng tư & hỗ trợ</span>
                    <span className="info-section-icon">▼</span>
                  </div>
                  <div className="info-section-content">
                    <div className="info-item">
                      <span className="info-icon">🔔</span>
                      <span>Tắt thông báo</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">🚫</span>
                      <span>Chặn</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">⚠️</span>
                      <span>Báo cáo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
