import React, { useState } from 'react';
import { RotateCcw, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../../../api/axiosClient';
import SearchableSelect from '../../../../components/SearchableSelect';

export default function InventarisFilters({ filters, onFilterChange, onExport }) {
  const [isExporting, setIsExporting] = useState(false);


  const { data: namaAlatData } = useQuery({
    queryKey: ['nama-alat'],
    queryFn: async () => {
      const response = await axiosClient.get('/nama-alat');
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const namaAlatList = Array.isArray(namaAlatData) ? namaAlatData : [];

  const kondisiOptions = [
    { value: '', label: 'Semua Kondisi' },
    { value: 'Baik', label: 'Baik' },
    { value: 'Rusak Ringan', label: 'Rusak Ringan' },
    { value: 'Rusak Berat', label: 'Rusak Berat' },
  ];

  const handleChange = (field, value) => {

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
        <SearchableSelect
          label="Kondisi Alat"
          name="kondisi_alat"
          options={kondisiOptions}
          value={filters.kondisi_alat || ''}
          onChange={(e) => handleChange('kondisi_alat', e.target.value)}
          placeholder="Semua Kondisi"
          searchPlaceholder="Cari kondisi..."
          displayKey="label"
          valueKey="value"
          className="w-full"
        />
      </div>

      {/* Nama Alat */}
      <div className="space-y-1">
        <SearchableSelect
          label="Nama Alat"
          name="nama_alat"
          options={namaAlatList}
          value={filters.nama_alat || ''}
          onChange={(e) => handleChange('nama_alat', e.target.value)}
          placeholder="Semua Alat"
          searchPlaceholder="Cari nama alat..."
          displayKey="nama_nama_alat"
          valueKey="nama_nama_alat"
          className="w-full"
        />
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
