import React from 'react';

const AuthLoadingScreen = () => {
  return (
    <div className="auth-loading-screen">
      <div className="auth-loading-content">
        <div className="auth-loading-logo">
          <div className="logo-container">
            <img 
              src="/castologobg.png" 
              alt="Casto Travel Logo" 
              className="auth-loading-logo-image"
              loading="eager"
              decoding="async"
              onError={(e) => {
                console.log('Auth loading logo failed to load:', e.target.src);
                e.target.src = '/castologobg1.png';
              }}
            />
            <div className="logo-ring"></div>
          </div>
        </div>
        
        <div className="auth-loading-text">
          <h1 className="auth-loading-title">
            <span className="title-main">HRD Helpdesk</span>
          </h1>
          <p className="auth-loading-subtitle">Verifying Authentication...</p>
        </div>
        
        <div className="auth-loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
      
      <div className="auth-loading-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        <div className="bg-shape shape-4"></div>
        <div className="bg-shape shape-5"></div>
      </div>
    </div>
  );
};

export default React.memo(AuthLoadingScreen);
