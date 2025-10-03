import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedEmail = localStorage.getItem('hrd_user_email');
        const authStatus = localStorage.getItem('hrd_auth_status');
        
        if (savedEmail && authStatus === 'authenticated') {
          setUserEmail(savedEmail);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const sendOTP = async (email) => {
    setIsLoading(true);
    console.log('Sending OTP to:', email); // Debug log
    console.log('API URL:', `${API_BASE_URL}/api/auth/send-otp`); // Debug log
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', response.status); // Debug log
      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (data.success) {
        setOtpSent(true);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { 
        success: false, 
        message: 'Failed to send OTP. Please check your internet connection and try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (otp) => {
    setIsLoading(true);
    try {
      const email = localStorage.getItem('hrd_temp_email');
      
      if (!email) {
        return { success: false, message: 'Email not found. Please start over.' };
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        // OTP is correct
        setUserEmail(email);
        setIsAuthenticated(true);
        setOtpVerified(true);
        
        // Save authentication status
        localStorage.setItem('hrd_user_email', email);
        localStorage.setItem('hrd_auth_status', 'authenticated');
        localStorage.setItem('hrd_auth_token', `auth_${Date.now()}_${email.replace('@', '_')}`);
        
        // Clean up temporary data
        localStorage.removeItem('hrd_temp_email');
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { 
        success: false, 
        message: 'Failed to verify OTP. Please check your internet connection and try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Start logout animation
    const logoutAnimation = () => {
      // Add logout animation class to body
      document.body.classList.add('logout-animating');
      
      // After animation completes, perform actual logout
      setTimeout(() => {
        // Clear all authentication data
        setIsAuthenticated(false);
        setUserEmail('');
        setOtpSent(false);
        setOtpVerified(false);
        
        // Clear all localStorage data
        localStorage.removeItem('hrd_user_email');
        localStorage.removeItem('hrd_auth_status');
        localStorage.removeItem('hrd_auth_token');
        localStorage.removeItem('hrd_temp_email');
        
        // Clear any other potential auth data
        localStorage.removeItem('hrd_otp_data');
        localStorage.removeItem('hrd_session');
        
        // Clear session storage as well
        sessionStorage.clear();
        
        // Remove logout animation class
        document.body.classList.remove('logout-animating');
        
        // Force page reload to ensure clean state
        window.location.reload();
      }, 1000); // 1 second animation
    };
    
    logoutAnimation();
  };

  const resetOTP = () => {
    setOtpSent(false);
    setOtpVerified(false);
    localStorage.removeItem('hrd_temp_email');
  };

  const value = {
    isAuthenticated,
    userEmail,
    isLoading,
    otpSent,
    otpVerified,
    sendOTP,
    verifyOTP,
    logout,
    resetOTP
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
