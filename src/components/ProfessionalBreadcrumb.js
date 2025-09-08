import React, { useState, useEffect } from 'react';

const ProfessionalBreadcrumb = ({ path, onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (path && path.length > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [path]);

  if (!path || path.length === 0) {
    return null;
  }

  const handleNavigation = (targetPath) => {
    onNavigate(targetPath);
  };

  return (
    <nav className={`breadcrumb ${isVisible ? 'breadcrumb-visible' : ''}`}>
      <div className="breadcrumb-container">
        <button 
          className="breadcrumb-item breadcrumb-home"
          onClick={() => handleNavigation([])}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </button>
        
        {path.map((item, index) => (
          <React.Fragment key={index}>
            <span className="breadcrumb-separator">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            {index === path.length - 1 ? (
              <span className="breadcrumb-current">
                {item}
              </span>
            ) : (
              <button 
                className="breadcrumb-item"
                onClick={() => handleNavigation(path.slice(0, index + 1))}
              >
                {item}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default React.memo(ProfessionalBreadcrumb);
