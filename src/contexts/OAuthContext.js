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
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const oauthUrl = process.env.NODE_ENV === 'production' 
          ? '/api/auth/oauth-verify' 
          : 'http://localhost:5001/api/auth/oauth-verify';
          
        const response = await fetch(oauthUrl, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setIsAuthenticated(true);
            setUserEmail(data.user.email);
            setUserName(data.user.name);
          }
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
    // Redirect to OAuth login
    const oauthUrl = process.env.NODE_ENV === 'production' 
      ? '/api/auth/oauth-login' 
      : 'http://localhost:5001/api/auth/oauth-login';
    window.location.href = oauthUrl;
  };

  const logout = async () => {
    try {
      const oauthUrl = process.env.NODE_ENV === 'production' 
        ? '/api/auth/oauth-logout' 
        : 'http://localhost:5001/api/auth/oauth-logout';
        
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
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  const value = {
    isAuthenticated,
    userEmail,
    userName,
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
