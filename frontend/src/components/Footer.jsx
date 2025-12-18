import React from 'react';
import '../index.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>📝 Secure Todo App</h4>
          <p>OAuth2 + RBAC Implementation</p>
          <p className="footer-tech">
            Built with React, Node.js, Express, PostgreSQL, Prisma
          </p>
        </div>
        
        <div className="footer-section">
          <h4>🔗 Quick Links</h4>
          <div className="footer-links">
            <a 
              href="http://localhost:3001/debug" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              API Status
            </a>
            <a 
              href="http://localhost:3001/health" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Health Check
            </a>
            <a 
              href="http://localhost:3001/auth/google" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Test OAuth
            </a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>🔐 Security Features</h4>
          <ul className="footer-features">
            <li>✅ Google OAuth2 Authentication</li>
            <li>✅ Role-Based Access Control</li>
            <li>✅ JWT Token Security</li>
            <li>✅ Secure API Endpoints</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {currentYear} Secure Todo App • School Project</p>
        <p className="footer-note">
          This is a demonstration project for educational purposes
        </p>
      </div>
    </footer>
  );
};

export default Footer;