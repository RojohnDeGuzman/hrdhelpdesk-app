import React, { useState, useEffect } from 'react';
import './LoginPage.css';

const OAuthLoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      switch (errorParam) {
        case 'oauth_error':
          setError('OAuth authentication failed. Please try again.');
          break;
        case 'invalid_state':
          setError('Security validation failed. Please try again.');
          break;
        case 'token_exchange_failed':
          setError('Authentication token exchange failed. Please try again.');
          break;
        case 'profile_fetch_failed':
          setError('Failed to fetch user profile. Please try again.');
          break;
        case 'invalid_domain':
          setError('Please use your @castotravel.ph email address.');
          break;
        case 'callback_error':
          setError('Authentication callback failed. Please try again.');
          break;
        default:
          setError('Authentication failed. Please try again.');
      }
    }
  }, []);

  const handleMicrosoftLogin = () => {
    setIsLoading(true);
    setError('');
    
    // Redirect to OAuth login endpoint
    const oauthUrl = process.env.NODE_ENV === 'production' 
      ? '/api/auth/oauth-login' 
      : 'http://localhost:5001/api/auth/oauth-login';
    window.location.href = oauthUrl;
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-particle particle-1"></div>
        <div className="login-particle particle-2"></div>
        <div className="login-particle particle-3"></div>
        <div className="login-particle particle-4"></div>
        <div className="login-particle particle-5"></div>
        <div className="login-particle particle-6"></div>
        <div className="login-particle particle-7"></div>
        <div className="login-particle particle-8"></div>
        <div className="login-particle particle-9"></div>
        <div className="login-particle particle-10"></div>
      </div>
      
      <div className="login-container">
        <div className="login-form-container">
          <div className="login-header">
            <img 
              src="/castologobg.png" 
              alt="Casto Travel Logo" 
              className="login-logo-image"
              onError={(e) => {
                console.error('Logo failed to load:', e.target.src);
                // Try fallback logo
                if (e.target.src.includes('castologobg.png')) {
                  e.target.src = '/castologobg.png';
                } else {
                  e.target.style.display = 'none';
                }
              }}
              onLoad={() => {
                console.log('Logo loaded successfully');
              }}
            />
            <h1 className="login-title">HRD HELPDESK</h1>
            <p className="login-subtitle">Employee Portal Access</p>
          </div>

          <div className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="login-description">
              <p>Sign in with your Office 365 account to access the HRD Helpdesk portal.</p>
              <p>Use your @castotravel.ph email address.</p>
            </div>

            <button
              type="button"
              onClick={handleMicrosoftLogin}
              className="microsoft-login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M11.4 24H0V12.6H11.4V24ZM24 24H12.6V12.6H24V24ZM11.4 11.4H0V0H11.4V11.4ZM24 11.4H12.6V0H24V11.4Z" fill="#F25022"/>
                    <path d="M11.4 24H0V12.6H11.4V24ZM24 24H12.6V12.6H24V24ZM11.4 11.4H0V0H11.4V11.4ZM24 11.4H12.6V0H24V11.4Z" fill="#7FBA00"/>
                    <path d="M11.4 24H0V12.6H11.4V24ZM24 24H12.6V12.6H24V24ZM11.4 11.4H0V0H11.4V11.4ZM24 11.4H12.6V0H24V11.4Z" fill="#00A4EF"/>
                    <path d="M11.4 24H0V12.6H11.4V24ZM24 24H12.6V12.6H24V24ZM11.4 11.4H0V0H11.4V11.4ZM24 11.4H12.6V0H24V11.4Z" fill="#FFB900"/>
                  </svg>
                  Sign in with Microsoft
                </>
              )}
            </button>

            <div className="login-help">
              <p>Having trouble signing in? Contact IT support.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthLoginPage;
