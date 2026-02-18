import React, { useState, useRef, useEffect } from 'react';
import { Columns3, Check } from 'lucide-react';

/**
 * Reusable Column Toggle Component (like Filament)
 * @param {Array} columns - Column definitions [{ key, label, alwaysVisible }]
 * @param {Object} visibleColumns - Object with column visibility state
 * @param {Function} onToggle - Callback when column is toggled
 * @param {Function} onShowAll - Callback to show all columns
 * @param {Function} onHideAll - Callback to hide all columns
 */
export default function ColumnToggle({
  columns,
  visibleColumns,
  onToggle,
  onShowAll,
  onHideAll,
  size = 'md'
}) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs h-8",
    md: "px-4 py-2 text-sm h-[46px]",
    lg: "px-6 py-2.5 text-base h-12",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 20,
  };
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 w-full bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium justify-center text-brand-primary ${sizeClasses[size]}`}
      >
        <Columns3 size={iconSizes[size]} />
        <span>Kolom</span>
        <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-md text-xs font-semibold">
          {visibleCount}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in-down">
          {/* Header with Show/Hide All */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                <button
                  onClick={onShowAll}
                  className="px-2 py-1 text-xs font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors"
                >
                  Tampilkan Semua
                </button>
                <button
                  onClick={onHideAll}
                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Sembunyikan Semua
                </button>
              </div>
            </div>
          </div>

          {/* Column List */}
          <div className="max-h-96 overflow-y-auto p-2">
            {columns.map((column) => {
              const isVisible = visibleColumns[column.key] !== false;
              const isDisabled = column.alwaysVisible === true;

              return (
                <label
                  key={column.key}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                  `}
                >
                  {/* Custom Checkbox */}
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => !isDisabled && onToggle(column.key)}
                      disabled={isDisabled}
                      className="sr-only"
                    />
                    <div
                      className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                        ${isVisible
                          ? 'bg-brand-primary border-brand-primary'
                          : 'bg-white border-gray-300'
                        }
                        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {isVisible && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Label */}
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    {column.label}
                  </span>

                  {/* Always Visible Badge */}
                  {column.alwaysVisible && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md font-medium">
                      Wajib
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
