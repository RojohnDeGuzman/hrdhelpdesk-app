// Enhanced input sanitization and validation
const DOMPurify = require('dompurify');

// Create a JSDOM window for DOMPurify with error handling
let window, purify;
try {
  const { JSDOM } = require('jsdom');
  window = new JSDOM('').window;
  purify = DOMPurify(window);
} catch (error) {
  console.log('JSDOM not available, using basic sanitization');
  // Fallback to basic sanitization if JSDOM fails
  window = null;
  purify = null;
}

// Sanitize HTML content
const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input;
  if (purify) {
    return purify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  } else {
    // Fallback to basic HTML sanitization
    return input.replace(/<[^>]*>/g, '').replace(/[<>'"&]/g, '');
  }
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
  
  console.log('🔍 Validating form data:', Object.keys(data));
  console.log('🔍 Form data values:', data);
  
  // Ultra-flexible validation - only check email format
  console.log('🔍 Required fields to validate: email only');
  
  // Only validate email format if it exists - make everything else optional
  if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email format');
    }
  }
  
  // If no email at all, that's the only thing we require
  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required');
  }
  
  console.log('🔍 Validation errors found:', errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate feedback data
const validateFeedbackData = (data) => {
  const errors = [];
  
  // Ultra-flexible feedback validation - only check email format
  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required');
  } else {
    // Only check email format, not domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email format');
    }
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
