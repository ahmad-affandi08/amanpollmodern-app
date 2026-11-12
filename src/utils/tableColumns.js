/**
 * Kolom nomor urut yang ikut halaman server-side untuk <DataTable>.
 * Page cukup mengoper `rowOffset={(currentPage - 1) * perPage}` ke <DataTable>.
 */
export const indexColumn = ({ id = 'index', header = 'No' } = {}) => ({
  id,
  header,
  // Posisi baris di halaman yang tampil, bukan row.index: pada tabel klien (useLocalTable) row.index
  // adalah indeks di seluruh data sehingga nomor di halaman 2 dan seterusnya (atau saat difilter) salah.
  cell: ({ row, table }) => table.options.meta.rowOffset + table.getRowModel().rows.indexOf(row) + 1,
  meta: { cellClassName: 'font-medium text-text-dark' },
});
