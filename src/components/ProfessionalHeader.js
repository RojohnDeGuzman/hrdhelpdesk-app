import React from 'react';

const ProfessionalHeader = ({ onSearch, searchTerm, onHomeClick, onQuickAccessClick }) => {

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
      </div>
    </header>
  );
};

export default React.memo(ProfessionalHeader);
