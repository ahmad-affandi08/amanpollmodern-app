import { useState, useCallback } from 'react';

/**
 * Filter state management hook
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Filter state and methods
 */
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [initialFilters]);

  const clearFilter = useCallback((key) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  }, [filters]);

  return {
    filters,
    appliedFilters,
    updateFilter,
    updateFilters,
    applyFilters,
    resetFilters,
    clearFilter,
    setFilters,
  };
};
