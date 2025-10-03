import React from 'react';

const ProfessionalHeader = ({ onSearch, searchTerm, onHomeClick, onQuickAccessClick, userEmail, userName, onLogout }) => {

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
        {userEmail && (
          <div className="user-info">
            <div className="user-profile">
              <div className="user-avatar">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="user-details">
                <div className="user-name">
                  {userName || userEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="user-email">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span className="user-email-text">{userEmail}</span>
                </div>
              </div>
            </div>
            <button 
              className="logout-button"
              onClick={onLogout}
              title="Logout"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
        
        <button 
          className="quick-access-header-btn"
          onClick={onQuickAccessClick}
          title="Quick Access Menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default React.memo(ProfessionalHeader);
