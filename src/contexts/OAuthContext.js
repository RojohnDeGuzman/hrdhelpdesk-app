import React, { createContext, useContext, useState, useEffect } from 'react';

const OAuthContext = createContext();

export const useOAuth = () => {
  const context = useContext(OAuthContext);
  if (!context) {
    throw new Error('useOAuth must be used within an OAuthProvider');
  }
  return context;
};

export const OAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authCheckFailed, setAuthCheckFailed] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    // Don't check auth if we're in the middle of logging out
    if (isLoggingOut) {
      setIsLoading(false);
      return;
    }

    const checkAuthStatus = async () => {
      try {
        // Use production OAuth endpoint or local for development
        const oauthUrl = process.env.NODE_ENV === 'production' 
          ? '/api/auth/oauth-verify' 
          : 'http://localhost:5001/api/auth/oauth-verify';
          
        console.log('🔍 Checking auth status at:', oauthUrl);
        console.log('🔍 Environment:', process.env.NODE_ENV);
        console.log('🔍 Current URL:', window.location.href);
        
        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(oauthUrl, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('🔍 Auth check response:', response.status, response.statusText);

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Auth check data:', data);
          if (data.success && data.user) {
            setIsAuthenticated(true);
            setUserEmail(data.user.email);
            setUserName(data.user.name);
            setUserPhoto(data.user.photo);
          }
        } else {
          console.log('🔍 Auth check failed:', response.status, response.statusText);
          // If 401, user is not authenticated - this is expected
          if (response.status === 401) {
            console.log('🔍 User not authenticated - showing login page');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        if (error.name === 'AbortError') {
          console.log('🔍 Auth check timed out - showing login page');
        }
        setAuthCheckFailed(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [isLoggingOut]);

  const login = () => {
    // Redirect to OAuth login directly
    const oauthUrl = process.env.NODE_ENV === 'production' 
      ? '/api/auth/oauth-login' 
      : 'http://localhost:5001/api/auth/oauth-login';
    window.location.href = oauthUrl;
  };

  const logout = async () => {
    console.log('🚪 Starting logout process...');
    setIsLoggingOut(true);
    
    try {
      const oauthUrl = process.env.NODE_ENV === 'production' 
        ? '/api/auth/oauth-logout' 
        : 'http://localhost:5001/api/auth/oauth-logout';
        
      console.log('🚪 Calling logout endpoint:', oauthUrl);
      const response = await fetch(oauthUrl, {
        method: 'POST',
        credentials: 'include'
      });
      
      console.log('🚪 Logout response:', response.status, response.statusText);
      const data = await response.json();
      console.log('🚪 Logout response data:', data);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      console.log('🚪 Clearing local state...');
      setIsAuthenticated(false);
      setUserEmail('');
      setUserName('');
      setUserPhoto(null);
      setIsLoading(false);
      setAuthCheckFailed(false);
      
      // Clear cookies manually as backup
      console.log('🚪 Clearing cookies manually...');
      document.cookie = 'hrd_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'hrd_user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'hrd_user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Force reload to clear any cached state
      console.log('🚪 Reloading page...');
      window.location.reload();
    }
  };

  const value = {
    isAuthenticated,
    userEmail,
    userName,
    userPhoto,
    isLoading,
    authCheckFailed,
    login,
    logout
  };

  return (
    <OAuthContext.Provider value={value}>
      {children}
    </OAuthContext.Provider>
  );
};
