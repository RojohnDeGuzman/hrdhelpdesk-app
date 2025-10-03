// Authentication middleware for Vercel API endpoints
const authenticateRequest = (req, res, next) => {
  // Check for authentication token in headers
  const authHeader = req.headers.authorization;
  const authToken = req.headers['x-auth-token'];
  
  // For Vercel deployment, we'll use a simple token check
  // In production, implement proper JWT validation
  if (!authHeader && !authToken) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Basic validation - in production, validate against your auth system
  next();
};

module.exports = authenticateRequest;
