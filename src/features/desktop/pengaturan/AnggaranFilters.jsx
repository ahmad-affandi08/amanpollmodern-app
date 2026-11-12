import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import FilterBar from '../../../components/FilterBar';
import { getTableFilters } from '../../../hooks/utils/useServerTable';
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
 * Filter/pencarian dibaca dan diubah lewat state TanStack (`table` dari useDataTable).
 * Opsi divisi/kategori/ruangan memakai hook master (cache bersama, ?all=1).
 */
export default function AnggaranFilters({ table, showDivisi = true, showYear = false }) {
  const f = getTableFilters(table);
  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const { data: kategoriData } = useMasterKategori({ all: 1 });

  const ruanganOptions = toOptions(ruanganData?.data, 'id_ruangan', 'nama_ruangan');
  const divisiOptions = toOptions(divisiData?.data, 'id_divisi', 'nama_divisi');
  const kategoriOptions = toOptions(kategoriData?.data, 'id', 'nama_kategori');

  const columns = 2 + (showDivisi ? 1 : 0) + (showYear ? 1 : 0);
  const gridCols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }[columns];

  return (
    // [&>div]:!mb-0 — FilterBar membawa mb-4 untuk tabel di bawahnya; di sini kartu hanya berisi filter.
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm [&>div]:!mb-0">
      <FilterBar
        search={
          <Input
            name="search"
            size="sm"
            placeholder="Nama alat atau no inventaris..."
            aria-label="Cari Alat / No Inv"
            value={f.search}
            onChange={(e) => f.setSearch(e.target.value)}
            icon={<Search className="w-3.5 h-3.5" />}
            className="!bg-white"
          />
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={f.reset}
            className="!rounded-lg whitespace-nowrap border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary gap-1.5"
          >
            <RotateCcw size={14} />
            Reset Filter
          </Button>
        }
        gridClassName={`grid-cols-1 ${gridCols}`}
      >
        {showYear && (
          <SearchableSelect
            label="Tahun Analisis"
            name="tahun_filter"
            size="sm"
            placeholder="-- Pilih Tahun --"
            searchPlaceholder="Cari tahun..."
            options={YEAR_OPTIONS}
            value={f.get('tahun_filter')}
            onChange={(e) => f.set('tahun_filter', e.target.value)}
          />
        )}

        {showDivisi && (
          <SearchableSelect
            label="Divisi"
            name="divisi_id"
            size="sm"
            placeholder="-- Pilih Divisi --"
            searchPlaceholder="Cari divisi..."
            options={divisiOptions}
            value={f.get('divisi_id')}
            onChange={(e) => f.set('divisi_id', e.target.value)}
          />
        )}

        <SearchableSelect
          label="Kategori Alat"
          name="kategori_alat_id"
          size="sm"
          placeholder="-- Kategori Alat --"
          searchPlaceholder="Cari kategori..."
          options={kategoriOptions}
          value={f.get('kategori_alat_id')}
          onChange={(e) => f.set('kategori_alat_id', e.target.value)}
        />

        <SearchableSelect
          label="Bagian / Ruangan"
          name="ruangan_id"
          size="sm"
          placeholder="-- Bagian/Ruangan --"
          searchPlaceholder="Cari ruangan..."
          options={ruanganOptions}
          value={f.get('ruangan_id')}
          onChange={(e) => f.set('ruangan_id', e.target.value)}
        />
      </FilterBar>
    </div>
  );
}
