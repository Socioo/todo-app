const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ 
    message: '✅ Backend is working!',
    timestamp: new Date().toISOString(),
    env: {
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      frontendUrl: process.env.FRONTEND_URL || 'Not set'
    }
  });
});

// Auth test endpoint
app.get('/auth/google', (req, res) => {
  res.json({ 
    message: 'Auth endpoint is reachable',
    nextStep: 'Will redirect to Google OAuth'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`✅ Test endpoint: http://localhost:${PORT}/test`);
  console.log(`✅ Auth endpoint: http://localhost:${PORT}/auth/google`);
});