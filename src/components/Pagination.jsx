import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Reusable Pagination Component
 * Supports both client-side and server-side pagination logic.
 * 
 * @param {number} currentPage - The current active page (1-based index)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback function when page changes (receives new page number)
 * @param {boolean} showFirstLast - Show first/last page buttons (default: true)
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  className = ''
}) {
  if (totalPages <= 1) return null;

  // Helper to generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Number of pages to show at once

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-2 mt-6 ${className}`}>
      {/* First Page */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="First Page"
        >
          <ChevronsLeft size={18} />
        </button>
      )}

      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Previous"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          // Responsive logic: On mobile (default), only show current page and neighbors (+/- 1) and ellipsis
          // On sm/md, show all generated pages
          const isVisibleOnMobile =
            page === '...' ||
            page === currentPage ||
            page === currentPage - 1 ||
            page === currentPage + 1 ||
            page === 1 ||
            page === totalPages;

          return (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className={`px-2 text-gray-400 ${!isVisibleOnMobile ? 'hidden sm:block' : ''}`}>...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`
                    min-w-[36px] h-9 px-3 rounded-lg text-sm font-bold transition-all
                    ${!isVisibleOnMobile ? 'hidden sm:block' : ''}
                    ${currentPage === page
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-105'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Next"
      >
        <ChevronRight size={18} />
      </button>

      {/* Last Page */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Last Page"
        >
          <ChevronsRight size={18} />
        </button>
      )}
    </div>
  );
}
