import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoList from './TodoList';
import AdminPanel from './AdminPanel';
import '../index.css';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('todos');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

    // Check screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch admin stats if user is admin
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAdminStats();
    }
    
    // Add welcome notification
    setNotifications([
      {
        id: 1,
        type: 'success',
        message: `Welcome back, ${user.name || user.email}!`,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
      
      // Add stats notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: 'Admin statistics updated',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to load admin statistics',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  if (!user) return null;

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <header className="header">
        <div className="user-info">
          {user.picture ? (
            <img 
              src={user.picture} 
              alt={user.name} 
              className="user-avatar"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=6366f1&color=fff&size=48`;
              }}
            />
          ) : (
            <div className="user-avatar" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="user-details">
            <h2>{user.name || user.email}</h2>
            <span className={`role-badge ${user.role === 'ADMIN' ? 'admin-badge' : ''}`}>
              {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          {user.role === 'ADMIN' && (
            <div className="tabs">
              <button 
                className={`tab-btn ${activeTab === 'todos' ? 'active' : ''}`}
                onClick={() => setActiveTab('todos')}
              >
                <span className="tab-icon">📝</span>
                My Todos
              </button>
              <button 
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <span className="tab-icon">👑</span>
                Admin Panel
              </button>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification ${notification.type}`}
              onClick={() => removeNotification(notification.id)}
            >
              <span className="notification-icon">
                {notification.type === 'success' ? '✅' : 
                 notification.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span className="notification-message">{notification.message}</span>
              <span className="notification-close">×</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="content">
        {activeTab === 'todos' || user.role !== 'ADMIN' ? (
          <TodoList user={user} />
        ) : (
          <AdminPanel 
            user={user} 
            stats={stats} 
            onRefresh={fetchAdminStats}
            loading={loading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>🔐 Secure Todo App • OAuth2 + RBAC Implementation</p>
          <p className="footer-links">
            <span>User: {user.email}</span>
            <span>•</span>
            <span>Role: {user.role}</span>
            <span>•</span>
            <button 
              onClick={() => window.open('http://localhost:3001/debug', '_blank')}
              className="footer-link"
            >
              API Status
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;