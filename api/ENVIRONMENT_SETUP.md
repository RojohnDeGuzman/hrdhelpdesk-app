# Environment Variables Setup

## Required Environment Variables

To secure your application, you need to set the following environment variables in your Vercel dashboard:

### Email Configuration
```
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=hrd-helpdesk@castotravel.ph
EMAIL_PASS=your_actual_email_password_here
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (hrdhelpdesk-app)
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Make sure to set them for Production, Preview, and Development environments

## Security Notes

- Never commit actual passwords to version control
- Use strong, unique passwords for email accounts
- Consider using app-specific passwords for email services
- Regularly rotate credentials

## Current Security Improvements

✅ Email credentials moved to environment variables
✅ CORS restricted to specific domains
✅ File upload validation implemented
✅ Input sanitization added
✅ Information disclosure minimized
