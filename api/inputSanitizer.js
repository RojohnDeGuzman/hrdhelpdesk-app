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
  
  // Required fields validation - make it more flexible
  const requiredFields = ['name', 'email'];
  
  // Only add description if it exists and is not empty
  if (data.description !== undefined && data.description !== '') {
    requiredFields.push('description');
  }
  
  // Check if serviceType exists and is required
  if (data.serviceType !== undefined && data.serviceType !== '') {
    requiredFields.push('serviceType');
  }
  
  // Check if subject exists and is required
  if (data.subject !== undefined && data.subject !== '') {
    requiredFields.push('subject');
  }
  
  console.log('🔍 Required fields to validate:', requiredFields);
  
  requiredFields.forEach(field => {
    const value = data[field];
    if (!value || (typeof value === 'string' && value.trim() === '') || value === 'undefined' || value === 'null') {
      const fieldLabel = field === 'serviceType' ? 'Service Type' : 
                        field === 'subject' ? 'Subject' :
                        field.charAt(0).toUpperCase() + field.slice(1);
      errors.push(`${fieldLabel} is required`);
    }
  });
  
  console.log('🔍 Validation errors found:', errors);
  
  // Email format validation - only if email exists
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email format (e.g., john.doe@castotravel.ph)');
    } else {
      // Email domain validation - only if email format is valid
      if (!data.email.toLowerCase().endsWith('@castotravel.ph')) {
        errors.push('Please use your company email address (@castotravel.ph). Personal emails are not accepted.');
      }
      
      // Check for common email mistakes
      if (data.email.includes('@gmail.com') || data.email.includes('@yahoo.com') || data.email.includes('@hotmail.com')) {
        errors.push('Please use your company email address (@castotravel.ph) instead of personal email.');
      }
    }
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
