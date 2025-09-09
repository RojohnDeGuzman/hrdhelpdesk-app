const EmailService = require('./emailService');

// Initialize email service
const emailService = new EmailService();

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    console.log('⭐ API - Received feedback submission');
    console.log('⭐ API - Request body:', JSON.stringify(req.body, null, 2));

    const { rating, feedback, name, email } = req.body;

    // Validate required fields
    if (!rating || !feedback || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: rating, feedback, name, and email are required'
      });
    }

    // Validate email domain
    if (!email.includes('@castotravel.ph')) {
      return res.status(400).json({
        success: false,
        message: 'Email must be from @castotravel.ph domain'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Test email connection first
    const connectionTest = await emailService.testConnection();
    if (!connectionTest) {
      return res.status(500).json({
        success: false,
        message: 'Email service is not available. Please try again later.'
      });
    }

    // Prepare feedback data
    const feedbackData = {
      rating: parseInt(rating),
      feedback: feedback.trim(),
      name: name.trim(),
      email: email.trim(),
      timestamp: new Date().toISOString()
    };

    // Send the feedback email
    const result = await emailService.sendFeedbackEmail(feedbackData);

    if (result.success) {
      console.log('✅ API - Feedback email sent successfully');
      return res.status(200).json({
        success: true,
        message: 'Thank you for your feedback! It has been sent to HR.'
      });
    } else {
      console.error('❌ API - Failed to send feedback email:', result.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send feedback. Please try again later.'
      });
    }

  } catch (error) {
    console.error('❌ API - Error processing feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
