import { useState, useCallback } from 'react';

/**
 * Form state management hook with validation
 * @param {Object} initialState - Initial form values
 * @param {Object} validators - Validation functions for each field
 * @returns {Object} Form state and methods
 */
export const useFormState = (initialState = {}, validators = {}) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Validate if validator exists and field is touched
    if (validators[name] && touched[name]) {
      const error = validators[name](value, values);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validators, values, touched]);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValue(name, type === 'checkbox' ? checked : value);
  }, [setValue]);

  const handleBlur = useCallback((e) => {
    setFieldTouched(e.target.name);

    // Validate on blur
    const { name, value } = e.target;
    if (validators[name]) {
      const error = validators[name](value, values);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [setFieldTouched, validators, values]);

  const reset = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialState]);

  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validators).forEach(key => {
      const error = validators[key](values[key], values);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validators, values]);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    if (e) e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setValues,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate,
    setFieldTouched,
  };
};
