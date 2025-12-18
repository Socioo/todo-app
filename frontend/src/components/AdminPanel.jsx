import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';

const AdminPanel = ({ user, stats, onRefresh, loading }) => {
  const [users, setUsers] = useState([]);
  const [allTodos, setAllTodos] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const usersResponse = await axios.get('/api/admin/users');
      setUsers(usersResponse.data);
      
      // Fetch all todos
      const todosResponse = await axios.get('/api/todos/admin/all');
      setAllTodos(todosResponse.data);
      
      setError('');
      showNotification('success', 'Admin data refreshed');
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      showNotification('error', 'Failed to load admin data');
    }
  };

  const showNotification = (type, message) => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const updateUserRole = async (userId, newRole, userEmail) => {
    if (!window.confirm(`Change ${userEmail}'s role to ${newRole}?`)) return;

    try {
      await axios.put(`/api/admin/users/${userId}/role`, {
        role: newRole
      });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      showNotification('success', `User role updated to ${newRole}`);
    } catch (err) {
      console.error('Failed to update user role:', err);
      showNotification('error', 'Failed to update user role');
    }
  };

  const deleteTodo = async (todoId, todoTitle) => {
    if (!window.confirm(`Delete todo "${todoTitle}"?`)) return;

    try {
      await axios.delete(`/api/todos/admin/${todoId}`);
      setAllTodos(allTodos.filter(todo => todo.id !== todoId));
      showNotification('success', 'Todo deleted');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete todo:', err);
      showNotification('error', 'Failed to delete todo');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTodos = allTodos.filter(todo =>
    todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    todo.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeData = activeTab === 'users' ? filteredUsers : filteredTodos;

  return (
    <div className="admin-panel fade-in">
      <div className="admin-header">
        <h2>
          <span className="admin-icon">👑</span>
          Admin Dashboard
        </h2>
        <div className="admin-subtitle">
          Manage users, todos, and monitor system activity
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Controls */}
      <div className="admin-controls">
        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="control-buttons">
          <button 
            onClick={fetchAdminData} 
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
          </button>
          
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users ({users.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'todos' ? 'active' : ''}`}
              onClick={() => setActiveTab('todos')}
            >
              📝 Todos ({allTodos.length})
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-section">
          <h3>📊 System Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
              <div className="stat-detail">
                {stats.usersByRole?.ADMIN || 0} Admin, {stats.usersByRole?.USER || 0} User
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{stats.totalTodos}</div>
              <div className="stat-label">Total Todos</div>
              <div className="stat-detail">
                {stats.completedTodos} completed ({stats.completionRate}%)
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-value">{stats.completionRate}%</div>
              <div className="stat-label">Completion Rate</div>
              <div className="stat-detail">
                {stats.completedTodos} of {stats.totalTodos} todos
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-value">{stats.recentActivity?.length || 0}</div>
              <div className="stat-label">Recent Activity</div>
              <div className="stat-detail">Last 10 actions</div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="data-section">
        <div className="section-header">
          <h3>
            {activeTab === 'users' ? '👥 User Management' : '📝 All Todos'}
            <span className="count-badge">{activeData.length}</span>
          </h3>
          <div className="results-info">
            Showing {activeData.length} of {activeTab === 'users' ? users.length : allTodos.length} {activeTab}
          </div>
        </div>

        <div className="data-table">
          {activeTab === 'users' ? (
            <div className="users-list">
              {filteredUsers.map(userItem => (
                <div key={userItem.id} className="user-card">
                  <div className="user-avatar">
                    {userItem.picture ? (
                      <img 
                        src={userItem.picture} 
                        alt={userItem.name} 
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.name || userItem.email)}&background=6366f1&color=fff&size=40`;
                        }}
                      />
                    ) : (
                      <div className="avatar-fallback">
                        {(userItem.name || userItem.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="user-info">
                    <div className="user-name">{userItem.name || 'No name'}</div>
                    <div className="user-email">{userItem.email}</div>
                    <div className="user-meta">
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        Joined {formatDate(userItem.createdAt)}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📝</span>
                        {userItem._count?.todos || 0} todos
                      </span>
                    </div>
                  </div>
                  
                  <div className="user-actions">
                    <select 
                      value={userItem.role}
                      onChange={(e) => updateUserRole(userItem.id, e.target.value, userItem.email)}
                      className="role-select"
                      disabled={userItem.id === user.id}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    
                    {userItem.id === user.id && (
                      <span className="current-user-badge">You</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="todos-list">
              {filteredTodos.slice(0, 20).map(todo => (
                <div key={todo.id} className="todo-card">
                  <div className="todo-status">
                    <div className={`status-indicator ${todo.completed ? 'completed' : 'active'}`}>
                      {todo.completed ? '✓' : '○'}
                    </div>
                  </div>
                  
                  <div className="todo-info">
                    <div className="todo-title">{todo.title}</div>
                    {todo.description && (
                      <div className="todo-description">{todo.description}</div>
                    )}
                    <div className="todo-meta">
                      <span className="meta-item">
                        <span className="meta-icon">👤</span>
                        {todo.user?.email}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        {formatDate(todo.createdAt)}
                      </span>
                      {todo.dueDate && (
                        <span className="meta-item">
                          <span className="meta-icon">⏰</span>
                          Due: {formatDate(todo.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="todo-actions">
                    <button 
                      onClick={() => deleteTodo(todo.id, todo.title)}
                      className="delete-btn"
                      title="Delete todo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredTodos.length > 20 && (
                <div className="show-more">
                  ... and {filteredTodos.length - 20} more todos
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="action-buttons">
          <button 
            onClick={() => window.location.reload()}
            className="action-btn"
          >
            🔄 Reload Page
          </button>
          <button 
            onClick={() => window.open('http://localhost:3001/debug', '_blank')}
            className="action-btn"
          >
            🔧 API Debug
          </button>
          <button 
            onClick={() => window.open('http://localhost:3001/auth/google', '_blank')}
            className="action-btn"
          >
            🔐 Test OAuth
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;