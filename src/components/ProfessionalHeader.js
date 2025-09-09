import React from 'react';
import { useTheme } from './ThemeProvider';

const ProfessionalHeader = ({ onSearch, searchTerm, onHomeClick, onQuickAccessClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="professional-header">
      <div className="header-left">
        <div 
          className="logo-section clickable-logo"
          onClick={onHomeClick}
          title="Back to Home"
          style={{ cursor: 'pointer' }}
        >
          <div className="logo-container">
            <img 
              src="/castologobg.png" 
              alt="Casto Travel Logo" 
              className="logo-image"
              loading="eager"
              decoding="async"
            />
          </div>
          <h1 className="logo-text">HRD Helpdesk</h1>
        </div>
        
        <div className="header-search">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search HR services..."
            value={searchTerm || ''}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="header-right">
        <button 
          className="quick-access-header-btn"
          onClick={onQuickAccessClick}
          title="Quick Access Menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default React.memo(ProfessionalHeader);
