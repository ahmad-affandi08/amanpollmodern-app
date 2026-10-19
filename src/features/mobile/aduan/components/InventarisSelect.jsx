import React from 'react';
import { useInventaris } from '../../../../hooks';
import SearchableSelect from '../../../../components/SearchableSelect';

export default function InventarisSelect({ ruanganId, value, onChange, onInventarisChange, error }) {
  const { data: inventarisData, isLoading } = useInventaris({ ruangan_id: ruanganId, per_page: 500 });


  const inventarisList = inventarisData?.data || [];

  const handleChange = (e) => {
    const selectedId = e.target.value;


    if (onChange) {
      onChange(e);
    }

    if (selectedId && inventarisList.length > 0) {
      const found = inventarisList.find(
        (inv) => String(inv.id) === String(selectedId)
      );
      if (found) {

        const transformedData = {
          id_inventaris: found.id,
          id_nama_alat: found.nama_alat?.id || null,
          no_inventaris: found.no_inventaris,
          nama_alat: found.nama_alat?.nama_nama_alat || '-',
          merk: found.merk || '',
          divisi_id: found.divisi?.id_divisi ?? found.nama_alat?.divisi_id ?? null,
          nama_divisi: found.divisi?.nama_divisi || found.nama_alat?.divisi?.nama_divisi || '',
        };

        if (onInventarisChange) {
          onInventarisChange(transformedData);
        }
      } else {
        if (onInventarisChange) {
          onInventarisChange(null);
        }
      }
    } else {
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


  const options = inventarisList.map((inv) => ({
    value: inv.id,
    label: `${inv.nama_alat?.nama_nama_alat || '-'} - ${inv.no_inventaris}`,
    namaAlat: inv.nama_alat?.nama_nama_alat || '-',
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
