import React from 'react';
import '../index.css';

const Login = ({ error }) => {
  const handleGoogleLogin = () => {
    console.log('🔗 Initiating Google OAuth...');
    window.location.href = 'http://localhost:3001/auth/google';
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* App Header */}
        <div className="app-logo">
          <h1>📝 Secure Todo</h1>
          <p className="app-subtitle">Modern Authentication & RBAC Demo</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="login-error">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <div className="error-details">
                <strong>Authentication Error</strong>
                <p>{error}</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Login Card */}
        <div className="login-card">
          <div className="card-header">
            <h2>Welcome Back</h2>
            <p className="card-subtitle">Sign in to manage your secure todo list</p>
          </div>
          
          <button 
            onClick={handleGoogleLogin} 
            className="google-login-btn"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="google-icon"
            />
            <span>Continue with Google</span>
          </button>
          
          <div className="login-info">
            <h4>🔐 How it Works</h4>
            <div className="steps">
              <div className="step">
                <span className="step-number">1</span>
                <span>Click "Continue with Google"</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span>Authorize in Google popup</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span>Access your secure dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="feature-section">
          <h3>🎯 Project Features</h3>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h4>OAuth2/OIDC</h4>
              <p>Industry-standard authentication</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h4>RBAC System</h4>
              <p>Role-based permissions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h4>Todo Management</h4>
              <p>Create & organize tasks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👑</div>
              <h4>Admin Dashboard</h4>
              <p>Full system control</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="tech-stack">
          <div className="stack-icons">
            <span className="stack-icon">⚛️</span>
            <span className="stack-icon">🟢</span>
            <span className="stack-icon">🗄️</span>
            <span className="stack-icon">🔑</span>
            <span className="stack-icon">🛡️</span>
          </div>
          <p>
            <strong>Tech Stack:</strong> React • Node.js • Express • PostgreSQL • Prisma • Google OAuth • JWT
          </p>
          <p className="project-note">
            School Project • OAuth2 + RBAC Implementation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;