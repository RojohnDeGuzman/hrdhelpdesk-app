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

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Use direct OAuth server connection
        const oauthUrl = 'http://localhost:5001/api/auth/oauth-verify';
          
        console.log('🔍 Checking auth status at:', oauthUrl);
        const response = await fetch(oauthUrl, {
          method: 'GET',
          credentials: 'include'
        });
        
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
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = () => {
    // Redirect to OAuth login directly
    const oauthUrl = 'http://localhost:5001/api/auth/oauth-login';
    window.location.href = oauthUrl;
  };

  const logout = async () => {
    try {
      const oauthUrl = 'http://localhost:5001/api/auth/oauth-logout';
        
      await fetch(oauthUrl, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      setIsAuthenticated(false);
      setUserEmail('');
      setUserName('');
      setUserPhoto(null);
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  const value = {
    isAuthenticated,
    userEmail,
    userName,
    userPhoto,
    isLoading,
    login,
    logout
  };

  return (
    <OAuthContext.Provider value={value}>
      {children}
    </OAuthContext.Provider>
  );
};
