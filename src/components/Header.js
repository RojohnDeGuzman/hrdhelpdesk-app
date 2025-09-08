import React from 'react';
import { useTheme } from './ThemeProvider';

const Header = ({ title = "HRD Helpdesk", showThemeToggle = true }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <img 
              src="/hrdhelpdesksplashlogo.gif" 
              alt="HRD Logo" 
              className="logo-image"
            />
            <h1 className="logo-text">{title}</h1>
          </div>
        </div>
        
        <div className="header-right">
          {showThemeToggle && (
            <button 
              className="theme-toggle btn btn-ghost"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <svg className="theme-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="theme-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
