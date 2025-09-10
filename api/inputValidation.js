// Input validation and sanitization utilities

// Function to sanitize HTML content to prevent XSS
function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Function to validate email format
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Function to validate required domain
function validateDomain(email, domain) {
  return email.toLowerCase().endsWith(`@${domain.toLowerCase()}`);
}

// Function to sanitize text input
function sanitizeText(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

// Function to validate text length
function validateLength(input, minLength = 1, maxLength = 1000) {
  if (typeof input !== 'string') return false;
  return input.length >= minLength && input.length <= maxLength;
}

// Function to validate required fields
function validateRequiredFields(data, requiredFields) {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === '') {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

// Function to validate form data
function validateFormData(formData) {
  const errors = [];
  
  // Required fields validation
  const requiredFields = ['name', 'email', 'subject'];
  const requiredValidation = validateRequiredFields(formData, requiredFields);
  
  if (!requiredValidation.isValid) {
    errors.push(`Missing required fields: ${requiredValidation.missingFields.join(', ')}`);
  }
  
  // Email validation
  if (formData.email) {
    if (!validateEmail(formData.email)) {
      errors.push('Invalid email format');
    }
    
    if (!validateDomain(formData.email, 'castotravel.ph')) {
      errors.push('Email must be from @castotravel.ph domain');
    }
  }
  
  // Text length validation
  if (formData.name && !validateLength(formData.name, 1, 100)) {
    errors.push('Name must be between 1 and 100 characters');
  }
  
  if (formData.subject && !validateLength(formData.subject, 1, 200)) {
    errors.push('Subject must be between 1 and 200 characters');
  }
  
  if (formData.description && !validateLength(formData.description, 1, 2000)) {
    errors.push('Description must be between 1 and 2000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to sanitize form data
function sanitizeFormData(formData) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      // Sanitize text fields
      if (key === 'email') {
        sanitized[key] = value.trim().toLowerCase();
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Function to validate feedback data
function validateFeedbackData(feedbackData) {
  const errors = [];
  
  // Required fields
  if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }
  
  if (!feedbackData.feedback || !validateLength(feedbackData.feedback, 1, 1000)) {
    errors.push('Feedback must be between 1 and 1000 characters');
  }
  
  if (!feedbackData.email || !validateEmail(feedbackData.email)) {
    errors.push('Valid email is required');
  }
  
  if (feedbackData.email && !validateDomain(feedbackData.email, 'castotravel.ph')) {
    errors.push('Email must be from @castotravel.ph domain');
  }
  
  if (feedbackData.name && !validateLength(feedbackData.name, 1, 100)) {
    errors.push('Name must be between 1 and 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  sanitizeHtml,
  sanitizeText,
  validateEmail,
  validateDomain,
  validateLength,
  validateRequiredFields,
  validateFormData,
  validateFeedbackData,
  sanitizeFormData
};
