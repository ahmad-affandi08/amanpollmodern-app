import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Modal state management hook
 * @param {Boolean} initialState - Initial open state
 * @returns {Object} Modal state and methods
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);
  const clearTimerRef = useRef(null);

  const cancelClear = () => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  };

  useEffect(() => cancelClear, []);

  const open = useCallback((itemData = null) => {
    // Batalkan pengosongan data dari close() sebelumnya, kalau tidak data modal
    // yang baru dibuka bisa terhapus oleh timer lama.
    cancelClear();
    setData(itemData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);

    cancelClear();
    clearTimerRef.current = setTimeout(() => {
      setData(null);
      clearTimerRef.current = null;
    }, 200);
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
