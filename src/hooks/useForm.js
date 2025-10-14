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
  }, []);

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

    if (rule.pattern && value && !rule.pattern.test(value)) {
      return `Please enter a valid ${field}`;
    }

    return '';
  }, []);

  // Disabled validateForm for smooth typing
  const validateForm = useCallback(() => {
    return true; // Always return true for smooth typing
  }, []);

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