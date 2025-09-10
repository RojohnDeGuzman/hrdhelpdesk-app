const EmailServiceV2 = require('./emailServiceV2');
const { validateFeedbackData, sanitizeFormData } = require('./inputSanitizer');
const rateLimiter = require('./rateLimiter');

// Initialize email service
const emailService = new EmailServiceV2();

// Apply rate limiting
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 feedback submissions per 15 minutes per IP
  message: 'Too many feedback submissions. Please try again later.'
});

module.exports = async (req, res) => {
  // Apply rate limiting
  limiter(req, res, async () => {
    // Set CORS headers - restrict to your domain only
    const allowedOrigins = [
      'https://hrdhelpdesk-app.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
      // Sanitize input data
      const sanitizedData = sanitizeFormData(req.body);
      
      // Validate feedback data
      const validation = validateFeedbackData(sanitizedData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}`
        });
      }

      const { rating, feedback, name, email } = sanitizedData;

      // Prepare feedback data
      const feedbackData = {
        rating: parseInt(rating),
        feedback: feedback.trim(),
        name: name.trim(),
        email: email.trim(),
        timestamp: new Date().toISOString()
      };

      // Send the feedback email with timeout
      const sendFeedbackWithTimeout = () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Feedback submission timeout'));
          }, 25000); // 25 second timeout

          emailService.sendFeedbackEmail(feedbackData)
            .then(result => {
              clearTimeout(timeout);
              resolve(result);
            })
            .catch(error => {
              clearTimeout(timeout);
              reject(error);
            });
        });
      };

      const result = await sendFeedbackWithTimeout();

      if (result.success) {
        console.log('✅ API - Feedback email sent successfully');
        return res.status(200).json({
          success: true,
          message: 'Thank you for your feedback! It has been sent to HR.'
        });
      } else {
        console.error('❌ API - Failed to send feedback email');
        return res.status(500).json({
          success: false,
          message: 'Failed to send feedback. Please try again later.'
        });
      }

    } catch (error) {
      console.error('❌ API - Error processing feedback');
      return res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.'
      });
    }
  });
}
