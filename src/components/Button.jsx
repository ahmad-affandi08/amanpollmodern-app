import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) {
  const baseClasses = "flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/30",
    secondary: "bg-[#FF754C] text-white hover:bg-[#e86a45] shadow-lg shadow-[#FF754C]/30",
    outline: "bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/10",
    ghost: "bg-transparent text-[#808191] hover:text-[#11142D] hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
}
