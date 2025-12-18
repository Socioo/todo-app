const { google } = require('googleapis');

const OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const authUrl = OAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['profile', 'email']
});

console.log('Generated Auth URL:');
console.log(authUrl);
console.log('\nCheck these:');
console.log('1. GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('2. URL starts with https://accounts.google.com/o/oauth2/v2/auth');