import { useState, useMemo, useEffect, useCallback } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { useDebounce } from './useDebounce';

// Kolom tampilan tidak punya accessor, padahal TanStack hanya memfilter global pada kolom ber-accessor.
// Kolom tersembunyi ini membawa seluruh baris sehingga pencarian dievaluasi sekali atas data aslinya.
const SEARCH_COLUMN_ID = '__search';
const SEARCH_COLUMN = { id: SEARCH_COLUMN_ID, header: '', accessorFn: (row) => row, enableColumnFilter: false };

/**
 * Susun objek filter untuk query server dari state TanStack.
 * Semua kunci filter selalu ada (string kosong) supaya request sama persis dengan versi useFilters lama.
 *
 * @param {Object} filterMap  { [columnId]: 'nama_param' | ['param_min', 'param_max'] }
 *                            string → nilai tunggal; array → rentang [min, max] pada satu kolom.
 */
export function buildFilters(filterMap, columnFilters, globalFilter) {
  const out = { search: globalFilter ?? '' };
  Object.values(filterMap).flat().forEach((key) => { out[key] = ''; });
  columnFilters.forEach(({ id, value }) => {
    const target = filterMap[id];
    if (!target) return;
    if (Array.isArray(target)) target.forEach((key, i) => { out[key] = value?.[i] ?? ''; });
    else out[target] = value ?? '';
  });
  return out;
}

/**
 * State tabel server-side (TanStack): pagination, columnFilters, globalFilter.
 * Dipakai SEBELUM query, karena `params` dikirim ke server; hasil query lalu masuk ke useDataTable.
 *
 * `filterMap` harus konstanta di luar komponen (referensinya dipakai sebagai dependensi memo).
 * Mengubah filter/pencarian otomatis kembali ke halaman 1.
 *
 * @param {Array}  initialFilters  filter awal bila tidak kosong, mis. [{ id: 'tahun', value: '2026' }];
 *                                 "Reset Filter" kembali ke nilai ini (bukan ke kosong)
 * @param {string} initialSearch   pencarian awal
 * @param {boolean} resetPageOnFilter  false bila filter hanya menyaring halaman yang sedang tampil (mis. notifikasi)
 *
 * @returns {{ state, handlers, filters, params }}
 *   filters — filter mentah (untuk export/cetak); params — filter + page/per_page, search sudah di-debounce.
 */
export function useTableState({ pageSize = 10, filterMap = {}, searchDelay = 500, initialFilters = [], initialSearch = '', resetPageOnFilter = true } = {}) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const [columnFilters, setColumnFilters] = useState(initialFilters);
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [initial] = useState(() => ({ columnFilters: initialFilters, globalFilter: initialSearch }));
  const debouncedSearch = useDebounce(globalFilter, searchDelay);

  const resetPage = useCallback(
    () => setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 })),
    []
  );
  const onColumnFiltersChange = useCallback((updater) => { setColumnFilters(updater); if (resetPageOnFilter) resetPage(); }, [resetPage, resetPageOnFilter]);
  const onGlobalFilterChange = useCallback((updater) => { setGlobalFilter(updater); if (resetPageOnFilter) resetPage(); }, [resetPage, resetPageOnFilter]);

  const filters = useMemo(
    () => buildFilters(filterMap, columnFilters, globalFilter),
    [filterMap, columnFilters, globalFilter]
  );
  const params = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch ?? '',
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    }),
    [filters, debouncedSearch, pagination]
  );

  return {
    state: { pagination, columnFilters, globalFilter },
    handlers: { onPaginationChange: setPagination, onColumnFiltersChange, onGlobalFilterChange },
    initial,
    filters,
    params,
  };
}

/**
 * Instance TanStack Table untuk data hasil query server (pagination & filter manual).
 * Page memakai instance ini untuk filter (`table.getColumn(id).setFilterValue`, `table.setGlobalFilter`,
 * `table.resetColumnFilters`) dan meneruskannya ke <DataTable table={table} />.
 *
 * @param {Object} tableState  return dari useTableState
 * @param {number} pageCount   total halaman dari server (meta.last_page)
 * @param {number} rowCount    total data dari server (meta.total)
 * @param {Function} matchSearch  (barisAsli, teksKecil) => boolean. Bila diisi → MODE HIBRIDA: paginasi tetap dari server,
 *                              tetapi pencarian dan filter kolom (`filterFn` pada definisi kolom) menyaring baris di halaman
 *                              yang sedang tampil, dihitung TanStack (getFilteredRowModel). Untuk API yang hanya mendukung page/per_page.
 */
export function useDataTable({ columns, data, tableState, pageCount, rowCount, columnVisibility, getRowId, matchSearch }) {
  const { state, handlers } = tableState;
  const { pageIndex, pageSize } = state.pagination;
  const hybrid = typeof matchSearch === 'function';

  // TanStack mengembalikan fungsi yang tak bisa dimemoisasi React Compiler; aman, hook ini memang tidak perlu dimemoisasi.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: hybrid ? [SEARCH_COLUMN, ...columns] : columns,
    getCoreRowModel: getCoreRowModel(),
    ...(hybrid && {
      getFilteredRowModel: getFilteredRowModel(),
      getColumnCanGlobalFilter: (column) => column.id === SEARCH_COLUMN_ID,
      globalFilterFn: (row, _columnId, value) => {
        const text = String(value ?? '').trim().toLowerCase();
        return !text || matchSearch(row.original, text);
      },
    }),
    getRowId: getRowId ? (row) => String(getRowId(row)) : undefined,
    manualPagination: true,
    manualFiltering: !hybrid,
    initialState: tableState.initial, // target resetColumnFilters()/resetGlobalFilter()
    pageCount: pageCount ?? 1,
    rowCount: rowCount ?? 0,
    state: { ...state, columnVisibility: hybrid ? { ...columnVisibility, [SEARCH_COLUMN_ID]: false } : (columnVisibility ?? {}) },
    ...handlers,
    meta: { rowOffset: pageIndex * pageSize, paginated: true },
  });

  // Bila halaman yang diminta sudah tidak ada (mis. baris terakhir di halaman terakhir dihapus), mundur ke halaman terakhir.
  useEffect(() => {
    if (pageCount > 0 && pageIndex >= pageCount) table.setPageIndex(pageCount - 1);
  }, [pageCount, pageIndex, table]);

  return table;
}

/**
 * API filter di atas instance TanStack: nilai & pengubah per id filter, tanpa harus ada kolom dengan id itu
 * (filter seperti rentang tanggal bisa dipetakan ke parameter server lewat filterMap saja).
 * Nilai kosong ('' / undefined / null) menghapus filter. Mengubah filter otomatis kembali ke halaman 1.
 *
 *   const f = getTableFilters(table);
 *   f.get('kondisi_alat')            // '' bila belum diisi
 *   f.set('kondisi_alat', 'Baik')
 *   f.getRange('tanggal')            // ['', '']
 *   f.setRangePart('tanggal', 0, '2024-01-01')   // 0 = awal, 1 = akhir
 *   f.search / f.setSearch(text)     // pencarian (globalFilter)
 *   f.reset()                        // tombol Reset Filter (kembali ke filter awal)
 */
export function getTableFilters(table) {
  const current = table.getState().columnFilters;
  const isEmpty = (v) => v === undefined || v === null || v === '';

  const get = (id) => current.find((f) => f.id === id)?.value ?? '';
  const getRange = (id) => current.find((f) => f.id === id)?.value ?? ['', ''];
  const set = (id, value) =>
    table.setColumnFilters((old) => {
      const rest = old.filter((f) => f.id !== id);
      return isEmpty(value) ? rest : [...rest, { id, value }];
    });
  const setRangePart = (id, index, value) =>
    table.setColumnFilters((old) => {
      const rest = old.filter((f) => f.id !== id);
      const next = [...(old.find((f) => f.id === id)?.value ?? ['', ''])];
      next[index] = value;
      return next.every(isEmpty) ? rest : [...rest, { id, value: next }];
    });
  // Kembali ke filter awal (kosong bila useTableState tidak diberi initialFilters/initialSearch).
  const reset = () => {
    table.resetColumnFilters();
    table.resetGlobalFilter();
  };

  return { get, getRange, set, setRangePart, reset, search: table.getState().globalFilter ?? '', setSearch: table.setGlobalFilter };
}

/**
 * Instance TanStack untuk data yang SUDAH dimuat seluruhnya di klien (tanpa query per halaman):
 * pencarian, filter kolom, dan pagination dihitung oleh TanStack (getFilteredRowModel + getPaginationRowModel).
 *
 * @param {Function} matchSearch  (barisAsli, teksKecil) => boolean — aturan pencarian (teks sudah trim + huruf kecil)
 * @param {number}   pageSize
 * Filter kolom: beri `filterFn: (row, columnId, nilai) => boolean` pada definisi kolom (pakai `row.original`),
 * lalu atur dengan getTableFilters(table). Dipakai bersama <DataTable table={table} />.
 */
export function useLocalTable({ columns, data, pageSize = 10, columnVisibility, getRowId, matchSearch }) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const { pageIndex } = pagination;

  const resetPage = useCallback(
    () => setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 })),
    []
  );
  const onColumnFiltersChange = useCallback((updater) => { setColumnFilters(updater); resetPage(); }, [resetPage]);
  const onGlobalFilterChange = useCallback((updater) => { setGlobalFilter(updater); resetPage(); }, [resetPage]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: [SEARCH_COLUMN, ...columns],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getRowId ? (row) => String(getRowId(row)) : undefined,
    // Halaman dijaga manual (kembali ke 1 saat filter berubah, mundur saat baris terakhir dihapus), bukan reset otomatis.
    autoResetPageIndex: false,
    getColumnCanGlobalFilter: (column) => column.id === SEARCH_COLUMN_ID,
    globalFilterFn: (row, _columnId, value) => {
      const text = String(value ?? '').trim().toLowerCase();
      return !text || !matchSearch || matchSearch(row.original, text);
    },
    state: { pagination, columnFilters, globalFilter, columnVisibility: { ...columnVisibility, [SEARCH_COLUMN_ID]: false } },
    onPaginationChange: setPagination,
    onColumnFiltersChange,
    onGlobalFilterChange,
    meta: { rowOffset: pageIndex * pagination.pageSize, paginated: true },
  });

  const pageCount = table.getPageCount();
  useEffect(() => {
    if (pageCount > 0 && pageIndex >= pageCount) table.setPageIndex(pageCount - 1);
  }, [pageCount, pageIndex, table]);

  return table;
}
