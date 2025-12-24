import React from 'react';

/**
 * Neobrutalism Select Component
 */
export default function Select({
  label,
  error,
  options = [],
  placeholder = '',
  className = '',
  placeholderDisabled = true,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[#808191] mb-2 pl-1">
          {label}
          {props.required && <span className="text-[#FF754C] ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          className={`
            w-full px-4 py-3 bg-[#F8F9FB] border border-gray-200 rounded-xl text-[#11142D] font-medium 
            outline-none focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 transition-all appearance-none
            placeholder:text-[#B0B3C7] cursor-pointer
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60
            ${error ? 'border-red-500 bg-red-50' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="" disabled={placeholderDisabled} className="text-gray-400">{placeholder}</option>}
          {options.map((option, index) => (
            <option key={option.value || `option-${index}`} value={option.value} className="py-2">
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm font-medium text-red-500 flex items-center gap-1 pl-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>
          {error}
        </p>
      )}
    </div>
  );
}
