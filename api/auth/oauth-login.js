const crypto = require('crypto');

// Microsoft OAuth configuration
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || 'your-client-id';
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || 'your-client-secret';
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || 'https://your-app.vercel.app/api/auth/oauth-callback';
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common'; // or your specific tenant ID

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
    // Generate state parameter for security
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in session/cookie for validation
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=None; Max-Age=600; Path=/`);
    
    // Microsoft OAuth URL - use tenant-specific endpoint
    const authUrl = new URL(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`);
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', 'openid profile email User.Read');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_mode', 'query');
    
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
};
