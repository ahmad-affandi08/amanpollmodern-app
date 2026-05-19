import React from 'react';

export default function Input({
  label,
  error,
  icon,
  className = '',
  currency = false,
  value,
  onChange,
  size = 'md',
  ...props
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg h-[36px]",
    md: "px-3 py-2 text-sm rounded-xl",
    lg: "px-4 py-3 text-base rounded-xl",
  };

  const formatRupiah = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const stringVal = String(val).replace(/\D/g, '');
    return stringVal.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = (e) => {
    if (currency) {

      const rawValue = e.target.value.replace(/\./g, '').replace(/\D/g, '');


      const event = {
        ...e,
        target: {
          ...e.target,
          name: props.name,
          value: rawValue
        }
      };

      onChange && onChange(event);
    } else {
      onChange && onChange(e);
    }
  };

  const displayValue = currency ? formatRupiah(value) : value;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[#808191] mb-2 pl-1">
          {label}
          {props.required && <span className="text-[#FF754C] ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#808191]">
            {icon}
          </div>
        )}

        <input
          className={`
            w-full ${sizes[size]} bg-[#F8F9FB] border border-gray-200 font-medium 
            outline-none focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 transition-all
            placeholder:text-[#B0B3C7]
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-red-500 bg-red-50' : ''}
            ${className}
          `}
          value={displayValue}
          onChange={handleChange}
          {...props}
        />
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
