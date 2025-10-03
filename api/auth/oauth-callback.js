const crypto = require('crypto');

// Microsoft OAuth configuration
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || 'your-client-id';
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || 'your-client-secret';
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || 'https://your-app.vercel.app/api/auth/oauth-callback';
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';

module.exports = async (req, res) => {
  // Set CORS headers
  const allowedOrigins = [
    'https://hrdhelpdesk-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Only GET requests are supported.' 
    });
  }

  try {
    const { code, state, error } = req.query;
    
    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect('/login?error=oauth_error');
    }
    
    // Validate state parameter
    const cookieState = req.headers.cookie?.match(/oauth_state=([^;]+)/)?.[1];
    if (!state || !cookieState || state !== cookieState) {
      console.error('Invalid state parameter');
      return res.redirect('/login?error=invalid_state');
    }
    
    // Exchange code for tokens
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
      console.error('Token exchange failed:', await tokenResponse.text());
      return res.redirect('/login?error=token_exchange_failed');
    }
    
    const tokens = await tokenResponse.json();
    
    // Get user profile from Microsoft Graph
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });
    
    if (!profileResponse.ok) {
      console.error('Profile fetch failed:', await profileResponse.text());
      return res.redirect('/login?error=profile_fetch_failed');
    }
    
    const profile = await profileResponse.json();
    
    // Validate email domain
    if (!profile.mail?.endsWith('@castotravel.ph') && !profile.userPrincipalName?.endsWith('@castotravel.ph')) {
      console.error('Invalid email domain:', profile.mail || profile.userPrincipalName);
      return res.redirect('/login?error=invalid_domain');
    }
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Store user session (in production, use Redis or database)
    const userSession = {
      email: profile.mail || profile.userPrincipalName,
      name: profile.displayName,
      id: profile.id,
      sessionToken: sessionToken,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    // Set session cookie
    res.setHeader('Set-Cookie', [
      `hrd_session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      `hrd_user_email=${encodeURIComponent(userSession.email)}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      `hrd_user_name=${encodeURIComponent(userSession.name)}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
    ]);
    
    // Redirect to main app
    res.redirect('/?auth=success');
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/login?error=callback_error');
  }
};
