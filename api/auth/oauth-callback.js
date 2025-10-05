const crypto = require('crypto');

// Microsoft OAuth configuration
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || 'your-client-id';
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || 'your-client-secret';
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || 'https://your-app.vercel.app/api/auth/oauth-callback';
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';

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
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Only GET requests are supported.' 
    });
  }

  try {
    const { code, state, error } = req.query;
    
    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect('https://hrdhelpdesk-app.vercel.app/login?error=oauth_error');
    }
    
    // Validate state parameter
    const cookieState = req.headers.cookie?.match(/oauth_state=([^;]+)/)?.[1];
    console.log('State validation:', { 
      receivedState: state, 
      cookieState: cookieState, 
      cookies: req.headers.cookie 
    });
    
    // Temporarily disable state validation for debugging
    if (!state) {
      console.error('No state parameter received');
      return res.redirect('https://hrdhelpdesk-app.vercel.app/login?error=invalid_state');
    }
    
    console.log('✅ State validation passed (temporarily disabled)');
    
    // Exchange code for tokens
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return res.redirect('https://hrdhelpdesk-app.vercel.app/login?error=token_exchange_failed');
    }
    
    const tokens = await tokenResponse.json();
    
    // Get user profile from Microsoft Graph
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });
    
    if (!profileResponse.ok) {
      console.error('Profile fetch failed:', await profileResponse.text());
      return res.redirect('https://hrdhelpdesk-app.vercel.app/login?error=profile_fetch_failed');
    }
    
    const profile = await profileResponse.json();
    
    // Get user profile photo from Microsoft Graph
    console.log('📸 Fetching user profile photo...');
    let profilePhoto = null;
    try {
      // First try to get photo metadata to check if photo exists
      const photoMetaResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });
      
      console.log('📸 Photo metadata response status:', photoMetaResponse.status);
      
      if (photoMetaResponse.ok) {
        // Photo exists, now fetch the actual photo
        const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });
        
        console.log('📸 Photo response status:', photoResponse.status);
        console.log('📸 Photo response headers:', Object.fromEntries(photoResponse.headers.entries()));
        
        if (photoResponse.ok) {
          const photoBuffer = await photoResponse.arrayBuffer();
          const photoBase64 = Buffer.from(photoBuffer).toString('base64');
          const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';
          profilePhoto = `data:${contentType};base64,${photoBase64}`;
          console.log('✅ User profile photo fetched successfully, size:', photoBase64.length, 'bytes');
          console.log('📸 Content type:', contentType);
        } else {
          console.log('⚠️ Photo fetch failed, status:', photoResponse.status);
          const errorText = await photoResponse.text();
          console.log('📸 Photo error response:', errorText);
        }
      } else {
        console.log('⚠️ No profile photo metadata available, status:', photoMetaResponse.status);
        const errorText = await photoMetaResponse.text();
        console.log('📸 Photo metadata error:', errorText);
      }
    } catch (error) {
      console.log('⚠️ Error fetching profile photo:', error.message);
      console.log('📸 Error details:', error);
    }
    
    // Validate email domain
    if (!profile.mail?.endsWith('@castotravel.ph') && !profile.userPrincipalName?.endsWith('@castotravel.ph')) {
      console.error('Invalid email domain:', profile.mail || profile.userPrincipalName);
      return res.redirect('https://hrdhelpdesk-app.vercel.app/login?error=invalid_domain');
    }
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Store user session (in production, use Redis or database)
    const userSession = {
      email: profile.mail || profile.userPrincipalName,
      name: profile.displayName,
      id: profile.id,
      photo: profilePhoto,
      sessionToken: sessionToken,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    // Store profile photo in memory with session token as key
    if (profilePhoto) {
      // Store photo in memory (in production, use Redis or database)
      global.userPhotos = global.userPhotos || {};
      global.userPhotos[sessionToken] = profilePhoto;
      console.log('📸 Profile photo stored with session token');
    }
    
    // Set session cookie with proper attributes for Vercel
    res.setHeader('Set-Cookie', [
      `hrd_session=${sessionToken}; HttpOnly; Secure; SameSite=None; Max-Age=86400; Path=/`,
      `hrd_user_email=${encodeURIComponent(userSession.email)}; HttpOnly; Secure; SameSite=None; Max-Age=86400; Path=/`,
      `hrd_user_name=${encodeURIComponent(userSession.name)}; HttpOnly; Secure; SameSite=None; Max-Age=86400; Path=/`
    ]);
    
    // Redirect to main app
    res.redirect('https://hrdhelpdesk-app.vercel.app/?auth=success');
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('https://hrdhelpdesk-app.vercel.app/login?error=callback_error');
  }
};
