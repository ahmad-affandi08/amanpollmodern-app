import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

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
    sm: "px-2 py-1.5 text-xs rounded-lg",
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
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  return (
    <div className={`relative ${variant === 'thick' ? 'mb-5' : 'mb-4'} ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-[#808191] mb-2 pl-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full bg-white text-left flex items-center justify-between transition-all ${variant === 'thick'
            ? 'border-[3px] border-indigo-100 text-brand-primary text-base font-medium px-4 py-3 rounded-[20px] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10'
            : `border border-gray-200 text-gray-700 font-medium ${sizeClasses[size] || sizeClasses.md} focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20`
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${!value ? 'text-gray-400' : ''}`}
        >
          <span className="truncate">{selectedText}</span>
          <div className="flex items-center gap-2 ml-2">
            {value && !disabled && (
              <X
                size={variant === 'thick' ? 20 : (iconSizes[size] || 16)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              size={variant === 'thick' ? 20 : (iconSizes[size] || 16)}
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`absolute z-[9999] w-full mt-2 bg-white shadow-2xl overflow-hidden ${variant === 'thick'
            ? 'border-[3px] border-indigo-100 rounded-[20px]'
            : 'border-2 border-gray-200 rounded-xl'
            }`}>
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
                    ? 'bg-indigo-50 text-brand-primary text-base pl-12 pr-4 py-3 rounded-[15px] focus:ring-2 focus:ring-brand-primary/20'
                    : `bg-gray-50 text-gray-700 ${sizeClasses[size]} pl-10 pr-4 focus:ring-1 focus:ring-brand-primary/30`
                    }`}
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const isSelected = String(option[valueKey]) === String(value);
                  return (
                    <button
                      key={option[valueKey] || index}
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
          </div>
        )}
      </div>
    </div>
  );
}
