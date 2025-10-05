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
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🚪 Force logout - All cookies:', req.headers.cookie);
    
    // Clear ALL possible cookies with multiple variations
    const clearCookies = [
      // Standard cookies
      'hrd_session=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/',
      'hrd_user_email=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/',
      'hrd_user_name=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/',
      'oauth_state=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/',
      
      // Alternative paths
      'hrd_session=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/; Domain=.vercel.app',
      'hrd_user_email=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/; Domain=.vercel.app',
      'hrd_user_name=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/; Domain=.vercel.app',
      'oauth_state=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/; Domain=.vercel.app',
      
      // Without HttpOnly for manual clearing
      'hrd_session=; Secure; SameSite=None; Max-Age=0; Path=/',
      'hrd_user_email=; Secure; SameSite=None; Max-Age=0; Path=/',
      'hrd_user_name=; Secure; SameSite=None; Max-Age=0; Path=/',
      'oauth_state=; Secure; SameSite=None; Max-Age=0; Path=/',
      
      // Expired dates
      'hrd_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/',
      'hrd_user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/',
      'hrd_user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/',
      'oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    ];
    
    console.log('🚪 Force logout - Setting clear cookies:', clearCookies.length, 'cookies');
    res.setHeader('Set-Cookie', clearCookies);
    
    // Clear user photos from memory
    if (global.userPhotos) {
      global.userPhotos = {};
      console.log('🚪 Force logout - Cleared all user photos from memory');
    }
    
    res.json({
      success: true,
      message: 'Force logout completed - all cookies cleared'
    });
    
  } catch (error) {
    console.error('Force logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to force logout',
      error: error.message
    });
  }
};
