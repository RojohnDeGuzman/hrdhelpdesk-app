# 🚀 HRD Helpdesk - Real Email OTP Setup Guide

## 📋 Overview
This guide will help you set up a real working email OTP system for your HRD Helpdesk app. The system includes:
- ✅ Real email sending with professional templates
- ✅ Secure OTP generation and verification
- ✅ Rate limiting and security measures
- ✅ Professional email design
- ✅ Complete backend API

## 🛠️ Setup Instructions

### Step 1: Install Backend Dependencies

```bash
# Install backend dependencies
npm install express cors nodemailer express-rate-limit

# Or install all at once
npm install express cors nodemailer express-rate-limit nodemon
```

### Step 2: Configure Email Service

#### Option A: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Create `.env` file** in your project root:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=noreply@yourcompany.com
```

#### Option B: Outlook/Hotmail

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM=noreply@yourcompany.com
```

#### Option C: Yahoo

```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourcompany.com
```

#### Option D: Custom SMTP

```env
EMAIL_HOST=smtp.yourcompany.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourcompany.com
EMAIL_PASS=your-password
EMAIL_FROM=noreply@yourcompany.com
```

### Step 3: Start the Backend Server

```bash
# Start the backend server
node server.js

# Or for development with auto-restart
npx nodemon server.js
```

The API will be available at `http://localhost:5000`

### Step 4: Test the System

1. **Start your React app**: `npm start`
2. **Open**: `http://localhost:3000`
3. **Enter your email** and click "Send OTP"
4. **Check your email** for the OTP code
5. **Enter the OTP** and login!

## 📧 Email Template Features

The system sends professional emails with:
- ✅ Company branding and colors
- ✅ Clear 6-digit OTP display
- ✅ Security warnings and expiry notices
- ✅ Professional HTML design
- ✅ Mobile-responsive layout

## 🔒 Security Features

- ✅ **Rate Limiting**: Max 3 OTP requests per 15 minutes
- ✅ **OTP Expiry**: Codes expire in 5 minutes
- ✅ **Attempt Limiting**: Max 3 verification attempts
- ✅ **Secure Generation**: Cryptographically secure OTPs
- ✅ **Input Validation**: Email format validation
- ✅ **Error Handling**: Comprehensive error messages

## 🌐 API Endpoints

### Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@company.com"
}
```

### Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@company.com",
  "otp": "123456"
}
```

### Health Check
```
GET /api/health
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Failed to send OTP"**
   - Check email credentials in `.env`
   - Verify App Password (for Gmail)
   - Check internet connection

2. **"Invalid OTP"**
   - Check if OTP expired (5 minutes)
   - Verify you entered the correct code
   - Check if you exceeded attempt limit

3. **"Too many requests"**
   - Wait 15 minutes before trying again
   - This is a security feature

4. **Backend not starting**
   - Check if port 5000 is available
   - Verify all dependencies are installed
   - Check `.env` file configuration

### Debug Mode:

Add this to your `.env` file for detailed logging:
```env
DEBUG=true
NODE_ENV=development
```

## 📱 Production Deployment

### Environment Variables for Production:
```env
NODE_ENV=production
PORT=5000
EMAIL_USER=production-email@yourcompany.com
EMAIL_PASS=production-password
EMAIL_FROM=noreply@yourcompany.com
```

### Deploy to:
- **Heroku**: Easy deployment with Procfile
- **DigitalOcean**: App Platform or Droplets
- **AWS**: EC2 or Elastic Beanstalk
- **Vercel**: Serverless functions
- **Railway**: Simple deployment

## 🔧 Customization

### Email Template:
Edit the HTML template in `server.js` around line 80-120

### OTP Settings:
```env
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=3
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=3
```

### Company Branding:
Update colors and logo in the email template HTML

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your email service configuration
3. Test with a simple email first
4. Check firewall/network settings

## 🎉 Success!

Once configured, your HRD Helpdesk will:
- ✅ Send real OTP emails to users
- ✅ Provide secure authentication
- ✅ Display professional email templates
- ✅ Handle errors gracefully
- ✅ Maintain security best practices

Your users will receive beautiful, professional emails with their verification codes!
