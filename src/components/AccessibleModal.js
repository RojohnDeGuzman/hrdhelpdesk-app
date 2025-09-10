import React, { useEffect, useRef } from 'react';

const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  ariaLabelledBy,
  ariaDescribedBy,
  ...props 
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Trap focus within the modal
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
        
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleTabKey);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleTabKey);
        document.body.style.overflow = 'unset';
        
        // Restore focus to the previously focused element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      {...props}
    >
      <div
        ref={modalRef}
        className="modal-content"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 id={ariaLabelledBy} className="modal-title">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default AccessibleModal;
