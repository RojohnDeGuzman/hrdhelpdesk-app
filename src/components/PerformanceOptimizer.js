import React, { memo, useMemo, useCallback } from 'react';

// Memoized service card component for better performance
const MemoizedServiceCard = memo(({ 
  title, 
  description, 
  icon, 
  iconType, 
  onClick, 
  searchResult = false,
  resultType = 'main',
  mainCategory,
  subCategory 
}) => {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div
      className={`service-card accessible-service-card ${searchResult ? 'search-result' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${title} - ${description}`}
      aria-describedby={`service-${title.replace(/\s+/g, '-').toLowerCase()}-description`}
    >
      <div className="service-card-icon">
        <img 
          src={`/icons/${iconType}.png`} 
          alt={`${title} icon`}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <span className="service-card-emoji" style={{ display: 'none' }}>
          {icon}
        </span>
      </div>
      <div className="service-card-content">
        <h3 className="service-card-title">{title}</h3>
        <p 
          id={`service-${title.replace(/\s+/g, '-').toLowerCase()}-description`}
          className="service-card-description"
        >
          {description}
        </p>
        {searchResult && (
          <div className="search-result-badge">
            <span className="search-result-type">{resultType}</span>
            {mainCategory && (
              <span className="search-result-category">{mainCategory}</span>
            )}
            {subCategory && (
              <span className="search-result-subcategory">{subCategory}</span>
            )}
          </div>
        )}
      </div>
      <div className="service-card-arrow">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
});

MemoizedServiceCard.displayName = 'MemoizedServiceCard';

// Memoized search results component
const MemoizedSearchResults = memo(({ searchResults, onServiceClick }) => {
  const allResults = useMemo(() => {
    return [
      ...searchResults.mainButtons,
      ...searchResults.subButtons,
      ...searchResults.detailButtons
    ];
  }, [searchResults]);

  return (
    <div className="search-results">
      {allResults.map((result, index) => (
        <MemoizedServiceCard
          key={`${result.type}-${index}`}
          title={result.text}
          description={result.description}
          icon={result.icon}
          iconType={result.iconType || 'payroll'}
          onClick={result.onClick}
          searchResult={true}
          resultType={result.type}
          mainCategory={result.mainCategory}
          subCategory={result.subCategory}
        />
      ))}
    </div>
  );
});

MemoizedSearchResults.displayName = 'MemoizedSearchResults';

// Memoized loading spinner
const MemoizedLoadingSpinner = memo(() => (
  <div className="loading-spinner" role="status" aria-label="Loading">
    <div className="spinner"></div>
    <span className="sr-only">Loading content...</span>
  </div>
));

MemoizedLoadingSpinner.displayName = 'MemoizedLoadingSpinner';

// Memoized error boundary fallback
const MemoizedErrorFallback = memo(({ error, resetError }) => (
  <div className="error-fallback" role="alert">
    <div className="error-icon">
      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h2>Something went wrong</h2>
    <p>We're sorry, but something unexpected happened. Please try again.</p>
    <button 
      className="accessible-button"
      onClick={resetError}
      aria-label="Try again"
    >
      Try Again
    </button>
  </div>
));

MemoizedErrorFallback.displayName = 'MemoizedErrorFallback';

// Image lazy loading component
const LazyImage = memo(({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <div className={`lazy-image-container ${className}`}>
      {!isLoaded && !hasError && (
        <div className="image-placeholder">
          <div className="placeholder-spinner"></div>
        </div>
      )}
      {hasError ? (
        <div className="image-error">
          <span>📷</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          style={{ opacity: isLoaded ? 1 : 0 }}
          {...props}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export {
  MemoizedServiceCard,
  MemoizedSearchResults,
  MemoizedLoadingSpinner,
  MemoizedErrorFallback,
  LazyImage
};
