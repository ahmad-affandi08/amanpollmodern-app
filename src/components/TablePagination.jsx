import React from 'react';
import Pagination from './Pagination';

/**
 * Pagination dari instance TanStack (useDataTable / useLocalTable). Dipakai <DataTable> dan daftar non-tabel
 * (kartu, notifikasi) agar halaman, total, dan jumlah per halaman selalu bersumber dari state tabel.
 */
export default function TablePagination({ table, className = '' }) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  return (
    <Pagination
      size="sm"
      className={className}
      currentPage={pageIndex + 1}
      totalPages={pageCount}
      onPageChange={(page) => table.setPageIndex(Math.max(1, Math.min(page, pageCount)) - 1)}
      totalData={table.getRowCount()}
      perPage={pageSize}
    />
  );
}
