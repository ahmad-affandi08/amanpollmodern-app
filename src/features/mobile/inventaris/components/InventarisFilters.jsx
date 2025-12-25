import React, { useState } from 'react';
import { RotateCcw, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../../../api/axiosClient';

export default function InventarisFilters({ filters, onFilterChange, onExport }) {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch nama alat options
  const { data: namaAlatData } = useQuery({
    queryKey: ['nama-alat'],
    queryFn: async () => {
      const response = await axiosClient.get('/nama-alat');
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const namaAlatList = Array.isArray(namaAlatData) ? namaAlatData : [];

  const kondisiOptions = [
    { value: '', label: 'Semua Kondisi' },
    { value: 'Baik', label: 'Baik' },
    { value: 'Rusak Ringan', label: 'Rusak Ringan' },
    { value: 'Rusak Berat', label: 'Rusak Berat' },
  ];

  const handleChange = (field, value) => {
    // Apply filter immediately on change
    const newFilters = { ...filters, [field]: value };
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = { kondisi_alat: '', nama_alat: '' };
    onFilterChange(resetFilters);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-4 shadow-lg border border-gray-100 space-y-3">
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg font-bold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download size={16} />
            <span>Download Excel</span>
          </>
        )}
      </button>

      {/* Kondisi Alat */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-text-dark">
          Kondisi Alat
        </label>
        <select
          value={filters.kondisi_alat || ''}
          onChange={(e) => handleChange('kondisi_alat', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg text-brand-primary focus:outline-none focus:ring-2 focus:ring-purple-300 font-medium"
        >
          {kondisiOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Nama Alat */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-text-dark">
          Nama Alat
        </label>
        <select
          value={filters.nama_alat || ''}
          onChange={(e) => handleChange('nama_alat', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-lg text-accent-green focus:outline-none focus:ring-2 focus:ring-emerald-300 font-medium"
        >
          <option value="">Semua Alat</option>
          {namaAlatList.map((alat, index) => (
            <option key={alat.id_nama_alat || index} value={alat.nama_nama_alat}>
              {alat.nama_nama_alat}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-accent-cyan-light to-accent-cyan-dark text-white rounded-lg font-bold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
      >
        <RotateCcw size={16} />
        <span>Reset Filter</span>
      </button>
    </div>
  );
}
