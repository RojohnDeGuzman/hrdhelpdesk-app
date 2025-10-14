# Office 365 OAuth Setup Guide

## Overview
This guide will help you set up Office 365 OAuth authentication for the HRD Helpdesk application, replacing the OTP system with a more secure and user-friendly login experience.

## Benefits of OAuth vs OTP
- **No OTP codes needed** - Users sign in with their Office 365 credentials
- **Real user names** - Shows actual employee names in the profile
- **More secure** - Uses Microsoft's enterprise-grade authentication
- **Better UX** - Single sign-on experience
- **Automatic logout** - Respects Office 365 session management

## Setup Steps

### 1. Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: `HRD Helpdesk App`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: `Web` → `https://your-app.vercel.app/api/auth/oauth-callback`
5. Click **Register**

### 2. Configure Authentication

1. In your app registration, go to **Authentication**
2. Add redirect URIs:
   - `https://your-app.vercel.app/api/auth/oauth-callback`
   - `http://localhost:3000/api/auth/oauth-callback` (for development)
3. Under **Implicit grant and hybrid flows**, enable:
   - ✅ **ID tokens**
   - ✅ **Access tokens**
4. Click **Save**

### 3. API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `openid` (Sign users in)
   - `profile` (View users' basic profile)
   - `email` (View users' email address)
6. Click **Add permissions**
7. Click **Grant admin consent** (if you have admin rights)

### 4. Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: `HRD Helpdesk Secret`
4. Set expiration: `24 months` (or as per your policy)
5. Click **Add**
6. **Copy the secret value immediately** (you won't see it again)

### 5. Environment Variables

Add these to your Vercel environment variables:

```bash
MICROSOFT_CLIENT_ID=your-app-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_REDIRECT_URI=https://your-app.vercel.app/api/auth/oauth-callback
MICROSOFT_TENANT_ID=common
```

### 6. Domain Validation

1. Go to **Authentication** → **Platform configurations**
2. Add your domain: `castotravel.ph`
3. This ensures only @castotravel.ph emails can sign in

## Testing

### 1. Local Development
1. Set up local environment variables
2. Use `http://localhost:3000` for testing
3. Test with a @castotravel.ph email

### 2. Production Testing
1. Deploy to Vercel
2. Test the OAuth flow
3. Verify user names appear correctly
4. Test logout functionality

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check that the redirect URI in Azure matches exactly
   - Include both HTTP (dev) and HTTPS (prod) versions

2. **"Insufficient privileges"**
   - Ensure admin consent is granted for API permissions
   - Check that the user has a valid Office 365 license

3. **"Invalid client"**
   - Verify CLIENT_ID and CLIENT_SECRET are correct
   - Check that the app registration is active

4. **"Domain not allowed"**
   - Add your domain to the app registration
   - Ensure the user's email ends with @castotravel.ph

### Debug Endpoints

- `/api/debug/env` - Check environment variables
- `/api/auth/oauth-verify` - Check authentication status

## Security Considerations

1. **HTTPS Only** - OAuth requires HTTPS in production
2. **Secure Cookies** - Session cookies are HttpOnly and Secure
3. **State Parameter** - Prevents CSRF attacks
4. **Domain Validation** - Only @castotravel.ph emails allowed
5. **Session Management** - Automatic logout on Office 365 session expiry

## Migration from OTP

1. **Backup Current System** - Keep OTP system as fallback
2. **Test Thoroughly** - Ensure all features work with OAuth
3. **User Communication** - Inform users about the new login method
4. **Gradual Rollout** - Consider A/B testing

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify Azure app registration settings
3. Test with different user accounts
4. Check browser console for errors

## Next Steps

1. Complete Azure app registration
2. Set environment variables in Vercel
3. Deploy and test
4. Communicate changes to users
5. Monitor for any issues
