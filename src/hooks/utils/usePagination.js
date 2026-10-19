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

  // Bila halaman yang diminta sudah tidak ada (mis. baris terakhir di halaman terakhir
  // dihapus), pindah ke halaman terakhir yang masih ada.
  const setMetadata = useCallback((meta) => {
    if (meta) {
      const lastPage = meta.last_page || 1;
      const current = meta.current_page || 1;
      setCurrentPage(current > lastPage ? lastPage : current);
      setTotalPages(lastPage);
      setTotalItems(meta.total || 0);
    }
  }, []);

  // Mengubah jumlah baris per halaman selalu kembali ke halaman 1.
  const changePerPage = useCallback((value) => {
    setPerPage(value);
    setCurrentPage(1);
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    totalItems,
    perPage,
    setPerPage: changePerPage,
    goToPage,
    nextPage,
    prevPage,
    setMetadata,
    reset,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
