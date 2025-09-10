import React, { useState } from 'react';
import { getApiUrl } from '../constants/data';
import { useTheme } from './ThemeProvider';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitStatus(null);

    // Validation
    if (rating === 0) {
      setErrorMessage('Please provide a rating before submitting feedback.');
      setSubmitStatus('error');
      return;
    }

    if (!feedback.trim()) {
      setErrorMessage('Please provide your feedback before submitting.');
      setSubmitStatus('error');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please provide your email address.');
      setSubmitStatus('error');
      return;
    }

    if (!email.includes('@castotravel.ph')) {
      setErrorMessage('Please provide a valid @castotravel.ph email address.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the correct API URL based on environment
      const response = await fetch(getApiUrl('send-feedback'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          feedback,
          name: name || 'Anonymous',
          email,
          timestamp: new Date().toISOString(),
        }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSuccessMessage('Thank you for your feedback! It has been sent to HR and you will receive a confirmation email shortly.');
        // Reset form
        setRating(0);
        setFeedback('');
        setName('');
        setEmail('');
        setTimeout(() => {
          onClose();
          setSubmitStatus(null);
          setSuccessMessage('');
        }, 3000);
      } else {
        // Handle specific error messages from the API
        const errorMsg = data.message || 'Failed to submit feedback. Please try again.';
        setErrorMessage(errorMsg);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      let errorMsg = 'Network error. Please check your connection and try again.';
      
      if (error.message.includes('timeout')) {
        errorMsg = 'Request timed out. Please try again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMsg = 'Unable to connect to the server. Please try again later.';
      } else if (error.message.includes('HTTP error! status:')) {
        errorMsg = 'Server error. Please try again later.';
      } else if (error.message.includes('non-JSON response')) {
        errorMsg = 'Server returned an invalid response. Please try again later.';
      } else if (error.message.includes('Unexpected token')) {
        errorMsg = 'Server returned an invalid response format. Please try again later.';
      }
      
      setErrorMessage(errorMsg);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setRating(0);
      setFeedback('');
      setName('');
      setEmail('');
      setSubmitStatus(null);
      setErrorMessage('');
      setSuccessMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-modal-header">
          <h2 className="feedback-modal-title">
            <span className="feedback-icon">💬</span>
            Suggestions & Feedback
          </h2>
          <button 
            className="feedback-modal-close" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-modal-body">
            {/* Rating Section */}
            <div className="feedback-section">
              <label className="feedback-label">
                How would you rate your experience? <span className="required">*</span>
              </label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    disabled={isSubmitting}
                  >
                    ⭐
                  </button>
                ))}
                <span className="rating-text">
                  {rating === 0 ? 'Select a rating' : 
                   rating === 1 ? 'Poor' :
                   rating === 2 ? 'Fair' :
                   rating === 3 ? 'Good' :
                   rating === 4 ? 'Very Good' : 'Excellent'}
                </span>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="feedback-section">
              <label className="feedback-label">
                Your Feedback <span className="required">*</span>
              </label>
              <textarea
                className="feedback-textarea"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Please share your suggestions, feedback, or any issues you've encountered..."
                rows={4}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Contact Information */}
            <div className="feedback-section">
              <label className="feedback-label">
                Your Name (Optional)
              </label>
              <input
                type="text"
                className="feedback-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name (optional)"
                disabled={isSubmitting}
              />
            </div>

            <div className="feedback-section">
              <label className="feedback-label">
                Your Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="feedback-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@castotravel.ph"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Submit Status */}
            {submitStatus === 'success' && (
              <div className="feedback-success">
                <div className="feedback-success-icon">✅</div>
                <div className="feedback-success-message">
                  {successMessage}
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="feedback-error">
                <div className="feedback-error-icon">❌</div>
                <div className="feedback-error-message">
                  {errorMessage}
                </div>
              </div>
            )}
          </div>

          <div className="feedback-modal-footer">
            <button
              type="button"
              className="feedback-btn feedback-btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="feedback-btn feedback-btn-primary"
              disabled={isSubmitting || rating === 0 || !feedback.trim() || !email.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Feedback'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
