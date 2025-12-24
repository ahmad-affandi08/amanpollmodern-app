import React from 'react';

export default function Card({ children, className = '', padding = 'p-6', ...props }) {
  return (
    <div
      className={`bg-white rounded-[24px] shadow-sm border border-gray-100 ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
