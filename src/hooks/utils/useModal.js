import { useState, useCallback } from 'react';

/**
 * Modal state management hook
 * @param {Boolean} initialState - Initial open state
 * @returns {Object} Modal state and methods
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const open = useCallback((itemData = null) => {
    setData(itemData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);

    setTimeout(() => setData(null), 200);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const updateData = useCallback((newData) => {
    setData(newData);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    updateData,
  };
};
