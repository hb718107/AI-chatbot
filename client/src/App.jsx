import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, BarChart2, Settings, Bell, Shield, LogOut, Menu, ChevronLeft } from 'lucide-react';
import UserTable from './components/UserTable';
import ChatPanel from './components/ChatPanel';
import LoginModal from './components/LoginModal';
import AddUserModal from './components/AddUserModal';
import ChatHistoryView from './components/ChatHistoryView';
import Snackbar from './components/Snackbar';
import { fetchUsers, sendChatMessage, deleteUserDirect, fetchChatHistory } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('wpbrigade_saved_user') || null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello Admin! I can manage user records. Try commands like "add user john.smith@xyz.com" or "remove alex.chen@mail.co".' }
  ]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadChatHistory = async () => {
    try {
      const history = await fetchChatHistory();
      if (Array.isArray(history)) setChatHistory(history);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadChatHistory();
  }, []);

  const handleSendMessage = async (text) => {
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setIsLoading(true);
    try {
      const res = await sendChatMessage(text);
      if (res.users) setUsers(res.users);
      setMessages((prev) => [...prev, { sender: 'ai', text: res.responseText || 'Done!' }]);
      showToast(res.responseText || 'Command executed successfully', 'success');

      if (res.actionLog && res.actionLog.args) {
        const target = res.actionLog.args.email || res.actionLog.args.emailOrName;
        if (target) {
          setHighlightedId(target);
          setTimeout(() => setHighlightedId(null), 4000);
        }
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Failed to process command.' }]);
      showToast('Failed to process command.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (idOrEmail) => {
    try {
      const res = await deleteUserDirect(idOrEmail);
      if (res.users) setUsers(res.users);
      showToast('User record removed successfully.', 'success');
    } catch (err) {
      showToast('Failed to delete user.', 'error');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('wpbrigade_saved_token');
    localStorage.removeItem('wpbrigade_saved_user');
    setUser(null);
  };

  const handleDirectAddUser = async (userData) => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error('Failed to add user:', err);
    }
  };

  if (!user) {
    return <LoginModal onLogin={(username) => setUser(username)} />;
  }

  return (
    <div className="app-container">
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onAdd={handleDirectAddUser}
        />
      )}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'flex-end', marginBottom: '20px' }}>
          <button
            className="btn-icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <ul className="sidebar-menu">
          <li
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
          >
            <LayoutDashboard size={18} />
            <span className="sidebar-item-text">Dashboard</span>
          </li>
          <li
            className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            title="User Management"
          >
            <Users size={18} />
            <span className="sidebar-item-text">User Management</span>
          </li>
          <li
            className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); loadChatHistory(); }}
            title="AI Chat History"
          >
            <MessageSquare size={18} />
            <span className="sidebar-item-text">AI Chat History</span>
          </li>
          <li
            className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings"
          >
            <Settings size={18} />
            <span className="sidebar-item-text">Settings</span>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="sidebar-brand-icon">
              <Shield size={20} color="#fff" />
            </div>
            <h1 className="page-title" style={{ fontSize: 20 }}>
              {activeTab === 'history' ? 'AI Chat History & Audit Logs' : 'WPBrigade AI Portal'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button className="btn-icon">
              <Bell size={20} />
            </button>
            <div className="user-profile">
              <div className="avatar-img" style={{ width: 28, height: 28, fontSize: 12 }}>A</div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{user}</span>
            </div>
            <button className="btn-icon" onClick={handleLogout} title="Logout">
              <LogOut size={18} color="#EF4444" />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'history' ? (
            <ChatHistoryView history={chatHistory} />
          ) : (
            <UserTable
              users={filteredUsers}
              onDelete={handleDeleteUser}
              onSearch={setSearchQuery}
              searchQuery={searchQuery}
              onAddClick={() => setShowAddUserModal(true)}
              highlightedId={highlightedId}
            />
          )}
        </div>
      </div>

      <Snackbar
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Floating Messenger Icon Button */}
      <button
        className="floating-chat-toggle"
        onClick={() => setIsChatOpen(!isChatOpen)}
        title="Open AI Chat Assistant"
      >
        <MessageSquare size={26} />
        <div className="unread-badge" />
      </button>

      {/* Chat Popover Modal */}
      {isChatOpen && (
        <div className="chat-widget-modal">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onClear={() => setMessages([])}
            onClose={() => setIsChatOpen(false)}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
