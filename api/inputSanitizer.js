// Enhanced input sanitization and validation
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create a JSDOM window for DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Sanitize HTML content
const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input;
  return purify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Sanitize text input (remove HTML tags and dangerous characters)
const sanitizeText = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove dangerous characters
    .trim();
};

// Sanitize email input
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '') // Keep only safe email characters
    .trim();
};

// Sanitize file name
const sanitizeFileName = (fileName) => {
  if (typeof fileName !== 'string') return '';
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .trim();
};

// Validate and sanitize form data
const sanitizeFormData = (data) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Different sanitization based on field type
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes('name') || key.toLowerCase().includes('title')) {
        sanitized[key] = sanitizeText(value);
      } else if (key.toLowerCase().includes('description') || key.toLowerCase().includes('message')) {
        sanitized[key] = sanitizeText(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Enhanced validation rules
const validateFormData = (data) => {
  const errors = [];
  
  // Required fields validation
  const requiredFields = ['name', 'email', 'serviceType', 'description'];
  requiredFields.forEach(field => {
    if (!data[field] || data[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  });
  
  // Email validation
  if (data.email && !data.email.endsWith('@castotravel.ph')) {
    errors.push('Email must be a valid @castotravel.ph email address');
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Length validation
  if (data.description && data.description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }
  
  if (data.name && data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate feedback data
const validateFeedbackData = (data) => {
  const errors = [];
  
  // Required fields
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push('Please provide a valid rating (1-5 stars)');
  }
  
  if (!data.feedback || data.feedback.trim() === '') {
    errors.push('Feedback message is required');
  }
  
  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required');
  }
  
  // Email validation
  if (data.email && !data.email.endsWith('@castotravel.ph')) {
    errors.push('Email must be a valid @castotravel.ph email address');
  }
  
  // Length validation
  if (data.feedback && data.feedback.length > 2000) {
    errors.push('Feedback must be less than 2000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  sanitizeHTML,
  sanitizeText,
  sanitizeEmail,
  sanitizeFileName,
  sanitizeFormData,
  validateFormData,
  validateFeedbackData
};
