const EmailService = require('./emailService');

// Initialize email service
const emailService = new EmailService();

// Helper function to parse multipart form data
function parseMultipartFormData(body, boundary) {
  const parts = body.split(`--${boundary}`);
  const fields = {};
  const files = [];

  for (let i = 1; i < parts.length - 1; i++) {
    const part = parts[i];
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const headers = part.substring(0, headerEnd);
    const content = part.substring(headerEnd + 4);

    // Check if this is a file upload
    if (headers.includes('filename=')) {
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      const contentTypeMatch = headers.match(/Content-Type: ([^\r\n]+)/);
      const nameMatch = headers.match(/name="([^"]+)"/);
      
      if (filenameMatch && nameMatch) {
        files.push({
          fieldname: nameMatch[1],
          originalname: filenameMatch[1],
          mimetype: contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream',
          buffer: Buffer.from(content, 'binary')
        });
      }
    } else {
      // Regular form field
      const nameMatch = headers.match(/name="([^"]+)"/);
      if (nameMatch) {
        fields[nameMatch[1]] = content.trim();
      }
    }
  }

  return { fields, files };
}

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
    console.log('📧 API - Received request to send email');
    console.log('📧 API - Request method:', req.method);
    console.log('📧 API - Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('📧 API - Content-Type:', req.headers['content-type']);
    console.log('📧 API - Request body type:', typeof req.body);
    console.log('📧 API - Request body length:', req.body ? req.body.length : 'undefined');

    let formData = {};
    let attachments = [];

    // Check if it's multipart form data
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      const boundary = req.headers['content-type'].split('boundary=')[1];
      const { fields, files } = parseMultipartFormData(req.body, boundary);
      formData = fields;
      attachments = files;
    } else {
      // Regular JSON data with attachments
      formData = { ...req.body };
      attachments = req.body.attachments || [];
      delete formData.attachments; // Remove attachments from form data
    }

    console.log('📧 API - Parsed form data:', JSON.stringify(formData, null, 2));
    console.log('📧 API - Parsed attachments:', attachments.length);

    // Validate required fields
    const requiredFields = ['name', 'email', 'title'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email domain
    if (!formData.email.includes('@castotravel.ph')) {
      return res.status(400).json({
        success: false,
        message: 'Email must be from @castotravel.ph domain'
      });
    }

    // Test email connection first
    try {
      const connectionTest = await emailService.testConnection();
      if (!connectionTest) {
        console.error('❌ API - Email service connection failed');
        return res.status(500).json({
          success: false,
          message: 'Email service is not available. Please try again later.'
        });
      }
      console.log('✅ API - Email service connection successful');
    } catch (connectionError) {
      console.error('❌ API - Email service connection error:', connectionError);
      return res.status(500).json({
        success: false,
        message: 'Email service connection failed. Please try again later.',
        error: connectionError.message
      });
    }

    // Send the email
    const result = await emailService.sendHRDRequest(formData, attachments);

    if (result.success) {
      console.log('✅ API - Email sent successfully');
      return res.status(200).json(result);
    } else {
      console.error('❌ API - Failed to send email:', result.message);
      return res.status(500).json(result);
    }

  } catch (error) {
    console.error('❌ API - Error processing request:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
