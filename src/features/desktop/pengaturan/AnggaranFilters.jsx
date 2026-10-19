import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import { useMasterRuangan, useMasterDivisi, useMasterKategori } from '../../../hooks';

const toOptions = (rows, valueKey, labelKey) =>
  (Array.isArray(rows) ? rows : []).map((row) => ({ value: row[valueKey], label: row[labelKey] }));

const buildYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2020; year -= 1) {
    years.push({ value: String(year), label: String(year) });
  }
  return years;
};

const YEAR_OPTIONS = buildYearOptions();

/**
 * Blok filter yang sama untuk halaman Anggaran Pemeliharaan dan Biaya Perbaikan.
 * Opsi divisi/kategori/ruangan memakai hook master (cache bersama, ?all=1).
 */
export default function AnggaranFilters({ filters, onChange, onReset, showDivisi = true, showYear = false }) {
  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const { data: kategoriData } = useMasterKategori({ all: 1 });

  const ruanganOptions = toOptions(ruanganData?.data, 'id_ruangan', 'nama_ruangan');
  const divisiOptions = toOptions(divisiData?.data, 'id_divisi', 'nama_divisi');
  const kategoriOptions = toOptions(kategoriData?.data, 'id', 'nama_kategori');

  const columns = 3 + (showDivisi ? 1 : 0) + (showYear ? 1 : 0);
  const gridCols = { 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5' }[columns];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
        <div>
          <label className="block text-xs font-semibold text-[#808191] mb-1.5 pl-1">Cari Alat / No Inv</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nama alat atau no inventaris..."
              className="w-full px-3 py-2 bg-bg-light border border-gray-200 rounded-lg text-text-dark text-sm font-medium outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-gray-400"
              value={filters.search}
              onChange={(e) => onChange('search', e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {showYear && (
          <SearchableSelect
            label="Tahun Analisis"
            name="tahun_filter"
            placeholder="-- Pilih Tahun --"
            searchPlaceholder="Cari tahun..."
            options={YEAR_OPTIONS}
            value={filters.tahun_filter}
            onChange={(e) => onChange('tahun_filter', e.target.value)}
          />
        )}

        {showDivisi && (
          <SearchableSelect
            label="Divisi"
            name="divisi_id"
            placeholder="-- Pilih Divisi --"
            searchPlaceholder="Cari divisi..."
            options={divisiOptions}
            value={filters.divisi_id}
            onChange={(e) => onChange('divisi_id', e.target.value)}
          />
        )}

        <SearchableSelect
          label="Kategori Alat"
          name="kategori_alat_id"
          placeholder="-- Kategori Alat --"
          searchPlaceholder="Cari kategori..."
          options={kategoriOptions}
          value={filters.kategori_alat_id}
          onChange={(e) => onChange('kategori_alat_id', e.target.value)}
        />

        <SearchableSelect
          label="Bagian / Ruangan"
          name="ruangan_id"
          placeholder="-- Bagian/Ruangan --"
          searchPlaceholder="Cari ruangan..."
          options={ruanganOptions}
          value={filters.ruangan_id}
          onChange={(e) => onChange('ruangan_id', e.target.value)}
        />
      </div>

      <div className="flex justify-end mt-1">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-primary transition-colors"
        >
          <RotateCcw size={14} />
          Reset Filter
        </button>
      </div>
    </div>
  );
}
