import React from 'react';

/**
 * Modern Badge Component
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) {
  const variants = {
    primary: 'bg-blue-100 text-blue-600',
    secondary: 'bg-purple-100 text-purple-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-orange-600',
    error: 'bg-red-100 text-red-600',
    info: 'bg-cyan-100 text-cyan-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs rounded-md',
    md: 'px-2.5 py-1 text-sm rounded-lg',
    lg: 'px-3 py-1.5 text-base rounded-xl',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center font-bold tracking-tight
        ${variants[variant] || variants.primary} ${sizes[size]} ${className}
      `}
    >
      {children}
    </span>
  );
}

/**
 * Helper function to get badge variant from status
 */
export function getStatusBadgeVariant(status) {
  const statusMap = {

    'Baik': 'success',
    'Rusak Ringan': 'warning',
    'Rusak Berat': 'error',
    'Dalam Perbaikan': 'info',


    'Pending': 'warning',
    'Sedang Dikerjakan': 'info',
    'Tindakan Lanjutan': 'secondary',
    'Selesai': 'success',
    'Ditolak': 'error',


    'Belum Selesai': 'warning',
    'Selesai': 'success',


    'Active': 'success',
    'Inactive': 'gray',
  };

  return statusMap[status] || 'primary';
}
