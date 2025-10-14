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
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Only POST requests are supported.' 
    });
  }

  try {
    // Get session token to clear photo from memory
    const sessionToken = req.headers.cookie?.match(/hrd_session=([^;]+)/)?.[1];
    console.log('🚪 Logout - Session token found:', sessionToken ? 'Yes' : 'No');
    console.log('🚪 Logout - All cookies:', req.headers.cookie);
    
    if (sessionToken && global.userPhotos) {
      delete global.userPhotos[sessionToken];
      console.log('🚪 Logout - Cleared user photo from memory');
    }
    
    // Clear session cookies with proper attributes for Vercel
    const clearCookies = [
      'hrd_session=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/',
      'hrd_user_email=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/',
      'hrd_user_name=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/',
      'oauth_state=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/'
    ];
    
    console.log('🚪 Logout - Setting clear cookies:', clearCookies);
    res.setHeader('Set-Cookie', clearCookies);
    
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
};
