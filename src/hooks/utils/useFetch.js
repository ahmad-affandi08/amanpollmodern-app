import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data fetching hook
 * @param {Function} fetchFn - Async function that fetches data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetch = (fetchFn, dependencies = [], options = {}) => {
  const {
    initialData = null,
    initialLoading = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);

  const refetch = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      setData(result);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      setError(err);
      console.error('Fetch error:', err);
      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    refetch();

  }, dependencies);

  return { data, loading, error, refetch, setData };
};
