import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please provide a rating before submitting feedback.');
      return;
    }

    if (!feedback.trim()) {
      alert('Please provide your feedback before submitting.');
      return;
    }

    if (!email.trim() || !email.includes('@castotravel.ph')) {
      alert('Please provide a valid @castotravel.ph email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3001/send-feedback', {
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

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setRating(0);
        setFeedback('');
        setName('');
        setEmail('');
        setTimeout(() => {
          onClose();
          setSubmitStatus(null);
        }, 2000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
                ✅ Thank you for your feedback! It has been sent to HR.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="feedback-error">
                ❌ Failed to submit feedback. Please try again.
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
