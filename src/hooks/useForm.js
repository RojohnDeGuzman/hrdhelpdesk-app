import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const validateField = useCallback((field, value, rules) => {
    const rule = rules[field];
    if (!rule) return '';

    if (rule.required && (!value || value.trim() === '')) {
      return `${field} is required`;
    }

    if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      return `${field} must be at least ${rule.minLength} characters`;
    }

    return '';
  }, []);

  const validateForm = useCallback((rules) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, formData[field], rules);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setLoading(false);
  }, [initialValues]);

  return {
    formData,
    errors,
    loading,
    setLoading,
    updateField,
    validateForm,
    resetForm,
    setFormData
  };
};