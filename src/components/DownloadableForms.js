import React from 'react';
import { DOWNLOADABLE_FORMS } from '../constants/data';
import '../styles/modern-forms.css';

const DownloadableForms = ({ onBack }) => {
  const handleDownload = (fileUrl, fileName) => {
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  return (
    <div className="downloadable-forms-container">
      <div className="downloadable-forms-header">
        <div className="downloadable-forms-icon">
          <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="downloadable-forms-title">Downloadable Forms</h2>
        <p className="downloadable-forms-subtitle">Access and download HR forms and documents</p>
      </div>

      <div className="modern-forms-grid">
        {DOWNLOADABLE_FORMS.map((form, index) => (
          <div key={index} className="modern-form-card">
            <div className="modern-form-card-header">
              <div className="modern-form-card-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="modern-form-card-info">
                <h3 className="modern-form-card-title">{form.name}</h3>
                <p className="modern-form-card-description">{form.description}</p>
              </div>
            </div>
            <button 
              className="modern-form-download-button"
              onClick={() => handleDownload(form.fileUrl, form.name)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>
          </div>
        ))}
      </div>

      <div className="downloadable-forms-buttons">
        <button 
          className="downloadable-forms-button accessible-button" 
          onClick={onBack}
          aria-label="Return to home page"
          title="Click to return to the main HR services page"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default React.memo(DownloadableForms);