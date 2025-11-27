// Message Service - Quản lý tin nhắn giữa user và admin
const MESSAGES_STORAGE_KEY = 'chat_conversations';
const MESSAGE_CHANNEL = 'message_updates';

class MessageService {
  constructor() {
    this.channel = new BroadcastChannel(MESSAGE_CHANNEL);
    this.listeners = [];
    this.pollingInterval = null;
    this.lastUpdateTime = Date.now();
    
    // Bind methods
    this.notifyListeners = this.notifyListeners.bind(this);
    this.broadcastUpdate = this.broadcastUpdate.bind(this);
    this.startPolling = this.startPolling.bind(this);
    this.stopPolling = this.stopPolling.bind(this);
    
    // Lắng nghe storage event từ tab/window khác
    window.addEventListener('storage', (e) => {
      if (e.key === MESSAGES_STORAGE_KEY) {
        this.notifyListeners();
      }
    });
  }

  // Lấy tất cả conversations
  getAllConversations() {
    try {
      const data = localStorage.getItem(MESSAGES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading conversations:', error);
      return [];
    }
  }

  // Lấy conversation của một user cụ thể
  getConversation(userId) {
    const conversations = this.getAllConversations();
    return conversations.find(conv => conv.userId === userId);
  }

  // Tạo hoặc cập nhật conversation
  saveConversation(conversation) {
    try {
      const conversations = this.getAllConversations();
      const existingIndex = conversations.findIndex(
        conv => conv.userId === conversation.userId
      );

      if (existingIndex >= 0) {
        conversations[existingIndex] = {
          ...conversations[existingIndex],
          ...conversation,
          lastUpdated: new Date().toISOString()
        };
      } else {
        conversations.push({
          ...conversation,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }

      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(conversations));
      this.broadcastUpdate();
      return true;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return false;
    }
  }

  // Gửi tin nhắn mới
  sendMessage(userId, userName, message, sender = 'user') {
    const conversation = this.getConversation(userId) || {
      userId,
      userName,
      userAvatar: null,
      messages: [],
      unread: 0,
      status: 'online'
    };

    const newMessage = {
      id: Date.now(),
      sender, // 'user' hoặc 'admin'
      text: message,
      timestamp: new Date().toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      date: new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      read: false
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = message;
    conversation.lastMessageTime = newMessage.timestamp;
    
    // Tăng số tin nhắn chưa đọc nếu là user gửi
    if (sender === 'user') {
      conversation.unread = (conversation.unread || 0) + 1;
    }

    this.saveConversation(conversation);
    return newMessage;
  }

  // Admin đánh dấu đã đọc
  markAsRead(userId) {
    const conversation = this.getConversation(userId);
    if (conversation) {
      conversation.unread = 0;
      conversation.messages.forEach(msg => {
        msg.read = true;
      });
      this.saveConversation(conversation);
    }
  }

  // Admin xóa conversation
  deleteConversation(userId) {
    try {
      const conversations = this.getAllConversations();
      const filtered = conversations.filter(conv => conv.userId !== userId);
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(filtered));
      this.broadcastUpdate();
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  // Notify tất cả listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  // Lắng nghe thay đổi
  onUpdate(callback) {
    this.listeners.push(callback);
    
    // BroadcastChannel cho cùng tab
    this.channel.onmessage = () => {
      callback();
    };
    
    // Bắt đầu polling để kiểm tra update
    this.startPolling();
  }

  // Start polling để kiểm tra tin nhắn mới
  startPolling() {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(() => {
      const conversations = this.getAllConversations();
      const latestUpdate = conversations.reduce((latest, conv) => {
        const convTime = new Date(conv.lastUpdated || 0).getTime();
        return Math.max(latest, convTime);
      }, 0);
      
      if (latestUpdate > this.lastUpdateTime) {
        this.lastUpdateTime = latestUpdate;
        this.notifyListeners();
      }
    }, 1000); // Kiểm tra mỗi giây
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Broadcast thay đổi
  broadcastUpdate() {
    this.lastUpdateTime = Date.now();
    this.channel.postMessage({ type: 'update', timestamp: this.lastUpdateTime });
    
    // Trigger storage event cho các tab khác
    localStorage.setItem(MESSAGES_STORAGE_KEY + '_trigger', Date.now().toString());
    localStorage.removeItem(MESSAGES_STORAGE_KEY + '_trigger');
    
    // Notify listeners trong cùng tab
    this.notifyListeners();
  }

  // Đếm tổng số tin nhắn chưa đọc
  getTotalUnread() {
    const conversations = this.getAllConversations();
    return conversations.reduce((total, conv) => total + (conv.unread || 0), 0);
  }

  // Cleanup
  destroy() {
    this.stopPolling();
    this.channel.close();
    this.listeners = [];
  }
}

const messageServiceInstance = new MessageService();
export default messageServiceInstance;
