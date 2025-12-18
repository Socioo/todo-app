import React, { useState } from 'react';
import '../index.css';

const MobileNav = ({ user, activeTab, setActiveTab, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-left">
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
          <div className="mobile-app-title">
            <span className="mobile-app-icon">📝</span>
            <span>Todo App</span>
          </div>
        </div>
        
        <div className="mobile-user">
          {user.picture ? (
            <img 
              src={user.picture} 
              alt={user.name} 
              className="mobile-user-avatar"
            />
          ) : (
            <div className="mobile-user-avatar-fallback">
              {user.name?.charAt(0) || user.email.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="mobile-nav-menu">
          <div className="mobile-nav-header">
            <div className="mobile-nav-user-info">
              <h3>{user.name || user.email}</h3>
              <span className="mobile-nav-user-role">{user.role}</span>
            </div>
          </div>
          
          <div className="mobile-nav-items">
            {user.role === 'ADMIN' && (
              <>
                <button 
                  className={`mobile-nav-item ${activeTab === 'todos' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('todos');
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="mobile-nav-icon">📝</span>
                  My Todos
                </button>
                
                <button 
                  className={`mobile-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('admin');
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="mobile-nav-icon">👑</span>
                  Admin Panel
                </button>
                
                <div className="mobile-nav-divider"></div>
              </>
            )}
            
            <button 
              className="mobile-nav-item"
              onClick={() => {
                window.open('http://localhost:3001/debug', '_blank');
                setIsMenuOpen(false);
              }}
            >
              <span className="mobile-nav-icon">🔧</span>
              API Status
            </button>
            
            <button 
              className="mobile-nav-item"
              onClick={() => {
                onLogout();
                setIsMenuOpen(false);
              }}
            >
              <span className="mobile-nav-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;