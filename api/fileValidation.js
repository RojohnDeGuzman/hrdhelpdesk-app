// File validation and security utilities

// Allowed file types for different upload categories
const ALLOWED_FILE_TYPES = {
  picture: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  signature: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  general: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  picture: 20 * 1024 * 1024,     // 20MB
  signature: 5 * 1024 * 1024,    // 5MB
  document: 20 * 1024 * 1024,    // 20MB
  general: 20 * 1024 * 1024      // 20MB
};

// Dangerous file extensions to block
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1',
  '.dll', '.sys', '.drv', '.msi', '.app', '.deb', '.rpm'
];

// Function to validate file type
function validateFileType(file, uploadType = 'general') {
  const allowedTypes = ALLOWED_FILE_TYPES[uploadType] || ALLOWED_FILE_TYPES.general;
  return allowedTypes.includes(file.mimetype);
}

// Function to validate file size
function validateFileSize(file, uploadType = 'general') {
  const maxSize = MAX_FILE_SIZES[uploadType] || MAX_FILE_SIZES.general;
  return file.size <= maxSize;
}

// Function to check for dangerous file extensions
function isDangerousFile(filename) {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return DANGEROUS_EXTENSIONS.includes(extension);
}

// Function to sanitize filename
function sanitizeFileName(filename) {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '');
  
  // Replace spaces and special characters with underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  
  // Limit filename length
  if (sanitized.length > 100) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    const name = sanitized.substring(0, 100 - ext.length);
    sanitized = name + ext;
  }
  
  return sanitized;
}

// Function to validate file buffer for malicious content
function validateFileBuffer(buffer, mimetype) {
  // Check for common malicious patterns
  const bufferString = buffer.toString('binary');
  
  // Check for script tags in non-HTML files
  if (!mimetype.includes('text/html') && 
      (bufferString.includes('<script') || bufferString.includes('javascript:'))) {
    return false;
  }
  
  // Check for executable signatures
  const executableSignatures = [
    'MZ', // Windows PE
    '\x7fELF', // Linux ELF
    '\xfe\xed\xfa', // Mach-O
    'PK\x03\x04' // ZIP (could contain executables)
  ];
  
  for (const signature of executableSignatures) {
    if (bufferString.startsWith(signature)) {
      return false;
    }
  }
  
  return true;
}

// Main validation function
function validateFile(file, uploadType = 'general') {
  const errors = [];
  
  // Check if file exists
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  // Check file type
  if (!validateFileType(file, uploadType)) {
    errors.push(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES[uploadType].join(', ')}`);
  }
  
  // Check file size
  if (!validateFileSize(file, uploadType)) {
    const maxSizeMB = (MAX_FILE_SIZES[uploadType] || MAX_FILE_SIZES.general) / (1024 * 1024);
    errors.push(`File too large. Maximum size: ${maxSizeMB}MB`);
  }
  
  // Check for dangerous extensions
  if (isDangerousFile(file.originalname)) {
    errors.push('File type not allowed for security reasons');
  }
  
  // Validate file buffer
  if (file.buffer && !validateFileBuffer(file.buffer, file.mimetype)) {
    errors.push('File contains potentially malicious content');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedFilename: sanitizeFileName(file.originalname)
  };
}

module.exports = {
  validateFile,
  sanitizeFileName,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES
};
