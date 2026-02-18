import { useState, useCallback } from 'react';

/**
 * Pagination state management hook
 * @param {Number} initialPerPage - Initial items per page
 * @returns {Object} Pagination state and methods
 */
export const usePagination = (initialPerPage = 15) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(initialPerPage);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const setMetadata = useCallback((meta) => {
    if (meta) {
      setCurrentPage(meta.current_page || 1);
      setTotalPages(meta.last_page || 1);
      setTotalItems(meta.total || 0);
    }
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    totalItems,
    perPage,
    setPerPage,
    goToPage,
    nextPage,
    prevPage,
    setMetadata,
    reset,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
