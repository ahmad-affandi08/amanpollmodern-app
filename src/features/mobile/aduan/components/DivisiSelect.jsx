import React from 'react';
import { useDivisiList } from '../../../../hooks/queries/useAduanQueries';

export default function DivisiSelect({ value, onChange, error }) {
  const { data: divisiList = [], isLoading } = useDivisiList();

  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-text-dark">
        Divisi <span className="text-red-500">*</span>
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${error
          ? 'border-red-300 focus:ring-red-200'
          : 'border-gray-200 focus:ring-purple-200 focus:border-purple-400'
          } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : ''}`}
      >
        <option value="">-- Pilih Divisi --</option>
        {divisiList.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {isLoading && <p className="text-xs text-gray-400">Loading divisi...</p>}
    </div>
  );
}
