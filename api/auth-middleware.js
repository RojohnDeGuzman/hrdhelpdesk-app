// Authentication middleware for Vercel API endpoints
const authenticateRequest = (req, res, next) => {
  // Check for authentication token in headers
  const authHeader = req.headers.authorization;
  const authToken = req.headers['x-auth-token'];
  
  // For OAuth authenticated users, allow requests with valid tokens
  // Check if user is authenticated via OAuth (has session cookies)
  const hasSession = req.headers.cookie && req.headers.cookie.includes('hrd_session');
  
  // Allow requests if:
  // 1. Has valid auth header/token, OR
  // 2. Has OAuth session cookie, OR  
  // 3. Is from allowed origin (for form submissions)
  const allowedOrigins = [
    'https://hrdhelpdesk-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  const origin = req.headers.origin;
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  if (authHeader || authToken || hasSession || isAllowedOrigin) {
    // Basic validation - in production, validate against your auth system
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
};

module.exports = authenticateRequest;
