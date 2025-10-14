# 📧 Outlook Email Setup for HRD Helpdesk

This guide will help you set up free email sending using Outlook SMTP instead of EmailJS.

## 🚀 Quick Setup

### 1. Configure Your Email Settings

1. Copy the example config file:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` with your Outlook details:
   ```javascript
   module.exports = {
     outlookEmail: 'your-email@outlook.com',
     outlookPassword: 'your-app-password-here',
     osticketEmail: 'hrm@castotravel.com'
   };
   ```

### 2. Create Outlook App Password

1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Sign in with your Outlook account
3. Go to **Security** > **Advanced security options**
4. Turn on **Two-step verification** if not already enabled
5. Under **App passwords**, click **Create a new app password**
6. Name it "HRD Helpdesk" and copy the generated password
7. Use this password in your `config.js` file

### 3. Start the Server

```bash
npm start
```

### 4. Test Email Connection

Visit: `http://localhost:3001/test-email`

You should see:
```json
{
  "success": true,
  "message": "Email service is ready"
}
```

## 📋 Features

### ✅ What You Get (FREE):
- **Unlimited emails** (within Outlook limits: 300/day)
- **Professional HTML emails** with your branding
- **Automatic confirmation emails** to employees
- **File attachments** support
- **osTicket integration** - emails go directly to your ticket system
- **No monthly costs** - completely free!

### 📊 Email Limits:
- **Outlook Free**: 300 emails/day
- **Outlook Premium**: 1,000 emails/day
- **Perfect for HR helpdesk** volume

## 🔧 API Endpoints

### Send Email
```
POST /send-email
Content-Type: application/json

{
  "formData": {
    "name": "John Doe",
    "email": "john@company.com",
    "title": "Employee Reassignment Form",
    "description": "Request details..."
  },
  "attachments": [...]
}
```

### Test Connection
```
GET /test-email
```

## 🎯 Benefits Over EmailJS

| Feature | EmailJS | Outlook SMTP |
|---------|---------|--------------|
| **Cost** | $15-50/month | **FREE** |
| **Emails/month** | 200-1000 | **9,000+** |
| **Reliability** | Good | **Excellent** |
| **Customization** | Limited | **Full Control** |
| **Attachments** | Limited | **Unlimited** |
| **Branding** | Basic | **Professional** |

## 🚨 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Make sure you're using an App Password, not your regular password
   - Ensure two-factor authentication is enabled

2. **"Connection timeout"**
   - Check your internet connection
   - Verify Outlook SMTP settings

3. **"Email not received"**
   - Check spam folder
   - Verify osTicket email address

### Test Commands:

```bash
# Test email connection
curl http://localhost:3001/test-email

# Send test email
curl -X POST http://localhost:3001/send-email \
  -H "Content-Type: application/json" \
  -d '{"formData":{"name":"Test","email":"test@test.com","title":"Test Request"}}'
```

## 📞 Support

If you need help with the setup, check:
1. Microsoft's App Password guide
2. Outlook SMTP documentation
3. Server logs for error messages

---

**🎉 Congratulations!** You now have a completely free email service for your HRD Helpdesk!
