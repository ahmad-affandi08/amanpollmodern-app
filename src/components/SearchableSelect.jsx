import React, { useState, useRef, useEffect, useId } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

import ReactDOM from 'react-dom';

/**
 * Searchable Select Component
 * A custom dropdown with search functionality
 */
export default function SearchableSelect({
  label,
  options = [],
  value,
  onChange,
  name,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  displayKey = 'label',
  valueKey = 'value',
  required = false,
  disabled = false,
  className = '',
  variant = 'default',
  size = 'md',
}) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg h-[36px]",
    md: "px-3 py-2 text-sm rounded-xl",
    lg: "px-4 py-3 text-base rounded-xl",
  };

  const optionSizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-4 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };
  const selectId = useId();
  const hasValue = value !== '' && value !== null && value !== undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({});
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the trigger and the portal menu
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest('.searchable-select-portal')
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      if (dropdownRef.current) {
         const rect = dropdownRef.current.getBoundingClientRect();
         // Buka ke atas bila ruang di bawah sempit dan ruang di atas lebih lega.
         const spaceBelow = window.innerHeight - rect.bottom;
         const openUp = spaceBelow < 360 && rect.top > spaceBelow;
         setDropdownPosition({
           top: openUp ? null : rect.bottom, // Use viewport relative top (fixed positioning)
           bottom: openUp ? window.innerHeight - rect.top : null,
           left: rect.left,
           width: rect.width
         });
      }
    };
    
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);


  const filteredOptions = options.filter((option) => {
    const displayValue = option[displayKey]?.toString().toLowerCase() || '';
    return displayValue.includes(searchTerm.toLowerCase());
  });


  const selectedOption = options.find((opt) => String(opt[valueKey]) === String(value));
  const selectedText = selectedOption ? selectedOption[displayKey] : placeholder;

  const handleSelect = (option) => {
    onChange({
      target: {
        name: name || '',
        value: option[valueKey],
      },
    });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({
      target: {
        name: name || '',
        value: '',
      },
    });
    setSearchTerm('');
  };

  const dropdownMenu = isOpen ? ReactDOM.createPortal(
    <div 
      className={`searchable-select-portal fixed z-[9999] mt-2 bg-white shadow-2xl overflow-hidden ${variant === 'thick'
        ? 'border-2 border-indigo-100 rounded-[16px]'
        : 'border-2 border-gray-200 rounded-xl'
      }`}
      role="listbox"
      style={{
        top: dropdownPosition.bottom != null ? 'auto' : (dropdownPosition.top ? `${dropdownPosition.top}px` : 0),
        bottom: dropdownPosition.bottom != null ? `${dropdownPosition.bottom}px` : 'auto',
        left: dropdownPosition.left ? `${dropdownPosition.left}px` : 0,
        width: dropdownPosition.width ? `${dropdownPosition.width}px` : 'auto',
      }}
    >
      {/* Search Input */}
      <div className={`p-3 ${variant === 'thick' ? 'border-b-2 border-indigo-50' : 'border-b border-gray-100'}`}>
        <div className="relative">
          <Search
            size={variant === 'thick' ? 20 : 16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className={`w-full font-medium focus:outline-none transition-all placeholder-gray-400 ${variant === 'thick'
              ? 'bg-indigo-50 text-brand-primary text-base pl-12 pr-4 py-3 rounded-[12px] focus:ring-2 focus:ring-brand-primary/20'
              : `bg-gray-50 text-gray-700 ${sizeClasses[size]} pl-10 pr-4 focus:ring-1 focus:ring-brand-primary/30`
              }`}
          />
        </div>
      </div>

      {/* Options List */}
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
            const isSelected = String(option[valueKey]) === String(value);
            return (
              <button
                key={option[valueKey] ?? index}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left transition-colors ${variant === 'thick' ? 'px-6 py-4' : (optionSizeClasses[size] || optionSizeClasses.md)
                  } ${isSelected
                    ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                    : variant === 'thick'
                      ? 'text-gray-700 hover:bg-indigo-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="font-medium">{option[displayKey]}</span>
              </button>
            );
          })
        ) : (
          <div className="px-6 py-8 text-center text-gray-400">
            <Search size={40} className="mx-auto mb-2 opacity-50" />
            <p className="font-medium">Tidak ada hasil</p>
            <p className="text-sm">Coba kata kunci lain</p>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredOptions.length > 0 && (
        <div className={`px-4 py-2 text-xs text-gray-500 text-center ${variant === 'thick'
          ? 'bg-indigo-50 border-t-2 border-indigo-100'
          : 'bg-gray-50 border-t border-gray-100'
          }`}>
          Menampilkan {filteredOptions.length} dari {options.length} data
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className={`relative ${variant === 'thick' ? 'mb-5' : 'mb-4'} ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label htmlFor={selectId} className={`block mb-2 pl-1 ${variant === 'thick'
          ? 'text-brand-primary font-bold text-sm ml-1 mb-1'
          : 'text-sm font-semibold text-[#808191]'
        }`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          id={selectId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => {
            if (disabled) return;
            if (isOpen) setSearchTerm('');
            setIsOpen(!isOpen);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && isOpen) {
              setIsOpen(false);
              setSearchTerm('');
            }
          }}
          disabled={disabled}
          className={`w-full bg-white text-left flex items-center justify-between transition-all ${variant === 'thick'
            ? 'border-2 border-indigo-100 text-brand-primary text-base font-medium px-4 py-3 rounded-[16px] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10'
            : `border border-gray-200 text-gray-700 font-medium ${sizeClasses[size] || sizeClasses.md} focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20`
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${!hasValue ? 'text-gray-400' : ''}`}
        >
          <span className="truncate">{selectedText}</span>
          <div className="flex items-center gap-2 ml-2">
            {hasValue && !disabled && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Hapus pilihan"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleClear(e);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={variant === 'thick' ? 20 : (iconSizes[size] || 16)} />
              </span>
            )}
            <ChevronDown
              size={variant === 'thick' ? 20 : (iconSizes[size] || 16)}
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {/* Validasi native untuk field wajib: tanpa ini `required` hanya berupa tanda bintang. */}
        {required && (
          <input
            tabIndex={-1}
            aria-hidden="true"
            required
            disabled={disabled}
            value={hasValue ? String(value) : ''}
            onChange={() => {}}
            onFocus={() => setIsOpen(true)}
            className="absolute inset-x-0 bottom-0 h-px w-full opacity-0 pointer-events-none"
          />
        )}

        {/* Render Portal Dropdown Menu */}
        {dropdownMenu}
      </div>
    </div>
  );
}
