import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../../../api/axiosClient';

export default function FilterBar({ filters, onFilterChange }) {
  // Fetch kategori list filtered by user's division
  const { data: kategoriData, isLoading: isLoadingKategori } = useQuery({
    queryKey: ['kategori-alat-mobile'],
    queryFn: async () => {
      const response = await axiosClient.get('/mobile/kategori-alat');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const kategoriList = Array.isArray(kategoriData) ? kategoriData : [];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i + 5);
  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  const handleChange = (key, value) => {
    // Apply filter immediately on change
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      tahun_filter: '', // Reset to placeholder
      bulan_filter: '',
      kategori_filter: ''
    };
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-[20px] p-3 shadow-lg shadow-gray-200/50 border border-gray-100/50">
      {/* Filters Row */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Year */}
        <select
          value={filters.tahun_filter}
          onChange={(e) => handleChange('tahun_filter', e.target.value)}
          className="px-2.5 py-2 text-xs font-medium bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg text-brand-primary focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">-- Tahun --</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        {/* Month */}
        <select
          value={filters.bulan_filter}
          onChange={(e) => handleChange('bulan_filter', e.target.value)}
          className="px-2.5 py-2 text-xs font-medium bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg text-info-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">-- Bulan --</option>
          {months.map(month => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
        </select>

        {/* Category */}
        <select
          value={filters.kategori_filter}
          onChange={(e) => handleChange('kategori_filter', e.target.value)}
          className="px-2.5 py-2 text-xs font-medium bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-lg text-accent-green focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <option value="">-- Kategori --</option>
          {kategoriList.map((kat, index) => (
            <option key={kat.id_kategori_alat || `kategori-${index}`} value={kat.id_kategori_alat}>
              {kat.nama_kategori}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button Only */}
      <button
        onClick={handleReset}
        className="w-full px-3 py-2 bg-gradient-to-br from-blue-400 to-info-600 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1.5"
      >
        <RotateCcw size={14} />
        <span>Reset Filter</span>
      </button>
    </div>
  );
}
