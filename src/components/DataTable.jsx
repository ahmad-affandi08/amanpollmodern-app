import React from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { Inbox, AlertCircle } from 'lucide-react';
import TableSkeleton from './TableSkeleton';
import Pagination from './Pagination';
import TablePagination from './TablePagination';

const ALIGN = { right: 'text-right', center: 'text-center' };

/**
 * Menjalankan `header`/`cell` kolom langsung, bukan lewat flexRender. flexRender membungkus fungsi sebagai
 * KOMPONEN; karena `columns` dibuat ulang tiap render, React menganggapnya tipe baru lalu membongkar-pasang
 * isi sel setiap render (state di dalam sel hilang, gambar berkedip, menu tertutup). Dipanggil langsung,
 * hasilnya hanya elemen biasa sehingga DOM dipertahankan. Konsekuensi: fungsi `header`/`cell` tidak boleh memakai
 * hook (aturan lint rules-of-hooks sudah menjaga ini); komponen yang dirender DI DALAMNYA bebas memakai hook.
 */
const renderDef = (def, context) => (typeof def === 'function' ? def(context) : def);

/** Tampilan tabel dari sebuah instance TanStack. Tidak punya state sendiri. */
function DataTableView({
  table,
  isLoading = false,
  skeletonRows = 5,
  empty,
  error,
  rowClassName,
  onRowClick,
  renderSubRow,
  footer,
  pagination,
  stickyHeader = false,
  containerClassName = '',
  tableClassName = '',
}) {
  const colCount = Math.max(1, table.getVisibleLeafColumns().length);
  const rows = table.getRowModel().rows;
  const EmptyIcon = empty?.icon ?? Inbox;

  // Pagination: dari prop `pagination` (usePagination, mode lama) atau dari state TanStack (mode server/klien).
  const tablePaginated = !pagination && table.options.meta?.paginated;

  return (
    <>
      <div className={`overflow-x-auto rounded-xl border border-gray-100 ${containerClassName}`}>
        <table className={`w-full text-left border-collapse whitespace-nowrap ${tableClassName}`}>
          <thead className={stickyHeader ? 'sticky top-0 z-10 shadow-sm' : ''}>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="bg-bg-light border-b border-gray-100">
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  return (
                    <th
                      key={header.id}
                      className={`py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider bg-bg-light ${ALIGN[meta?.align] ?? ''} ${meta?.headerClassName ?? ''}`}
                    >
                      {header.isPlaceholder ? null : renderDef(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-50 text-xs">
            {isLoading ? (
              <TableSkeleton rows={skeletonRows} columns={colCount} />
            ) : error ? (
              <tr>
                <td colSpan={colCount} className="py-10 text-center">
                  <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
                  <p className="font-bold text-red-500 text-sm">{error.title ?? 'Gagal memuat data'}</p>
                  {error.description && <p className="text-xs text-gray-400 mt-1">{error.description}</p>}
                  {error.onRetry && (
                    <button type="button" onClick={error.onRetry} className="mt-2 text-brand-primary font-semibold hover:underline">
                      Coba lagi
                    </button>
                  )}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="py-10 text-center">
                  <EmptyIcon size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="font-bold text-gray-600 text-sm">{empty?.title ?? 'Tidak ada data'}</p>
                  {empty?.description && <p className="text-xs text-gray-400 mt-1">{empty.description}</p>}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    className={`hover:bg-gray-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName?.(row.original) ?? ''}`}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta;
                      return (
                        <td
                          key={cell.id}
                          className={`py-2.5 px-4 ${ALIGN[meta?.align] ?? ''} ${meta?.cellClassName ?? ''}`}
                        >
                          {renderDef(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                  {renderSubRow?.(row.original, colCount)}
                </React.Fragment>
              ))
            )}
          </tbody>

          {footer && !isLoading && <tfoot>{footer}</tfoot>}
        </table>
      </div>

      {(pagination || tablePaginated) && (
        <div className="mt-4">
          {pagination ? (
            <Pagination
              size="sm"
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goToPage}
              totalData={pagination.totalItems}
              perPage={pagination.perPage}
            />
          ) : (
            <TablePagination table={table} />
          )}
        </div>
      )}
    </>
  );
}

/** Mode lama: DataTable membuat instance TanStack sendiri; filter & pagination tetap milik page. */
function SelfContainedTable({ columns, data, columnVisibility, rowOffset = 0, getRowId, ...view }) {
  // TanStack mengembalikan fungsi yang tak bisa dimemoisasi React Compiler; aman, komponen ini memang tidak perlu dimemoisasi.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility: columnVisibility ?? {} },
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId ? (row) => String(getRowId(row)) : undefined,
    meta: { rowOffset },
  });
  return <DataTableView table={table} {...view} />;
}

/**
 * DataTable — satu tabel untuk semua page (TanStack Table v8).
 *
 * Dua mode:
 *  1. `table` — instance dari useDataTable (hooks/utils/useServerTable). Filter, pencarian, dan pagination
 *     dikendalikan state TanStack; pagination dirender otomatis dari instance.
 *  2. `columns` + `data` (mode lama) — filter/pagination masih useFilters/usePagination di page.
 *
 * @param {import('@tanstack/react-table').Table} table   mode 1
 * @param {import('@tanstack/react-table').ColumnDef[]} columns   mode 2. `id` = `key` di COLUMN_DEFS bila memakai useColumnToggle.
 *   `meta`: { align: 'right' | 'center', headerClassName, cellClassName }
 * @param {Array}    data             mode 2
 * @param {Object}   columnVisibility mode 2: `visibleColumns` dari useColumnToggle ({ [id]: boolean })
 * @param {number}   rowOffset        mode 2: offset nomor urut (lihat indexColumn di utils/tableColumns)
 * @param {Function} getRowId         mode 2: (row) => string, default indeks baris
 * @param {boolean}  isLoading        tampilkan skeleton sebanyak kolom yang terlihat
 * @param {number}   skeletonRows
 * @param {{icon?, title?, description?}} empty  tampilan data kosong
 * @param {{title?, description?, onRetry?}} error  tampilan gagal memuat (isi tabel diganti, header tetap); isi bila query isError
 * @param {Function} rowClassName     (row) => string tambahan untuk <tr>
 * @param {Function} onRowClick       (row) => void, baris jadi clickable
 * @param {Function} renderSubRow     (row, colCount) => <tr> | null, baris turunan (expand)
 * @param {ReactNode} footer          isi <tfoot> (berupa <tr>)
 * @param {Object}   pagination       mode 2: return dari usePagination; bila ada, Pagination ikut dirender
 * @param {boolean}  stickyHeader     header menempel saat scroll (isi containerClassName dengan max-h-*)
 */
export default function DataTable({ table, ...props }) {
  return table ? <DataTableView table={table} {...props} /> : <SelfContainedTable {...props} />;
}
