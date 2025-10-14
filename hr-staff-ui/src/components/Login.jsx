// src/components/Login.jsx
import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call (replace with real authentication later)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, accept any email/password for demo
      if (formData.email && formData.password) {
        onLogin({
          email: formData.email,
          name: formData.email.split('@')[0],
          role: 'hr_staff'
        });
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Add forgot password functionality here
    alert('Forgot password functionality will be implemented soon!');
  };

  return (
    <div className="login-container">
      {/* Left Side - Branding Section */}
      <div className="login-left">
        <div className="branding-content">
          <div className="branding-logo">
            <div className="logo-container">
              <img 
                src="/castologobg.png" 
                alt="Casto Logo" 
                className="logo-image"
              />
              <div className="logo-text">
                <h1>HR Portal</h1>
                <p>Castotravel Philippines</p>
              </div>
            </div>
          </div>
          
          <div className="branding-description">
            <h2>Welcome Back</h2>
            <p>Access your HR management dashboard to handle employee requests, manage tickets, and streamline HR operations.</p>
          </div>

          <div className="branding-features">
            <div className="feature-item">
              <div className="feature-icon">📋</div>
              <div className="feature-text">
                <h3>Ticket Management</h3>
                <p>Handle all HR requests efficiently</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h3>Analytics & Reports</h3>
                <p>Track performance and insights</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <div className="feature-text">
                <h3>Employee Management</h3>
                <p>Manage employee data and requests</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="branding-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        {/* Additional visible bubbles */}
        <div className="bubble-1"></div>
        <div className="bubble-2"></div>
        <div className="bubble-3"></div>
        
        <div className="login-card">
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access the portal</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-container">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="forgot-password"
              >
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;