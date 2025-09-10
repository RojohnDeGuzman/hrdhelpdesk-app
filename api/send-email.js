const EmailServiceV2 = require('./emailServiceV2');
const { validateFile } = require('./fileValidation');
const { validateFormData, sanitizeFormData } = require('./inputSanitizer');
const rateLimiter = require('./rateLimiter');

// Initialize email service
const emailService = new EmailServiceV2();

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

// Apply rate limiting
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 requests per 15 minutes per IP
  message: 'Too many form submissions. Please try again later.'
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
      // Log only essential information for debugging
      console.log('📧 API - Received email request:', {
        method: req.method,
        contentType: req.headers['content-type'],
        bodyKeys: Object.keys(req.body || {}),
        hasAttachments: req.body && req.body.attachments
      });


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

      // Sanitize form data
      const sanitizedFormData = sanitizeFormData(formData);
      
      // Validate form data
      const validation = validateFormData(sanitizedFormData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}`
        });
      }

      // Validate all attachments
      for (const attachment of attachments) {
        const validation = validateFile(attachment, 'general');
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: `File validation failed: ${validation.errors.join(', ')}`
          });
        }
      }

      // Send the email directly (connection test removed to prevent timeout)
      // Add timeout wrapper to prevent Vercel timeout
      const emailPromise = emailService.sendHRDRequest(sanitizedFormData, attachments);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout')), 25000) // 25 second timeout
      );
      
      const result = await Promise.race([emailPromise, timeoutPromise]);

      if (result.success) {
        console.log('✅ API - Email sent successfully');
        return res.status(200).json({
          success: true,
          message: 'Email sent successfully'
        });
      } else {
        console.error('❌ API - Failed to send email');
        return res.status(500).json({
          success: false,
          message: 'Failed to send email. Please try again later.'
        });
      }

    } catch (error) {
      console.error('❌ API - Error processing request:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.',
        error: error.message
      });
    }
  });
}
