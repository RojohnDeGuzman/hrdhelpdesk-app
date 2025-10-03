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
    
    // In production, validate session token against database/Redis
    // For now, just check if cookies exist
    
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
};
