import React from 'react';

/**
 * CalibrationBadge Component
 * Shows calibration status based on file_sertifikat and kadaluwarsa
 * 
 * States:
 * - Terkalibrasi: Has certificate & not expired (Green)
 * - Expired: Has certificate but expired (Red)
 * - Belum Kalibrasi: No certificate (Yellow)
 */
export default function CalibrationBadge({ item }) {
  const getCalibrationStatus = () => {

    if (!item.file_sertifikat_url) {
      return {
        status: 'belum',
        label: 'Blm Kalibrasi',
        className: 'bg-warning-100 text-warning-700 border-warning-200'
      };
    }


    if (!item.kadaluwarsa || item.kadaluwarsa === '0000-00-00') {
      return {
        status: 'expired',
        label: 'Expired',
        className: 'bg-danger-100 text-danger-700 border-danger-200'
      };
    }


    const expDate = new Date(item.kadaluwarsa);
    const today = new Date();
    expDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (expDate >= today) {
      return {
        status: 'terkalibrasi',
        label: 'Terkalibrasi',
        className: 'bg-success-100 text-success-700 border-success-200'
      };
    }

    return {
      status: 'expired',
      label: 'Expired',
      className: 'bg-danger-100 text-danger-700 border-danger-200'
    };
  };

  const { label, className } = getCalibrationStatus();

  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg border ${className} whitespace-nowrap`}>
      {label}
    </span>
  );
}
