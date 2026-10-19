import React from 'react';
import { getStatusClassesWithBorder } from '../utils/status';

const SIZES = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

/**
 * Badge status (aduan, pemeliharaan, user). Warna selalu berasal dari utils/status.
 */
export default function StatusBadge({ status, size = 'md', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center justify-center font-semibold rounded-full whitespace-nowrap ${getStatusClassesWithBorder(status)} ${SIZES[size] || SIZES.md} ${className}`}
    >
      {children || status || '-'}
    </span>
  );
}
