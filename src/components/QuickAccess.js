import React, { useState, useEffect } from 'react';
import { MAIN_BUTTONS } from '../constants/data';

const QuickAccess = ({ 
  isVisible = true, 
  onNavigate, 
  currentPath = [],
  getServiceDescription,
  getServiceIcon 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Hide quick access when in form view
  useEffect(() => {
    const isInForm = currentPath.length >= 3; // Form is shown when path has 3+ levels
    setIsHidden(isInForm);
  }, [currentPath]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleItemClick = (buttonText) => {
    onNavigate([buttonText]);
    setIsExpanded(false);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  // Get popular/frequently used services
  const popularServices = MAIN_BUTTONS.slice(0, 6).map(button => ({
    ...button,
    description: getServiceDescription(button.text),
    icon: getServiceIcon(button.text)
  }));

  if (!isVisible || isHidden) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`quick-access-toggle ${isExpanded ? 'expanded' : ''} ${isHidden ? 'hidden' : ''}`}
        onClick={handleToggle}
        aria-label={isExpanded ? 'Close quick access' : 'Open quick access'}
        title={isExpanded ? 'Close quick access' : 'Open quick access'}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isExpanded ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Quick Access Panel */}
      <div className={`quick-access-panel ${isExpanded ? 'visible' : ''}`}>
        <div className="quick-access-panel-header">
          <h3 className="quick-access-panel-title">Quick Access</h3>
          <button
            className="quick-access-panel-close"
            onClick={handleClose}
            aria-label="Close panel"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="quick-access-content">
          {popularServices.map((service, index) => (
            <div
              key={index}
              className="quick-access-item"
              onClick={() => handleItemClick(service.text)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleItemClick(service.text);
                }
              }}
            >
              <div className="quick-access-item-icon">
                <span style={{ fontSize: '16px' }}>{service.icon}</span>
              </div>
              <div className="quick-access-item-content">
                <h4 className="quick-access-item-title">{service.text}</h4>
                <p className="quick-access-item-description">{service.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="quick-access-footer">
          <button
            className="modern-form-button modern-form-button-secondary"
            onClick={() => {
              onNavigate([]);
              setIsExpanded(false);
            }}
            style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            View All Services
          </button>
        </div>
      </div>
    </>
  );
};

export default React.memo(QuickAccess);
