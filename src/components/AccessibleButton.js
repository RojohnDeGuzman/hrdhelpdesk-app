import React from 'react';

const AccessibleButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button',
  ariaLabel,
  ariaDescribedBy,
  role,
  tabIndex = 0,
  onKeyDown,
  ...props 
}) => {
  const handleKeyDown = (e) => {
    // Handle Enter and Space key presses for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick && !disabled) {
        onClick(e);
      }
    }
    
    // Call custom onKeyDown if provided
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
  );
};

export default AccessibleButton;
