const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config(); // Load environment variables
const app = express();
const PORT = 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());

// Microsoft OAuth configuration
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || 'your-client-id';
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || 'your-client-secret';
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5001/api/auth/oauth-callback';
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';

// OAuth Login endpoint
app.get('/api/auth/oauth-login', (req, res) => {
  try {
    // Generate state parameter for security
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in session/cookie for validation
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=600`);
    
    // Microsoft OAuth URL - use tenant-specific endpoint
    const authUrl = new URL(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`);
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_mode', 'query');
    
    console.log('🔐 Redirecting to Microsoft OAuth:', authUrl.toString());
    
    // Redirect to Microsoft login
    res.redirect(302, authUrl.toString());
    
  } catch (error) {
    console.error('Error initiating OAuth login:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate login. Please try again later.',
      error: error.message
    });
  }
});

// OAuth Callback endpoint
app.get('/api/auth/oauth-callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    console.log('🔐 OAuth callback received:', { code: !!code, state: !!state, error });
    
    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect('http://localhost:3000/login?error=oauth_error');
    }
    
    // Validate state parameter
    const cookieState = req.headers.cookie?.match(/oauth_state=([^;]+)/)?.[1];
    console.log('🔍 State validation:', { 
      receivedState: state, 
      cookieState: cookieState, 
      cookies: req.headers.cookie 
    });
    
    if (!state || !cookieState || state !== cookieState) {
      console.error('❌ Invalid state parameter:', { state, cookieState });
      return res.redirect('http://localhost:3000/login?error=invalid_state');
    }
    
    console.log('✅ State validation passed');
    
    // Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.redirect('http://localhost:3000/login?error=token_exchange_failed');
    }
    
    const tokens = await tokenResponse.json();
    console.log('✅ Tokens received successfully');
    
    // Get user profile from Microsoft Graph
    console.log('👤 Fetching user profile...');
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile fetch failed:', errorText);
      return res.redirect('http://localhost:3000/login?error=profile_fetch_failed');
    }
    
    const profile = await profileResponse.json();
    
    // Get user profile photo from Microsoft Graph
    console.log('📸 Fetching user profile photo...');
    let profilePhoto = null;
    try {
      const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });
      
      if (photoResponse.ok) {
        const photoBuffer = await photoResponse.arrayBuffer();
        const photoBase64 = Buffer.from(photoBuffer).toString('base64');
        const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';
        profilePhoto = `data:${contentType};base64,${photoBase64}`;
        console.log('✅ User profile photo fetched successfully');
      } else {
        console.log('⚠️ No profile photo available, using default avatar');
      }
    } catch (error) {
      console.log('⚠️ Error fetching profile photo:', error.message);
    }
    
    console.log('✅ User profile:', { 
      name: profile.displayName, 
      email: profile.mail || profile.userPrincipalName,
      hasPhoto: !!profilePhoto
    });
    
    // Validate email domain
    const userEmail = profile.mail || profile.userPrincipalName;
    const allowedDomains = ['@castotravel.ph', '@casto.inc'];
    const isAllowedDomain = userEmail && allowedDomains.some(d => userEmail.toLowerCase().endsWith(d));
    if (!isAllowedDomain) {
      console.error('Invalid email domain:', userEmail);
      return res.redirect('http://localhost:3000/login?error=invalid_domain');
    }
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Set session cookies
    const cookies = [
      `hrd_session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      `hrd_user_email=${encodeURIComponent(userEmail)}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      `hrd_user_name=${encodeURIComponent(profile.displayName || '')}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
    ];
    
    // Store profile photo in memory with session token as key
    if (profilePhoto) {
      // Store photo in memory (in production, use Redis or database)
      global.userPhotos = global.userPhotos || {};
      global.userPhotos[sessionToken] = profilePhoto;
      console.log('📸 Profile photo stored with session token');
    }
    
    res.setHeader('Set-Cookie', cookies);
    
    console.log('✅ Authentication successful, redirecting to app...');
    
    // Redirect to main app
    res.redirect('http://localhost:3000/?auth=success');
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('http://localhost:3000/login?error=callback_error');
  }
});

// OAuth Logout endpoint
app.post('/api/auth/oauth-logout', (req, res) => {
  try {
    console.log('🚪 User logout requested');
    
    // Get session token to clear photo from memory
    const sessionToken = req.headers.cookie?.match(/hrd_session=([^;]+)/)?.[1];
    if (sessionToken && global.userPhotos) {
      delete global.userPhotos[sessionToken];
    }
    
    // Clear session cookies
    res.setHeader('Set-Cookie', [
      'hrd_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
      'hrd_user_email=; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
      'hrd_user_name=; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    ]);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout. Please try again.',
      error: error.message
    });
  }
});

// OAuth Verify endpoint
app.get('/api/auth/oauth-verify', (req, res) => {
  try {
    // Get session token from cookies
    const sessionToken = req.headers.cookie?.match(/hrd_session=([^;]+)/)?.[1];
    const userEmail = req.headers.cookie?.match(/hrd_user_email=([^;]+)/)?.[1];
    const userName = req.headers.cookie?.match(/hrd_user_name=([^;]+)/)?.[1];
    
    if (!sessionToken || !userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Get profile photo from memory storage
    const userPhoto = global.userPhotos?.[sessionToken] || null;
    
    res.json({
      success: true,
      user: {
        email: decodeURIComponent(userEmail),
        name: userName ? decodeURIComponent(userName) : null,
        photo: userPhoto,
        authenticated: true
      }
    });
    
  } catch (error) {
    console.error('OAuth verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify authentication',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'OAuth Server',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OAuth Server running on http://localhost:${PORT}`);
  console.log(`🔐 OAuth Login: http://localhost:${PORT}/api/auth/oauth-login`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 Environment Variables:`);
  console.log(`   CLIENT_ID: ${CLIENT_ID ? 'Set' : 'Missing'}`);
  console.log(`   CLIENT_SECRET: ${CLIENT_SECRET ? 'Set' : 'Missing'}`);
  console.log(`   REDIRECT_URI: ${REDIRECT_URI}`);
  console.log(`   TENANT_ID: ${TENANT_ID}`);
});
