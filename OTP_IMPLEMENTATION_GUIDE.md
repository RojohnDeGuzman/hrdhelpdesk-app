// OTP Implementation Guide for HRD Helpdesk App
// This file contains recommendations for implementing OTP in production

/*
PRODUCTION OTP IMPLEMENTATION RECOMMENDATIONS:

1. BACKEND API INTEGRATION:
   - Replace the mock OTP generation with actual email service integration
   - Use services like SendGrid, AWS SES, or Twilio SendGrid
   - Implement rate limiting to prevent spam
   - Store OTPs securely in database with expiration times

2. SECURITY CONSIDERATIONS:
   - OTPs should expire after 5-10 minutes
   - Limit OTP attempts (e.g., 3 attempts per email)
   - Implement cooldown periods between OTP requests
   - Use secure random number generation
   - Hash OTPs before storing in database

3. EMAIL SERVICE SETUP:
   - Configure SMTP settings or use email service provider
   - Create professional email templates
   - Include company branding and security notices
   - Add unsubscribe links for compliance

4. DATABASE SCHEMA EXAMPLE:
   CREATE TABLE otp_verifications (
     id UUID PRIMARY KEY,
     email VARCHAR(255) NOT NULL,
     otp_hash VARCHAR(255) NOT NULL,
     expires_at TIMESTAMP NOT NULL,
     attempts INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     verified_at TIMESTAMP NULL
   );

5. BACKEND API ENDPOINTS:
   POST /api/auth/send-otp
   - Body: { email: string }
   - Response: { success: boolean, message: string }

   POST /api/auth/verify-otp
   - Body: { email: string, otp: string }
   - Response: { success: boolean, token?: string, user?: object }

6. FRONTEND IMPROVEMENTS:
   - Add loading states and error handling
   - Implement auto-focus on OTP input
   - Add accessibility features
   - Include "Remember me" functionality
   - Add password reset option

7. TESTING CONSIDERATIONS:
   - Unit tests for OTP generation and validation
   - Integration tests with email service
   - End-to-end tests for login flow
   - Security testing for rate limiting

8. MONITORING AND ANALYTICS:
   - Track OTP send/verify success rates
   - Monitor failed login attempts
   - Log security events
   - Set up alerts for suspicious activity

EXAMPLE BACKEND IMPLEMENTATION (Node.js/Express):

const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Email service configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many OTP requests, please try again later'
});

// Send OTP endpoint
app.post('/api/auth/send-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid email is required' 
      });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Store in database with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await storeOTP(email, otpHash, expiresAt);

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'HRD Helpdesk - Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>HRD Helpdesk Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });

    res.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP' 
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

    // Check OTP in database
    const otpRecord = await getOTPRecord(email);
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Check expiration
    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Too many attempts, please request a new OTP' 
      });
    }

    // Verify OTP
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (otpHash !== otpRecord.otp_hash) {
      // Increment attempts
      await incrementOTPAttempts(email);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    // OTP is valid - mark as verified and generate session token
    await markOTPVerified(email);
    const sessionToken = generateSessionToken(email);

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
      message: 'Failed to verify OTP' 
    });
  }
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateSessionToken(email) {
  return crypto.randomBytes(32).toString('hex');
}

// Database functions (implement based on your database choice)
async function storeOTP(email, otpHash, expiresAt) {
  // Implementation depends on your database (MongoDB, PostgreSQL, etc.)
}

async function getOTPRecord(email) {
  // Implementation depends on your database
}

async function incrementOTPAttempts(email) {
  // Implementation depends on your database
}

async function markOTPVerified(email) {
  // Implementation depends on your database
}

ENVIRONMENT VARIABLES NEEDED:
EMAIL_USER=your-email@company.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@company.com
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-jwt-secret-key

SECURITY BEST PRACTICES:
1. Use HTTPS in production
2. Implement proper CORS policies
3. Add request validation middleware
4. Use environment variables for sensitive data
5. Implement proper error handling
6. Add request logging and monitoring
7. Use database connection pooling
8. Implement proper session management
9. Add CSRF protection
10. Regular security audits

FRONTEND SECURITY:
1. Sanitize all user inputs
2. Implement proper error handling
3. Use secure storage for tokens
4. Add proper validation
5. Implement proper logout functionality
6. Add session timeout handling
7. Use HTTPS only cookies
8. Implement proper state management
*/
