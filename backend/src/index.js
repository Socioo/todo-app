const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

console.log('🔧 Environment check:');
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Import routes (CommonJS)
const authRoutes = require('./routes/auth.js');
const todoRoutes = require('./routes/todos.js');
const adminRoutes = require('./routes/admin.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      auth: 'ready'
    }
  });
});

// Debug route to check env variables
app.get('/debug', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    frontendUrl: process.env.FRONTEND_URL,
    jwtSecret: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
    nodeEnv: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

app.listen(PORT, () => {
  console.log(`
  🚀 Server started successfully!
  📍 Local: http://localhost:${PORT}
  🔗 Health check: http://localhost:${PORT}/health
  🔗 Debug info: http://localhost:${PORT}/debug
  🔐 Auth endpoint: http://localhost:${PORT}/auth/google
  🎯 Frontend: ${process.env.FRONTEND_URL}
  `);
});

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});