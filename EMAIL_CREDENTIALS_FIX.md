# 📧 Email Setup Guide - Fix "Missing credentials" Error

## 🚨 Current Error:
```
Error: Missing credentials for "PLAIN"
```

This means your `.env` file doesn't have proper email credentials configured.

## 🔧 Quick Fix Steps:

### Step 1: Edit your `.env` file
Open the `.env` file in your project root and replace the placeholder values:

```env
PORT=5000
NODE_ENV=development
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=noreply@yourcompany.com
```

### Step 2: Get Gmail App Password (Recommended)

1. **Go to Google Account**: https://myaccount.google.com/
2. **Security** → **2-Step Verification** (enable if not already)
3. **App passwords** → **Select app**: "Mail"
4. **Generate password** → Copy the 16-character password
5. **Use this password** in your `.env` file

### Step 3: Alternative Email Services

#### Option A: Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-outlook-password
EMAIL_FROM=noreply@yourcompany.com
```

#### Option B: Yahoo
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-yahoo-app-password
EMAIL_FROM=noreply@yourcompany.com
```

#### Option C: Custom SMTP
```env
EMAIL_HOST=smtp.yourcompany.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourcompany.com
EMAIL_PASS=your-password
EMAIL_FROM=noreply@yourcompany.com
```

## 🧪 Test Configuration:

### Method 1: Test with a simple email first
Replace in `.env`:
```env
EMAIL_USER=test@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=test@gmail.com
```

### Method 2: Use a test email service
For testing, you can use:
- **Mailtrap** (free testing)
- **Ethereal Email** (fake SMTP for testing)

## 🔄 Restart Server After Changes:

1. **Stop the server**: Press `Ctrl+C` in the terminal
2. **Edit `.env` file** with your credentials
3. **Restart server**: `node server.js`

## ✅ Verification Steps:

1. **Check server logs** for:
   ```
   🚀 HRD Helpdesk API running on port 5000
   📧 Email service configured
   🔒 Rate limiting enabled
   ```

2. **Test the API**:
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Try sending OTP** from your frontend

## 🚨 Common Issues & Solutions:

### Issue 1: "Invalid login"
- **Solution**: Use App Password, not regular password
- **For Gmail**: Generate App Password from Google Account

### Issue 2: "Less secure app access"
- **Solution**: Enable 2-Factor Authentication first
- **Then**: Generate App Password

### Issue 3: "Connection timeout"
- **Solution**: Check firewall settings
- **Try**: Different email service (Outlook/Yahoo)

### Issue 4: "Authentication failed"
- **Solution**: Verify email and password are correct
- **Check**: No extra spaces in `.env` file

## 📱 Quick Test Setup:

For immediate testing, you can temporarily use a test email:

```env
PORT=5000
NODE_ENV=development
EMAIL_USER=your-test-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-test-email@gmail.com
```

## 🎯 Next Steps:

1. **Edit `.env`** with your real email credentials
2. **Restart server** (`node server.js`)
3. **Test from frontend** - enter your email and click "Send OTP"
4. **Check your email** for the OTP code

Once configured correctly, you should see the OTP email in your inbox! 📧
