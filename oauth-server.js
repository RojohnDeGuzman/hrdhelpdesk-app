const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
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
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Strict; Max-Age=600`);
    
    // Microsoft OAuth URL
    const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
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
    if (!state || !cookieState || state !== cookieState) {
      console.error('Invalid state parameter');
      return res.redirect('http://localhost:3000/login?error=invalid_state');
    }
    
    // Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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
    console.log('✅ User profile:', { 
      name: profile.displayName, 
      email: profile.mail || profile.userPrincipalName 
    });
    
    // Validate email domain
    const userEmail = profile.mail || profile.userPrincipalName;
    if (!userEmail?.endsWith('@castotravel.ph')) {
      console.error('Invalid email domain:', userEmail);
      return res.redirect('http://localhost:3000/login?error=invalid_domain');
    }
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Set session cookies
    res.setHeader('Set-Cookie', [
      `hrd_session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      `hrd_user_email=${encodeURIComponent(userEmail)}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      `hrd_user_name=${encodeURIComponent(profile.displayName || '')}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
    ]);
    
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
    
    res.json({
      success: true,
      user: {
        email: decodeURIComponent(userEmail),
        name: userName ? decodeURIComponent(userName) : null,
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
