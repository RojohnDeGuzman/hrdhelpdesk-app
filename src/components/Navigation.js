import React, { useState } from 'react';

const Navigation = ({ 
  currentPath = [], 
  onNavigate, 
  showBreadcrumbs = true,
  showSearch = true,
  onSearch 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleBreadcrumbClick = (index) => {
    if (onNavigate) {
      onNavigate(index);
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-content">
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle btn btn-ghost"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumbs */}
        {showBreadcrumbs && currentPath.length > 0 && (
          <div className="breadcrumbs">
            <button 
              className="breadcrumb-home btn btn-ghost btn-sm"
              onClick={() => handleBreadcrumbClick(-1)}
            >
              <svg className="breadcrumb-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            
            {currentPath.map((item, index) => (
              <React.Fragment key={index}>
                <svg className="breadcrumb-separator" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <button 
                  className="breadcrumb-item btn btn-ghost btn-sm"
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {item}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Search Bar */}
        {showSearch && onSearch && (
          <div className="nav-search">
            <div className="search-input-wrapper">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search HR services..."
                className="search-input"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            {/* Add mobile menu items here */}
            <button 
              className="mobile-menu-item btn btn-ghost"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Close Menu
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default React.memo(Navigation);
