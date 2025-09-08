import React from 'react';

const ServiceCard = ({ 
  title, 
  description, 
  icon, 
  imageSrc, 
  onClick, 
  category,
  isPopular = false,
  isNew = false,
  className = ""
}) => {
  return (
    <div 
      className={`service-card card ${className} ${isPopular ? 'popular' : ''} ${isNew ? 'new' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="service-card-header">
        {isPopular && <span className="badge badge-popular">Popular</span>}
        {isNew && <span className="badge badge-new">New</span>}
        
        <div className="service-icon">
          {imageSrc ? (
            <img src={imageSrc} alt={title} className="service-image" />
          ) : icon ? (
            <div className="service-icon-placeholder">{icon}</div>
          ) : (
            <div className="service-icon-default">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      <div className="service-card-body">
        <h3 className="service-title">{title}</h3>
        {description && (
          <p className="service-description">{description}</p>
        )}
        {category && (
          <span className="service-category">{category}</span>
        )}
      </div>
      
      <div className="service-card-footer">
        <div className="service-arrow">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ServiceCard);
