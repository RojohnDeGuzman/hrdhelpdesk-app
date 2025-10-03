import React, { useState, useEffect, useCallback } from 'react';
import { getAuthApiUrl } from '../constants/data';
import './LoginPage.css';

const LoginPage = () => {
  // Simple state management
  const [currentStep, setCurrentStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(0); // 5 minutes total

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);
    const isCastoTravelEmail = email.toLowerCase().endsWith('@castotravel.ph');
    return isValidFormat && isCastoTravelEmail;
  };

  // OTP expiry timer (5 minutes)
  useEffect(() => {
    let interval = null;
    if (otpExpiryTimer > 0) {
      interval = setInterval(() => {
        setOtpExpiryTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpExpiryTimer]);


  // Handle email submission
  const handleSendOTP = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid @castotravel.ph email address');
      setIsLoading(false);
      return;
    }

    try {
      // Make API call directly
      const response = await fetch(getAuthApiUrl('send-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Store email for OTP verification
        localStorage.setItem('hrd_temp_email', email);
        
        // Move to OTP step
        setCurrentStep('otp');
        setMessage('OTP sent to your email address');
        setOtpExpiryTimer(300); // 5 minutes
        setIsLoading(false);
      } else {
        setError(result.message || 'Failed to send OTP');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  }, [email, currentStep]);

  // Handle OTP submission
  const handleVerifyOTP = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!otp.trim()) {
      setError('Please enter the OTP');
      setIsLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      setIsLoading(false);
      return;
    }

    try {
      // Make API call with both email and OTP
      const response = await fetch(getAuthApiUrl('verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('Login successful! Redirecting...');
        // Store authentication status
        localStorage.setItem('hrd_user_email', email);
        localStorage.setItem('hrd_auth_status', 'authenticated');
        // Redirect to main app
        window.location.href = '/';
      } else {
        setError(result.message || 'Invalid OTP');
      }
      
      setIsLoading(false);
    } catch (error) {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  }, [otp, email]);

  // Handle resend OTP
  const handleResendOTP = useCallback(async () => {
    setError('');
    setMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch(getAuthApiUrl('send-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('OTP resent successfully');
        setOtpExpiryTimer(300); // Reset 5-minute timer
        setIsLoading(false);
      } else {
        setError(result.message || 'Failed to resend OTP');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  }, [email]);

  // Handle back to email step
  const handleBackToEmail = () => {
    setCurrentStep('email');
    setOtp('');
    setError('');
    setMessage('');
    setOtpExpiryTimer(0);
  };

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <img 
            src="/castologobg.png" 
            alt="Casto Travel Logo" 
            className="login-logo-image"
          />
          <h1 className="login-title">HRD Helpdesk</h1>
          <p className="login-subtitle">
            {currentStep === 'email' 
              ? 'Enter your @castotravel.ph email to get started'
              : 'Enter the verification code sent to your email'
            }
          </p>
        </div>

        {/* Form Container */}
        <div className="login-form-container">
          <form className="login-form">
            
            {/* Email Step */}
            {currentStep === 'email' && (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your @castotravel.ph email address"
                    className="form-input"
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  onClick={handleSendOTP}
                  className="login-button"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            )}

            {/* OTP Step */}
            {currentStep === 'otp' && (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">
                    Enter 6-digit code sent to {email}
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="form-input otp-input"
                    disabled={isLoading}
                    maxLength="6"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>

                {/* Single Timer */}
                {otpExpiryTimer > 0 && (
                  <div className="otp-timer">
                    ⏰ Expires in {formatTime(otpExpiryTimer)}
                  </div>
                )}

                {/* Action buttons */}
                <div className="otp-actions">
                  <button
                    type="submit"
                    onClick={handleVerifyOTP}
                    className="login-button"
                    disabled={isLoading || !otp.trim() || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner"></div>
                        Verifying...
                      </>
                    ) : (
                      'Verify & Login'
                    )}
                  </button>

                  <div className="secondary-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleResendOTP}
                      disabled={isLoading || otpExpiryTimer > 0}
                    >
                      {otpExpiryTimer > 0 ? `Resend in ${formatTime(otpExpiryTimer)}` : 'Resend Code'}
                    </button>
                    
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleBackToEmail}
                      disabled={isLoading}
                    >
                      Change Email
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="error-message">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {message && (
              <div className="success-message">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {message}
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p className="login-help">
            Having trouble? Contact your HR department for assistance.
          </p>
        </div>
      </div>

      {/* Background animations */}
      <div className="login-background">
        <div className="login-particle particle-1"></div>
        <div className="login-particle particle-2"></div>
        <div className="login-particle particle-3"></div>
        <div className="login-particle particle-4"></div>
        <div className="login-particle particle-5"></div>
        <div className="login-particle particle-6"></div>
        <div className="login-particle particle-7"></div>
        <div className="login-particle particle-8"></div>
        <div className="login-particle particle-9"></div>
        <div className="login-particle particle-10"></div>
      </div>
    </div>
  );
};

export default LoginPage;