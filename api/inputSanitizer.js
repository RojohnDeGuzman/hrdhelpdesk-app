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
  
  // Form validation - require essential fields
  console.log('🔍 Required fields to validate: name, email, and form-specific fields');
  
  // Always required fields
  const alwaysRequired = ['name', 'email'];
  
  // Check always required fields
  alwaysRequired.forEach(field => {
    const value = data[field];
    if (!value || (typeof value === 'string' && value.trim() === '') || value === 'undefined' || value === 'null') {
      const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
      errors.push(`${fieldLabel} is required`);
    }
  });
  
  // Email format and domain validation
  if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email format');
    } else {
      // Email domain validation - require @castotravel.ph
      if (!data.email.toLowerCase().endsWith('@castotravel.ph')) {
        errors.push('Please use your company email address (@castotravel.ph)');
      }
    }
  }
  
  // Form-specific required fields based on form type
  if (data.formType) {
    switch (data.formType.toLowerCase()) {
      case 'request form for company id':
        // For Company ID requests, require employee name and current department
        if (!data.employeeName || data.employeeName.trim() === '') {
          errors.push('Employee Name is required for Company ID requests');
        }
        if (!data.currentDept || data.currentDept.trim() === '') {
          errors.push('Current Department is required for Company ID requests');
        }
        break;
        
      case 'salary adjustment request':
        // For salary adjustments, require reason and adjustment type
        if (!data.reason || data.reason.trim() === '') {
          errors.push('Reason is required for salary adjustment requests');
        }
        if (!data.adjustmentType || data.adjustmentType.trim() === '') {
          errors.push('Adjustment Type is required for salary adjustment requests');
        }
        break;
        
      case 'leave request':
        // For leave requests, require dates
        if (!data.fromDate || data.fromDate.trim() === '') {
          errors.push('From Date is required for leave requests');
        }
        if (!data.toDate || data.toDate.trim() === '') {
          errors.push('To Date is required for leave requests');
        }
        break;
        
      default:
        // For general requests, require subject and description
        if (!data.subject || data.subject.trim() === '') {
          errors.push('Subject is required');
        }
        if (!data.description || data.description.trim() === '') {
          errors.push('Description is required');
        }
        break;
    }
  } else {
    // If no form type specified, require subject and description
    if (!data.subject || data.subject.trim() === '') {
      errors.push('Subject is required');
    }
    if (!data.description || data.description.trim() === '') {
      errors.push('Description is required');
    }
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
  
  // Ultra-flexible feedback validation - only check email format and domain
  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email format');
    } else {
      // Email domain validation - require @castotravel.ph
      if (!data.email.toLowerCase().endsWith('@castotravel.ph')) {
        errors.push('Please use your company email address (@castotravel.ph)');
      }
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
