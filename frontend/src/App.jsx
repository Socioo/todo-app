import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './index.css';

// Configure axios
axios.defaults.baseURL = 'http://localhost:3001';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for token in URL first (OAuth callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      setError(`Login failed: ${decodeURIComponent(errorParam)}`);
      setLoading(false);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (token) {
      console.log('🔄 Token found in URL, processing OAuth callback...');
      handleOAuthCallback(token);
      return;
    }
    
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log('🔄 Found stored token, verifying...');
      verifyToken(storedToken);
    } else {
      console.log('ℹ️ No token found, showing login page');
      setLoading(false);
    }
  }, []);

  const handleOAuthCallback = (token) => {
    console.log('✅ Processing OAuth callback with token');
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Verify token and fetch user
    verifyToken(token);
  };

  const verifyToken = async (token) => {
    try {
      setLoading(true);
      setError('');
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('🔄 Verifying token with backend...');
      const response = await axios.get('/auth/me');
      
      console.log('✅ User verified:', response.data.email);
      setUser(response.data);
      setError('');
    } catch (err) {
      console.error('❌ Token verification failed:', err.response?.data || err.message);
      
      // Clear invalid token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to verify session. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await axios.post('/auth/logout');
      } catch (err) {
        console.error('Logout API error:', err);
      } finally {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setError('');
        console.log('✅ User logged out');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span>⚠️ {error}</span>
            <button 
              onClick={() => setError('')}
              className="dismiss-btn"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {!user ? (
        <Login error={error} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;