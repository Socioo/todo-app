const express = require('express');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Create OAuth2 client
const OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 1. Start Google OAuth flow
router.get('/google', (req, res) => {
  const url = OAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });
  
  console.log('🔗 Redirecting to Google OAuth URL:', url);
  res.redirect(url);
});

// 2. Google callback handler
router.get('/google/callback', async (req, res) => {
  console.log('🔄 Google callback received with query:', req.query);
  
  try {
    const { code, error: googleError } = req.query;
    
    if (googleError) {
      console.error('❌ Google OAuth error:', googleError);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(googleError)}`);
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    // Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');
    let tokenResponse;
    try {
      tokenResponse = await OAuth2Client.getToken(code);
    } catch (tokenError) {
      console.error('❌ Token exchange failed:', tokenError.message);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_exchange_failed`);
    }
    
    const { tokens } = tokenResponse;
    console.log('✅ Tokens received');
    OAuth2Client.setCredentials(tokens);

    // Get user info from Google
    console.log('🔄 Getting user info from Google...');
    const oauth2 = google.oauth2({
      version: 'v2',
      auth: OAuth2Client
    });
    
    let googleUserInfo;
    try {
      const userInfoResponse = await oauth2.userinfo.get();
      googleUserInfo = userInfoResponse.data;
      console.log('✅ Google user info:', {
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        hasPicture: !!googleUserInfo.picture
      });
    } catch (userInfoError) {
      console.error('❌ Failed to get user info:', userInfoError.message);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=user_info_failed`);
    }

    if (!googleUserInfo || !googleUserInfo.email) {
      console.error('❌ No email in Google user info');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_email`);
    }

    // Simple admin detection
    const isAdmin = googleUserInfo.email.includes('admin') || 
                   googleUserInfo.email.endsWith('@admin.com');

    console.log(`👤 User ${googleUserInfo.email} is ${isAdmin ? 'ADMIN' : 'USER'}`);

    // Create or update user in database
    let user;
    try {
      // Check if user exists
      user = await prisma.user.findUnique({
        where: { email: googleUserInfo.email }
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: googleUserInfo.email,
            name: googleUserInfo.name || googleUserInfo.email.split('@')[0],
            picture: googleUserInfo.picture || null,
            role: isAdmin ? 'ADMIN' : 'USER'
          }
        });
        console.log('✅ New user created:', user.email, 'Role:', user.role);
      } else {
        // Update existing user
        user = await prisma.user.update({
          where: { email: googleUserInfo.email },
          data: {
            name: googleUserInfo.name || user.name,
            picture: googleUserInfo.picture || user.picture,
          }
        });
        console.log('✅ Existing user logged in:', user.email, 'Role:', user.role);
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=database_error`);
    }

    // Create JWT token for your app
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || user.email.split('@')[0]
    };
    
    console.log('🔄 Creating JWT token with payload:', tokenPayload);
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ JWT token created successfully');
    
    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-callback?token=${encodeURIComponent(token)}`;
    console.log('🔗 Redirecting to:', redirectUrl);
    
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('💥 Unexpected error in OAuth callback:', error);
    console.error('Error stack:', error.stack);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=unexpected_error`);
  }
});

// 3. Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 Decoding token for /me endpoint');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      console.log('❌ User not found in database for id:', decoded.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found:', user.email);
    res.json(user);
  } catch (error) {
    console.error('❌ /me endpoint error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Logout successful. Please clear token on client side.' 
  });
});

// 5. Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'auth-service',
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;