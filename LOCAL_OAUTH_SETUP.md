# Local OAuth Testing Setup Guide

## Overview
This guide will help you test the Office 365 OAuth authentication system locally before deploying to Vercel.

## Prerequisites
- Node.js installed
- Office 365 account with @castotravel.ph email
- Azure app registration (see main OAuth setup guide)

## Setup Steps

### 1. Install OAuth Server Dependencies

```bash
# Install dependencies for OAuth server
npm install --prefix . express cors
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env-oauth-example.txt .env
```

Edit `.env` with your Azure app registration details:

```bash
MICROSOFT_CLIENT_ID=your-client-id-from-azure
MICROSOFT_CLIENT_SECRET=your-client-secret-from-azure
MICROSOFT_REDIRECT_URI=http://localhost:5001/api/auth/oauth-callback
MICROSOFT_TENANT_ID=common
PORT=5001
NODE_ENV=development
```

### 3. Azure App Registration for Local Testing

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Find your existing app or create a new one
4. Go to **Authentication**
5. Add redirect URI: `http://localhost:5001/api/auth/oauth-callback`
6. Save the configuration

### 4. Start the OAuth Server

```bash
# Start the OAuth server
node oauth-server.js
```

You should see:
```
🚀 OAuth Server running on http://localhost:5001
🔐 OAuth Login: http://localhost:5001/api/auth/oauth-login
🔍 Health Check: http://localhost:5001/health
```

### 5. Start the React App

In a new terminal:

```bash
# Start the React app
npm start
```

The app will run on `http://localhost:3000`

### 6. Test the OAuth Flow

1. Open `http://localhost:3000`
2. Click "Sign in with Microsoft"
3. You'll be redirected to Office 365 login
4. Sign in with your @castotravel.ph email
5. You'll be redirected back to the app
6. Your real name should appear in the header

## Testing Checklist

### ✅ Basic Flow
- [ ] OAuth server starts without errors
- [ ] React app loads and shows OAuth login button
- [ ] Clicking login redirects to Microsoft
- [ ] Microsoft login works with @castotravel.ph email
- [ ] Redirect back to app works
- [ ] User name appears in header
- [ ] Logout works

### ✅ Error Handling
- [ ] Invalid email domain shows error
- [ ] Network errors are handled gracefully
- [ ] OAuth errors show appropriate messages

### ✅ Security
- [ ] State parameter validation works
- [ ] Session cookies are set correctly
- [ ] Logout clears all session data

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check Azure app registration has `http://localhost:5001/api/auth/oauth-callback`
   - Ensure the redirect URI matches exactly

2. **"CORS error"**
   - OAuth server is configured for localhost:3000
   - Check that React app is running on port 3000

3. **"Environment variables not set"**
   - Check `.env` file exists and has correct values
   - Restart the OAuth server after changing .env

4. **"Token exchange failed"**
   - Verify CLIENT_ID and CLIENT_SECRET are correct
   - Check that the app registration is active

### Debug Commands

```bash
# Check OAuth server health
curl http://localhost:5001/health

# Check environment variables
curl http://localhost:5001/api/auth/oauth-verify

# View OAuth server logs
# Check the terminal where oauth-server.js is running
```

## Development Workflow

### 1. Make Changes
- Edit OAuth server code in `oauth-server.js`
- Edit React components as needed
- Test changes locally

### 2. Test Thoroughly
- Test with different user accounts
- Test error scenarios
- Verify security features

### 3. Deploy to Vercel
- Once local testing is complete
- Follow the main OAuth setup guide
- Deploy to Vercel with production configuration

## File Structure

```
hrdhelpdesk-app/
├── oauth-server.js          # Local OAuth server
├── oauth-package.json       # OAuth server dependencies
├── env-oauth-example.txt    # Environment variables template
├── src/
│   ├── contexts/
│   │   └── OAuthContext.js  # OAuth context for React
│   └── components/
│       └── OAuthLoginPage.js # OAuth login page
└── .env                     # Your environment variables
```

## Next Steps

1. **Complete Local Testing** - Ensure everything works locally
2. **Azure Configuration** - Set up production Azure app registration
3. **Vercel Deployment** - Deploy with production OAuth endpoints
4. **User Communication** - Inform users about the new login method

## Support

If you encounter issues:
1. Check OAuth server logs
2. Verify Azure app registration settings
3. Test with different user accounts
4. Check browser console for errors
5. Verify environment variables are set correctly
