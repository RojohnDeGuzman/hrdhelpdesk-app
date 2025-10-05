import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

const UnifiedLoadingScreen = ({ onComplete, isAuthenticating = false }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const { theme } = useTheme();

  const loadingMessages = isAuthenticating 
    ? [
        'Verifying Authentication...',
        'Loading HR Services...',
        'Preparing Dashboard...',
        'Setting up Navigation...',
        'Almost Ready...'
      ]
    : [
        'Initializing...',
        'Loading HR Services...',
        'Preparing Dashboard...',
        'Setting up Navigation...',
        'Almost Ready...'
      ];

  useEffect(() => {
    let messageIndex = 0;
    
    // Update loading messages
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[messageIndex]);
    }, 500);

    // Simulate loading progress with more realistic increments
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          return 100;
        }
        // More realistic progress increments
        const increment = Math.random() * 8 + 2; // 2-10% increments
        return Math.min(prev + increment, 100);
      });
    }, 150);

    // Complete loading after 3 seconds
    const completeTimer = setTimeout(() => {
      setLoadingText('Ready!');
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onComplete();
        }, 600); // Wait for fade out animation
      }, 300);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete, loadingMessages]);

  if (!isVisible) return null;

  return (
    <div className={`unified-loading-screen ${theme}`}>
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-container">
              <img 
                src="/castologobg.png" 
                alt="Casto Travel Logo" 
                className="loading-logo-image"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  console.log('Loading logo failed to load:', e.target.src);
                  e.target.src = '/castologobg1.png';
                }}
              />
              <div className="logo-ring"></div>
          </div>
        </div>
        
        <div className="loading-text">
          <h1 className="loading-title">
            <span className="title-main">HRD Helpdesk</span>
          </h1>
          <p className="loading-subtitle">Your Gateway to HR Services</p>
        </div>
        
        <div className="loading-progress">
          <div className="loading-message">
            {loadingText}
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
              <div className="progress-glow"></div>
            </div>
          </div>
        </div>
        
        <div className="loading-dots">
          <div className={`dot ${progress > 20 ? 'active' : ''}`}></div>
          <div className={`dot ${progress > 50 ? 'active' : ''}`}></div>
          <div className={`dot ${progress > 80 ? 'active' : ''}`}></div>
        </div>
      </div>
      
      <div className="loading-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        <div className="bg-shape shape-4"></div>
        <div className="bg-shape shape-5"></div>
      </div>
    </div>
  );
};

export default React.memo(UnifiedLoadingScreen);
