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
  className = '',
  totalData,
  size = 'md'
}) {
  const sizeClasses = {
    sm: "min-w-[32px] h-8 px-2 text-xs",
    md: "min-w-[36px] h-9 px-3 text-sm",
    lg: "min-w-[40px] h-10 px-4 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 20,
  };


  if (totalPages <= 1 && (totalData === undefined || totalData === null)) {
    return null;
  }


  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

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

  const showPaginationButtons = totalPages > 1;

  return (
    <div className={`relative w-full flex items-center justify-center gap-2 mt-6 ${className}`}>
      {showPaginationButtons && (
        <>
          {/* First Page */}
          {showFirstLast && (
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="hidden sm:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="First Page"
            >
              <ChevronsLeft size={iconSizes[size]} />
            </button>
          )}

          {/* Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Previous"
          >
            <ChevronLeft size={iconSizes[size]} />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {


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
                          ${sizeClasses[size]} rounded-lg font-bold transition-all
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
            <ChevronRight size={iconSizes[size]} />
          </button>

          {/* Last Page */}
          {showFirstLast && (
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="hidden sm:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Last Page"
            >
              <ChevronsRight size={iconSizes[size]} />
            </button>
          )}
        </>
      )}

      {/* Total Data Info */}
      {(totalData !== undefined && totalData !== null) && (
        <div className={`text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 ${showPaginationButtons ? 'absolute right-0 top-1/2 -translate-y-1/2' : ''}`}>
          Total Data: <span className="text-gray-900 font-bold">{totalData}</span>
        </div>
      )}
    </div>
  );
}
