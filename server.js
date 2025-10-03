const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://172.20.9.60:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (reduced for testing)
  max: 10, // limit each IP to 10 requests per windowMs (increased for testing)
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later'
  }
});

// In-memory storage for OTPs (in production, use a database)
const otpStorage = new Map();

// Email configuration - Office 365 SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'hrd-helpdesk@castotravel.ph',
      pass: process.env.EMAIL_PASS || 'wngxrmcmqwhzgnrd'
    },
    tls: {
      ciphers: 'SSLv3'
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000
  });
};

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidFormat = emailRegex.test(email);
  const isCastoTravelEmail = email.toLowerCase().endsWith('@castotravel.ph');
  return isValidFormat && isCastoTravelEmail;
};

// Clean expired OTPs
const cleanExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiresAt) {
      otpStorage.delete(email);
    }
  }
};

// Send OTP endpoint
app.post('/api/auth/send-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid @castotravel.ph email address'
      });
    }

    // Clean expired OTPs
    cleanExpiredOTPs();

    // Check if there's already a valid OTP for this email
    const existingOTP = otpStorage.get(email);
    if (existingOTP && Date.now() < existingOTP.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP already sent. Please wait before requesting a new one.'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Store OTP
    otpStorage.set(email, {
      otp: otp,
      expiresAt: expiresAt,
      attempts: 0,
      createdAt: Date.now()
    });

    // Send email
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'hrd-helpdesk@castotravel.ph',
      to: email,
      subject: 'HRD Helpdesk - Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HRD Helpdesk - Verification Code</title>
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
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            
            <!-- Header -->
            <div class="header-bg" style="background: #1e40af; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px; border: 2px solid #1e3a8a;">
              <h1 class="header-title" style="color: #ffffff !important; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.5); letter-spacing: 1px;">HRD HELPDESK</h1>
              <p class="header-subtitle" style="color: #ffffff !important; margin: 10px 0 0 0; font-size: 16px; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">Employee Portal Access</p>
            </div>
            
            <!-- Main Content -->
            <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 2px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Title -->
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: bold; text-align: center;">🔐 Verification Code</h2>
              
              <!-- Instructions -->
              <p style="color: #475569; margin: 0 0 20px 0; font-size: 14px; text-align: center; line-height: 1.5;">
                Enter this 6-digit code in the login form:
              </p>
              
              <!-- OTP Code Display -->
              <div style="text-align: center; margin: 25px 0;">
                <div class="otp-code" style="display: inline-block; background-color: #1e40af; color: #ffffff; padding: 20px 30px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.3); border: 2px solid #1e40af;">
                  ${otp}
                </div>
              </div>
              
              <!-- Expiration Warning -->
              <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="color: #92400e; margin: 0; font-size: 13px; font-weight: bold;">
                  ⏰ EXPIRES IN 5 MINUTES - Use this code immediately for security
                </p>
              </div>
              
              <!-- Security Alert -->
              <div style="background-color: #f0fdf4; border: 2px solid #22c55e; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="color: #166534; margin: 0; font-size: 13px;">
                  🔒 SECURITY ALERT: If you didn't request this code, please ignore this email and contact IT support immediately.
                </p>
              </div>
              
              <!-- Instructions -->
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
                <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">📋 How to use this code:</h3>
                <ol style="color: #475569; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.5;">
                  <li>Go back to the HRD Helpdesk login page</li>
                  <li>Enter your email address (if not already entered)</li>
                  <li>Enter the 6-digit code above in the "Verification Code" field</li>
                  <li>Click "Verify & Login" to access your HRD portal</li>
                </ol>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0 0 5px 0; font-size: 12px;">This is an automated message from HRD Helpdesk System</p>
              <p style="color: #94a3b8; margin: 0; font-size: 11px;">For technical support, contact your HR department</p>
            </div>
            
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email address'
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again later.'
    });
  }
});

// Verify OTP endpoint
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Get stored OTP data
    const storedData = otpStorage.get(email);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      otpStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (otp !== storedData.otp) {
      storedData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // OTP is valid - clean up and generate session token
    otpStorage.delete(email);
    const sessionToken = crypto.randomBytes(32).toString('hex');

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token: sessionToken,
      user: { email }
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HRD Helpdesk API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check rate limiter status (for testing only)
app.get('/api/debug/rate-limit', (req, res) => {
  res.json({
    message: 'Rate limiter status',
    windowMs: '5 minutes',
    maxRequests: 10,
    note: 'This is for testing purposes only'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HRD Helpdesk API running on port ${PORT}`);
  console.log(`📧 Email service configured`);
  console.log(`🔒 Rate limiting enabled`);
});

module.exports = app;
