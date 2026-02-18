import React from 'react';

/**
 * ConditionBadge Component
 * Shows equipment condition status with color coding
 * 
 * States:
 * - Baik: Green
 * - Rusak Ringan: Yellow
 * - Rusak Berat: Red
 */
export default function ConditionBadge({ condition }) {
  const getConditionStyle = () => {
    switch (condition) {
      case 'Baik':
        return {
          className: 'bg-success-100 text-success-700 border-success-200',
          label: 'Baik'
        };
      case 'Rusak Ringan':
        return {
          className: 'bg-warning-100 text-warning-700 border-warning-200',
          label: 'Rusak Ringan'
        };
      case 'Rusak Berat':
        return {
          className: 'bg-danger-100 text-danger-700 border-danger-200',
          label: 'Rusak Berat'
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          label: condition || '-'
        };
    }
  };

  const { className, label } = getConditionStyle();

  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg border ${className} whitespace-nowrap`}>
      {label}
    </span>
  );
}
