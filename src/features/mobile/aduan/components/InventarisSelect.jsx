import React, { useEffect, useState } from 'react';
import { useInventaris } from '../../../../hooks';
import SearchableSelect from '../../../../components/SearchableSelect';

export default function InventarisSelect({ ruanganId, value, onChange, onInventarisChange, error }) {
  const { data: inventarisData, isLoading } = useInventaris({ ruangan_id: ruanganId, per_page: 500 });

  const [selectedInventaris, setSelectedInventaris] = useState(null);

  // Extract data from response
  const inventarisList = inventarisData?.data || [];

  const handleChange = (e) => {
    const selectedId = e.target.value;

    // Call parent onChange with the event
    if (onChange) {
      onChange(e);
    }

    if (selectedId && inventarisList.length > 0) {
      const found = inventarisList.find(
        (inv) => String(inv.id_inventaris || inv.id) === String(selectedId)
      );
      if (found) {
        // Transform to match expected structure
        const transformedData = {
          id_inventaris: found.id_inventaris || found.id,
          id_nama_alat: found.nama_alat?.id || null, // Fixed: use nama_alat.id
          no_inventaris: found.no_inventaris,
          nama_alat: found.nama_alat?.nama_nama_alat || 'Unknown',
          merk: found.merk || found.type || '',
          divisi_id: found.nama_alat?.divisi_id || null,
          nama_divisi: found.nama_alat?.divisi?.nama_divisi || '',
        };

        setSelectedInventaris(found);
        if (onInventarisChange) {
          onInventarisChange(transformedData);
        }
      } else {
        setSelectedInventaris(null);
        if (onInventarisChange) {
          onInventarisChange(null);
        }
      }
    } else {
      setSelectedInventaris(null);
      if (onInventarisChange) {
        onInventarisChange(null);
      }
    }
  };

  if (!ruanganId) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pilih Alat <span className="text-red-500">*</span>
        </label>
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-400 text-sm">
          Pilih ruangan terlebih dahulu
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pilih Alat <span className="text-red-500">*</span>
        </label>
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-400 text-sm animate-pulse">
          Memuat data alat...
        </div>
      </div>
    );
  }

  // Format options for SearchableSelect
  const options = inventarisList.map((inv) => ({
    value: inv.id_inventaris || inv.id,
    label: `${inv.nama_alat?.nama_nama_alat || 'Unknown'} - ${inv.no_inventaris}`,
    // Store additional data for display
    namaAlat: inv.nama_alat?.nama_nama_alat || 'Unknown',
    noInventaris: inv.no_inventaris,
  }));

  return (
    <div className="mb-4">
      <SearchableSelect
        label="Pilih Alat"
        options={options}
        value={value}
        onChange={handleChange}
        placeholder="Pilih alat yang rusak"
        searchPlaceholder="Cari nama alat atau nomor inventaris..."
        required
        disabled={inventarisList.length === 0}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {inventarisList.length === 0 && (
        <p className="text-gray-400 text-xs mt-1">
          Tidak ada alat tersedia di ruangan ini
        </p>
      )}
    </div>
  );
}
