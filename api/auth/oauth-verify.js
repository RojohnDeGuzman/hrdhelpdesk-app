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
    
    console.log('🔍 Verify - All cookies:', req.headers.cookie);
    console.log('🔍 Verify - Session token:', sessionToken ? 'Found' : 'Not found');
    console.log('🔍 Verify - User email:', userEmail ? 'Found' : 'Not found');
    console.log('🔍 Verify - User-Agent:', req.headers['user-agent']);
    console.log('🔍 Verify - Referer:', req.headers.referer);
    console.log('🔍 Verify - Origin:', req.headers.origin);
    
    if (!sessionToken || !userEmail) {
      console.log('🔍 Verify - Authentication failed: missing session or email');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Get profile photo from memory storage
    const userPhoto = global.userPhotos?.[sessionToken] || null;
    console.log('🔍 Verify - User photo found:', userPhoto ? 'Yes' : 'No');
    console.log('🔍 Verify - Global userPhotos keys:', global.userPhotos ? Object.keys(global.userPhotos) : 'No global userPhotos');
    console.log('🔍 Verify - Session token for photo lookup:', sessionToken);
    
    // In production, validate session token against database/Redis
    // For now, just check if cookies exist
    
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
};
