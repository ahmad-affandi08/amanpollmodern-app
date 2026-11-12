import { useState, useMemo, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTableState } from '../../../hooks/utils/useServerTable';

export const PER_PAGE = 10;

// Filter kolom TanStack -> parameter query server (nama sama). Konstanta di luar komponen (dipakai sebagai dependensi memo).
const FILTER_MAP = {
  divisi_id: 'divisi_id',
  kategori_alat_id: 'kategori_alat_id',
  ruangan_id: 'ruangan_id',
  tahun_filter: 'tahun_filter',
};

/** Angka aman untuk .toFixed() dan perhitungan: nilai non-angka menjadi 0. */
export const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

/** Hapus filter kosong supaya tidak ikut dikirim ke server. */
const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));

/**
 * Bentuk respons `{ data: { totals, items: <paginator Laravel> } }` menjadi
 * { items, totals, meta }. Bila respons tidak sesuai, hasilnya kosong (bukan data lama).
 */
const normalize = (res, emptyTotals) => {
  const payload = res?.data?.data;
  const paginator = payload?.items;
  const rows = Array.isArray(paginator?.data)
    ? paginator.data
    : (Array.isArray(paginator) ? paginator : []);

  return {
    items: rows,
    totals: { ...emptyTotals, ...(payload?.totals || {}) },
    meta: {
      currentPage: paginator?.current_page || 1,
      totalPages: paginator?.last_page || 1,
      totalItems: paginator?.total ?? rows.length,
    },
  };
};

/**
 * State bersama halaman Anggaran Pemeliharaan dan Biaya Perbaikan (perilakunya harus sama):
 * - filter + pencarian (debounce) + halaman disimpan di state TanStack (useTableState); halaman kembali ke 1 saat filter berubah
 * - react-query: respons usang diabaikan (kunci query berbeda), data lama bertahan saat memuat
 * - gagal memuat -> total & pagination kembali kosong (tidak menampilkan angka lama)
 * - baris yang dibuka ditutup saat halaman/filter berubah
 *
 * Page membuat tabelnya dengan useDataTable({ tableState, data: items, pageCount: meta.totalPages, rowCount: meta.totalItems }).
 *
 * @param {object} options
 * @param {string} options.queryName   nama kunci cache ('anggaran' | 'biaya')
 * @param {function} options.fetcher   mis. AnggaranApi.getAnalysis
 * @param {Array}  options.initialFilters  filter awal TanStack, mis. [{ id: 'tahun_filter', value: '2026' }]; "Reset Filter" kembali ke sini
 * @param {object} options.emptyTotals
 */
export default function useAnggaranAnalysis({ queryName, fetcher, initialFilters = [], emptyTotals }) {
  const tableState = useTableState({ pageSize: PER_PAGE, filterMap: FILTER_MAP, searchDelay: 500, initialFilters });

  const params = useMemo(() => cleanParams(tableState.params), [tableState.params]);
  // Kunci filter + halaman: berubah -> baris yang dibuka ditutup.
  const scope = JSON.stringify(params);

  const [expanded, setExpanded] = useState({ scope: '', id: null });
  const expandedRow = expanded.scope === scope ? expanded.id : null;

  const query = useQuery({
    queryKey: ['pengaturan', queryName, params],
    queryFn: async () => normalize(await fetcher(params), emptyTotals),
    placeholderData: keepPreviousData,
  });

  // Saat gagal memuat, jangan menampilkan data/total lama.
  const result = query.isError || !query.data
    ? { items: [], totals: emptyTotals, meta: { currentPage: 1, totalPages: 1, totalItems: 0 } }
    : query.data;

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => ({ scope, id: prev.scope === scope && prev.id === id ? null : id }));
  }, [scope]);

  return {
    tableState,
    items: result.items,
    totals: result.totals,
    meta: result.meta,
    expandedRow,
    toggleExpand,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
