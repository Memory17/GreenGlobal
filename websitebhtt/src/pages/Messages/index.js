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
  message as antMessage,
  Modal,
  Row,
  Col
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
  AudioOutlined,
  PictureOutlined,
  GifOutlined,
  PlusCircleOutlined,
  BellOutlined,
  ThunderboltOutlined,
  TagOutlined,

  MessageOutlined,
  InboxOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import messageService from '../../data/messageService';
import '../../style/Messages.css';

const { TextArea } = Input;

// Theme colors for messages
const THEME_COLORS = [
  { id: 'blue', name: 'Xanh dương', light: '#e7f3ff', dark: '#1677ff', gradient: 'linear-gradient(135deg, #1677ff 0%, #0c47ce 100%)' },
  { id: 'red', name: 'Đỏ', light: '#ffebe9', dark: '#ff4d4f', gradient: 'linear-gradient(135deg, #ff4d4f 0%, #d9363e 100%)' },
  { id: 'green', name: 'Xanh lá', light: '#f6ffed', dark: '#52c41a', gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)' },
  { id: 'purple', name: 'Tím', light: '#f9f0ff', dark: '#722ed1', gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)' },
  { id: 'orange', name: 'Cam', light: '#fff7e6', dark: '#fa8c16', gradient: 'linear-gradient(135deg, #fa8c16 0%, #d48806 100%)' },
  { id: 'pink', name: 'Hồng', light: '#fff0f6', dark: '#eb2f96', gradient: 'linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)' },
  { id: 'cyan', name: 'Cyan', light: '#e6fffb', dark: '#13c2c2', gradient: 'linear-gradient(135deg, #13c2c2 0%, #0a8080 100%)' },
  { id: 'gold', name: 'Vàng', light: '#fffbe6', dark: '#faad14', gradient: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)' },
];

// Emoji reactions for conversations
const CONVERSATION_EMOJIS = [
  { id: 'like', emoji: '👍', name: 'Thích' },
  { id: 'love', emoji: '❤️', name: 'Yêu thích' },
  { id: 'haha', emoji: '😂', name: 'Haha' },
  { id: 'wow', emoji: '😮', name: 'Wow' },
  { id: 'sad', emoji: '😢', name: 'Buồn' },
  { id: 'angry', emoji: '😠', name: 'Tức giận' },
  { id: 'fire', emoji: '🔥', name: 'Hot' },
  { id: 'star', emoji: '⭐', name: 'Sao' },
];

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
  const [conversationThemes, setConversationThemes] = useState({}); // userId -> theme
  const [conversationEmojis, setConversationEmojis] = useState({}); // userId -> emoji
  const [pinnedMessages, setPinnedMessages] = useState({}); // userId -> [messageIds]
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [conversationNicknames, setConversationNicknames] = useState({}); // userId -> nickname
  const [nicknameInput, setNicknameInput] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [messageMenuId, setMessageMenuId] = useState(null);
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

  // Handle theme change
  const handleThemeChange = (themeId) => {
    if (!selectedConversation) return;
    
    const newThemes = {
      ...conversationThemes,
      [selectedConversation.userId]: themeId
    };
    setConversationThemes(newThemes);
    
    // Save to localStorage
    localStorage.setItem(`chatTheme_${selectedConversation.userId}`, themeId);
    
    setShowThemeModal(false);
    antMessage.success('Đã thay đổi chủ đề');
  };

  // Handle emoji change
  const handleEmojiChange = (emojiId) => {
    if (!selectedConversation) return;
    
    const newEmojis = {
      ...conversationEmojis,
      [selectedConversation.userId]: emojiId
    };
    setConversationEmojis(newEmojis);
    
    // Save to localStorage
    localStorage.setItem(`chatEmoji_${selectedConversation.userId}`, emojiId);
    
    setShowEmojiModal(false);
    antMessage.success('Đã thay đổi biểu tượng');
  };

  // Handle nickname change
  const handleNicknameChange = () => {
    if (!selectedConversation) return;
    if (!nicknameInput.trim()) {
      antMessage.warning('Biệt danh không được để trống');
      return;
    }
    
    const newNicknames = {
      ...conversationNicknames,
      [selectedConversation.userId]: nicknameInput.trim()
    };
    setConversationNicknames(newNicknames);
    
    // Save to localStorage
    localStorage.setItem(`chatNickname_${selectedConversation.userId}`, nicknameInput.trim());
    
    setShowNicknameModal(false);
    setNicknameInput('');
    antMessage.success('Đã thay đổi biệt danh');
  };

  // Get current emoji for conversation
  const getCurrentEmoji = () => {
    if (!selectedConversation) return CONVERSATION_EMOJIS[0];
    const emojiId = conversationEmojis[selectedConversation.userId] || 'like';
    return CONVERSATION_EMOJIS.find(e => e.id === emojiId) || CONVERSATION_EMOJIS[0];
  };

  // Get current nickname for conversation
  const getCurrentNickname = () => {
    if (!selectedConversation) return '';
    return conversationNicknames[selectedConversation.userId] || selectedConversation.userName;
  };

  // Load theme for current conversation
  useEffect(() => {
    if (selectedConversation) {
      const savedTheme = localStorage.getItem(`chatTheme_${selectedConversation.userId}`);
      if (savedTheme && !conversationThemes[selectedConversation.userId]) {
        setConversationThemes(prev => ({
          ...prev,
          [selectedConversation.userId]: savedTheme
        }));
      }
      
      // Load emoji for current conversation
      const savedEmoji = localStorage.getItem(`chatEmoji_${selectedConversation.userId}`);
      if (savedEmoji && !conversationEmojis[selectedConversation.userId]) {
        setConversationEmojis(prev => ({
          ...prev,
          [selectedConversation.userId]: savedEmoji
        }));
      }

      // Load nickname for current conversation
      const savedNickname = localStorage.getItem(`chatNickname_${selectedConversation.userId}`);
      if (savedNickname && !conversationNicknames[selectedConversation.userId]) {
        setConversationNicknames(prev => ({
          ...prev,
          [selectedConversation.userId]: savedNickname
        }));
      }
    }
  }, [selectedConversation, conversationThemes, conversationEmojis, conversationNicknames]);

  // Get current theme
  const getCurrentTheme = () => {
    if (!selectedConversation) return THEME_COLORS[0];
    const themeId = conversationThemes[selectedConversation.userId] || 'blue';
    return THEME_COLORS.find(t => t.id === themeId) || THEME_COLORS[0];
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

  // Handle pin/unpin message
  const handlePinMessage = (messageId) => {
    if (!selectedConversation) return;

    const userId = selectedConversation.userId;
    const currentPinned = pinnedMessages[userId] || [];
    
    let newPinned;
    if (currentPinned.includes(messageId)) {
      // Unpin
      newPinned = currentPinned.filter(id => id !== messageId);
    } else {
      // Pin (max 5 pinned messages)
      if (currentPinned.length >= 5) {
        antMessage.warning('Tối đa 5 tin nhắn đã ghim');
        return;
      }
      newPinned = [...currentPinned, messageId];
    }

    setPinnedMessages(prev => ({
      ...prev,
      [userId]: newPinned
    }));

    // Save to localStorage
    localStorage.setItem(`pinnedMessages_${userId}`, JSON.stringify(newPinned));
    antMessage.success(currentPinned.includes(messageId) ? 'Đã bỏ ghim' : 'Đã ghim tin nhắn');
  };

  // Get pinned messages for current conversation
  const getPinnedMessages = () => {
    if (!selectedConversation) return [];
    const userId = selectedConversation.userId;
    const pinnedIds = pinnedMessages[userId] || [];
    
    return selectedConversation.messages.filter(msg => pinnedIds.includes(msg.id)) || [];
  };

  // Load pinned messages for current conversation
  useEffect(() => {
    if (selectedConversation) {
      const userId = selectedConversation.userId;
      const saved = localStorage.getItem(`pinnedMessages_${userId}`);
      if (saved && !pinnedMessages[userId]) {
        setPinnedMessages(prev => ({
          ...prev,
          [userId]: JSON.parse(saved)
        }));
      }
    }
  }, [selectedConversation, pinnedMessages]);

  const handleSendLike = () => {
    if (!selectedConversation) return;

    // Admin gửi emoji được chọn
    const currentEmoji = getCurrentEmoji();
    messageService.sendMessage(
      selectedConversation.userId,
      selectedConversation.userName,
      currentEmoji.emoji,
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
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          antMessage.error('Kích thước ảnh không được vượt quá 5MB');
          return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          antMessage.error('Chỉ hỗ trợ định dạng: JPG, PNG, GIF, WebP');
          return;
        }

        // Create image URL
        const imageUrl = URL.createObjectURL(file);
        
        // Send image message with image metadata
        messageService.sendMessage(
          selectedConversation.userId,
          selectedConversation.userName,
          imageUrl,
          'admin',
          null,
          {
            type: 'image',
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            isImage: true
          }
        );

        antMessage.success('Ảnh đã được gửi');
        loadConversations();
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
                const displayName = conversationNicknames[conv.userId] || conv.userName;
                const initials = displayName
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
                        <span className="conversation-name">{conversationNicknames[conv.userId] || conv.userName}</span>
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
                      {(conversationNicknames[selectedConversation.userId] || selectedConversation.userName).split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </Avatar>
                  </Badge>
                  <div className="chat-user-info">
                    <h3 className="chat-user-name">{conversationNicknames[selectedConversation.userId] || selectedConversation.userName}</h3>
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
              <div className={`messages-area theme-${getCurrentTheme().id}`}>
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
                        <div 
                          className={`message-wrapper ${msg.sender === 'admin' ? 'sent' : 'received'}`}
                          onMouseEnter={() => setHoveredMessageId(msg.id)}
                          onMouseLeave={() => setHoveredMessageId(null)}
                        >
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
                            {msg.metadata?.type === 'image' || msg.metadata?.isImage || (msg.text && (msg.text.startsWith('blob:') || msg.text.startsWith('data:image/') || msg.text.includes('base64') || /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.text))) ? (
                              <div style={{ maxWidth: '300px' }}>
                                <img 
                                  src={msg.text} 
                                  alt="shared" 
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '400px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'block'
                                  }}
                                  onClick={() => window.open(msg.text, '_blank')}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
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
                                
                                {/* Message Actions - Show on hover */}
                                {hoveredMessageId === msg.id && (
                                  <Dropdown
                                  menu={{
                                    items: [
                                      {
                                        key: 'reply',
                                        label: 'Trả lời',
                                        onClick: () => handleReply(msg)
                                      },
                                      {
                                        key: 'pin',
                                        label: pinnedMessages[selectedConversation?.userId]?.includes(msg.id) ? 'Bỏ ghim' : 'Ghim',
                                        onClick: () => {
                                          handlePinMessage(msg.id);
                                          setHoveredMessageId(null);
                                        }
                                      },
                                      {
                                        key: 'copy',
                                        label: 'Sao chép',
                                        onClick: () => {
                                          navigator.clipboard.writeText(msg.text);
                                          antMessage.success('Đã sao chép');
                                        }
                                      }
                                    ]
                                  }}
                                  trigger={['click']}
                                  placement="bottomRight"
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<MoreOutlined />}
                                    className="message-more-btn"
                                    onClick={() => setMessageMenuId(msg.id)}
                                    style={{ 
                                      fontSize: '16px',
                                      padding: '4px 8px',
                                      color: '#666'
                                    }}
                                  />
                                </Dropdown>
                              )}
                            </div>
                            )}
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
                    style={{ fontSize: '20px' }}
                    onClick={handleSendLike}
                    className="like-btn"
                  >
                    {getCurrentEmoji().emoji}
                  </Button>
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
                    {(conversationNicknames[selectedConversation.userId] || selectedConversation.userName).split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                  </Avatar>
                </Badge>
                <h2 className="user-info-name">{conversationNicknames[selectedConversation.userId] || selectedConversation.userName}</h2>
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
                    <div className="info-item" onClick={() => setShowPinnedModal(true)} style={{ cursor: 'pointer' }}>
                      <span className="info-icon">📌</span>
                      <span>Xem tin nhắn đã ghim ({getPinnedMessages().length})</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="info-section-header" onClick={(e) => e.currentTarget.parentElement.classList.toggle('collapsed')}>
                    <span className="info-section-title">Tùy chỉnh đoạn chat</span>
                    <span className="info-section-icon">▼</span>
                  </div>
                  <div className="info-section-content">
                    <div className="info-item" onClick={() => setShowThemeModal(true)} style={{ cursor: 'pointer' }}>
                      <span className="info-icon">🎨</span>
                      <span>Thay đổi chủ đề</span>
                    </div>
                    <div className="info-item" onClick={() => setShowEmojiModal(true)} style={{ cursor: 'pointer' }}>
                      <span className="info-icon">😊</span>
                      <span>Thay đổi biểu tượng cảm xúc</span>
                    </div>
                    <div className="info-item" onClick={() => {
                      setNicknameInput(getCurrentNickname());
                      setShowNicknameModal(true);
                    }} style={{ cursor: 'pointer' }}>
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

        {/* Theme Selection Modal */}
        <Modal
          title="Chọn chủ đề cho cuộc trò chuyện"
          open={showThemeModal}
          onCancel={() => setShowThemeModal(false)}
          footer={null}
          width={600}
          className="theme-modal"
        >
          <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
            {THEME_COLORS.map((theme) => (
              <Col key={theme.id} xs={12} sm={8} style={{ cursor: 'pointer' }}>
                <div
                  onClick={() => handleThemeChange(theme.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: conversationThemes[selectedConversation?.userId] === theme.id 
                      ? '3px solid #000' 
                      : '2px solid #ddd',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '60px',
                      borderRadius: '6px',
                      background: theme.gradient,
                      marginBottom: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                    {theme.name}
                  </span>
                </div>
              </Col>
            ))}
          </Row>
        </Modal>

        {/* Emoji Selection Modal */}
        <Modal
          title="Chọn biểu tượng cảm xúc"
          open={showEmojiModal}
          onCancel={() => setShowEmojiModal(false)}
          footer={null}
          width={600}
          className="emoji-modal"
        >
          <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
            {CONVERSATION_EMOJIS.map((emojiItem) => (
              <Col key={emojiItem.id} xs={12} sm={6} style={{ cursor: 'pointer' }}>
                <div
                  onClick={() => handleEmojiChange(emojiItem.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: conversationEmojis[selectedConversation?.userId] === emojiItem.id 
                      ? '3px solid #1677ff' 
                      : '2px solid #ddd',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    background: conversationEmojis[selectedConversation?.userId] === emojiItem.id 
                      ? '#f0f5ff' 
                      : '#fff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.background = '#f0f5ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    if (conversationEmojis[selectedConversation?.userId] !== emojiItem.id) {
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                    {emojiItem.emoji}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                    {emojiItem.name}
                  </span>
                </div>
              </Col>
            ))}
          </Row>
        </Modal>

        {/* Nickname Edit Modal */}
        <Modal
          title="Chỉnh sửa biệt danh"
          open={showNicknameModal}
          onCancel={() => {
            setShowNicknameModal(false);
            setNicknameInput('');
          }}
          onOk={handleNicknameChange}
          okText="Lưu"
          cancelText="Hủy"
          width={480}
          className="nickname-modal"
          style={{ borderRadius: '8px' }}
        >
          <div style={{ marginTop: '24px' }}>
            {/* Original Name Section */}
            <div style={{ 
              marginBottom: '24px', 
              padding: '16px', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #f5f7ff 0%, #f0f3ff 100%)',
              border: '1px solid #e1e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'rgba(22, 119, 255, 0.05)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)'
              }} />
              <span style={{ 
                fontSize: '11px', 
                color: '#8899bb', 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Tên gốc của người dùng
              </span>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#1677ff',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #1677ff 0%, #0c47ce 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {selectedConversation?.userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </span>
                {selectedConversation?.userName}
              </span>
            </div>

            {/* Nickname Input Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: '600', 
                color: '#333',
                fontSize: '13px'
              }}>
                Biệt danh mới
              </label>
              <Input
                placeholder="Nhập tên mà bạn muốn gọi..."
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                onPressEnter={handleNicknameChange}
                maxLength={50}
                style={{ 
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  fontSize: '14px',
                  padding: '10px 12px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1677ff';
                  e.target.style.boxShadow = '0 0 0 2px rgba(22, 119, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d9d9d9';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#999'
                }}>
                  {nicknameInput.length}/50 ký tự
                </span>
                {nicknameInput.length >= 45 && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#faad14'
                  }}>
                    ⚠️ Gần đạt giới hạn
                  </span>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {nicknameInput.trim() && (
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '6px', 
                background: '#f5f5f5',
                border: '1px dashed #e0e0e0',
                marginBottom: '16px'
              }}>
                <span style={{ 
                  fontSize: '11px', 
                  color: '#999', 
                  display: 'block', 
                  marginBottom: '6px'
                }}>
                  Xem trước:
                </span>
                <span style={{ 
                  fontSize: '13px', 
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {nicknameInput}
                </span>
              </div>
            )}

            {/* Info Message */}
            <div style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: '#e6f7ff',
              border: '1px solid #b3d8ff',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px', marginTop: '-2px' }}>ℹ️</span>
              <span style={{ 
                fontSize: '12px', 
                color: '#0050b3',
                lineHeight: '1.5'
              }}>
                Biệt danh này sẽ được hiển thị trong danh sách cuộc hội thoại để dễ nhận diện.
              </span>
            </div>
          </div>
        </Modal>

        {/* Pinned Messages Modal */}
        <Modal
          title={`Tin nhắn đã ghim (${getPinnedMessages().length})`}
          open={showPinnedModal}
          onCancel={() => setShowPinnedModal(false)}
          footer={null}
          width={600}
          className="pinned-messages-modal"
        >
          {getPinnedMessages().length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {getPinnedMessages().map((msg, idx) => (
                <div
                  key={msg.id}
                  style={{
                    padding: '12px',
                    marginBottom: '12px',
                    borderRadius: '8px',
                    background: msg.sender === 'admin' ? '#e7f3ff' : '#f5f5f5',
                    border: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                      {msg.sender === 'admin' ? 'Bạn' : selectedConversation?.userName} - {msg.timestamp}
                    </div>
                    <div style={{ fontSize: '14px', color: '#333' }}>
                      {msg.text}
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      handlePinMessage(msg.id);
                      // Refresh modal
                      setShowPinnedModal(true);
                    }}
                    style={{ color: '#ff4d4f', marginLeft: '8px' }}
                  >
                    Bỏ ghim
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              description="Chưa có tin nhắn đã ghim"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Messages;
