const nodemailer = require('nodemailer');
const rateLimiter = require('../rateLimiter');

// OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// Email configuration - using same credentials as working email service
const transporter = nodemailer.createTransporter({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'hrd-helpdesk@castotravel.ph',
    pass: 'wngxrmcmqwhzgnrd'
  },
  tls: {
    ciphers: 'SSLv3'
  },
  // Add timeout settings for Vercel
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,    // 5 seconds
  socketTimeout: 10000      // 10 seconds
});

// Rate limiter for OTP requests
const otpLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10, // 10 requests per 5 minutes per IP
  message: 'Too many OTP requests, please try again later.'
});

// Email validation function
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Check for @castotravel.ph domain
  return email.endsWith('@castotravel.ph');
};

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

  // Apply rate limiting
  otpLimiter(req, res, async () => {
    try {
      const { email } = req.body;
      
      // Validate email
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please use a valid @castotravel.ph email address'
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiration (5 minutes)
      otpStorage.set(email, {
        otp: otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
      });

      // Create email template
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HRD Helpdesk - OTP Verification</title>
          <!--[if mso]>
          <style type="text/css">
            table { border-collapse: collapse; }
            .otp-code { background-color: #1e40af !important; color: #ffffff !important; }
            .header-bg { background-color: #1e40af !important; }
            .header-text { color: #ffffff !important; }
            .header-title { color: #ffffff !important; font-size: 28px !important; font-weight: bold !important; }
            .header-subtitle { color: #ffffff !important; font-size: 16px !important; }
          </style>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div class="header-bg" style="background: #1e40af; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px; border: 2px solid #1e3a8a;">
              <h1 class="header-title" style="color: #ffffff !important; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.5); letter-spacing: 1px;">HRD HELPDESK</h1>
              <p class="header-subtitle" style="color: #ffffff !important; margin: 10px 0 0 0; font-size: 16px; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">Employee Portal Access</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Verification Code</h2>
              
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                Your verification code for HRD Helpdesk access:
              </p>
              
              <div class="otp-code" style="background: #1e40af; color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                ${otp}
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                This code will expire in 5 minutes.<br>
                If you didn't request this code, please ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
              <p>© 2024 HRD Helpdesk - Casto Travel Philippines</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email
      const mailOptions = {
        from: 'hrd-helpdesk@castotravel.ph',
        to: email,
        subject: 'HRD Helpdesk - Verification Code',
        html: htmlContent
      };

      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: 'OTP sent successfully to your email address'
      });

    } catch (error) {
      console.error('Error sending OTP:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        email: req.body?.email
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};
