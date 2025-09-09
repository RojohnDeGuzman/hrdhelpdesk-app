import React from 'react';

const ProfessionalServiceCard = ({ 
  title, 
  description, 
  icon, 
  iconType = 'default',
  onClick,
  grid = 1,
  searchResult = false,
  resultType = 'main',
  mainCategory = '',
  subCategory = ''
}) => {
  const getIconClass = (type) => {
    const iconMap = {
      payroll: 'payroll',
      benefits: 'benefits', 
      relations: 'relations',
      records: 'records',
      recruitment: 'recruitment',
      training: 'training',
      policy: 'policy',
      facilities: 'facilities',
      offboarding: 'offboarding',
      default: 'payroll'
    };
    return iconMap[type] || iconMap.default;
  };

  const getResultTypeLabel = (type) => {
    const labels = {
      main: 'Main Service',
      sub: 'Sub Service',
      detail: 'Form'
    };
    return labels[type] || 'Service';
  };

  const getResultTypeColor = (type) => {
    const colors = {
      main: 'var(--primary-color)',
      sub: 'var(--blue-600)',
      detail: 'var(--green-600)'
    };
    return colors[type] || 'var(--gray-600)';
  };

  return (
    <div 
      className={`professional-service-card service-card-animated ${searchResult ? 'search-result' : ''}`}
      onClick={onClick}
      style={{ gridColumn: grid > 1 ? `span ${grid}` : 'auto' }}
    >
      {searchResult && (
        <div className="search-result-badge" style={{ backgroundColor: getResultTypeColor(resultType) }}>
          {getResultTypeLabel(resultType)}
        </div>
      )}
      
      <div className="service-card-header">
        <div className={`service-card-icon ${getIconClass(iconType)}`}>
          {icon}
        </div>
        <div>
          <h3 className="service-card-title">{title}</h3>
          {description && (
            <p className="service-card-description">{description}</p>
          )}
          {searchResult && resultType === 'sub' && mainCategory && (
            <p className="search-result-breadcrumb">
              <span className="breadcrumb-icon">🏠</span>
              {mainCategory}
            </p>
          )}
          {searchResult && resultType === 'detail' && (mainCategory || subCategory) && (
            <p className="search-result-breadcrumb">
              <span className="breadcrumb-icon">🏠</span>
              {mainCategory} → {subCategory}
            </p>
          )}
        </div>
      </div>
      
      <div className="service-card-arrow">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default React.memo(ProfessionalServiceCard);
