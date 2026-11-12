import React from 'react';

/**
 * Susunan baku area filter di atas tabel.
 *   Baris 1: pencarian (kiri) + aksi seperti Reset/Kolom (kanan)
 *   Baris 2: filter dalam grid sejajar
 *
 * Hanya tata letak; kontrolnya tetap komponen biasa (Input, SearchableSelect, Button, ColumnToggle).
 * Semua kontrol memakai tinggi 36px (size="sm"), latar putih, dan border abu agar seragam.
 *
 * @param {ReactNode} search     kolom pencarian
 * @param {ReactNode} actions    tombol di kanan baris pertama
 * @param {string}    gridClassName  kelas grid filter (default: 2 → 3 → 6 kolom)
 * @param {string}    className      kelas pembungkus (default mb-4; beri mb-0 bila FilterBar satu-satunya isi kartu)
 * `search` dan `actions` opsional; tanpa `search`, `actions` rata kiri.
 */
export default function FilterBar({
  search,
  actions,
  children,
  gridClassName = 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
  className = 'mb-4',
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {search && <div className="w-full sm:max-w-sm">{search}</div>}
        {actions && <div className={`flex items-center gap-2 ${search ? 'sm:ml-auto' : ''}`}>{actions}</div>}
      </div>
      {/* [&>*]:mb-0 — SearchableSelect membawa mb-4 sendiri; di grid, jarak diatur gap agar seragam. */}
      {React.Children.toArray(children).length > 0 && (
        <div className={`grid gap-3 [&>*]:!mb-0 ${gridClassName}`}>{children}</div>
      )}
    </div>
  );
}
