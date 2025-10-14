import React, { useCallback } from 'react';

const MemoizedButton = ({ 
  text, 
  onClick, 
  className = "sub-button", 
  disabled = false,
  type = "button",
  children 
}) => {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [onClick, disabled]);

  return (
    <button 
      type={type}
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      {children || text}
    </button>
  );
};

export default React.memo(MemoizedButton);