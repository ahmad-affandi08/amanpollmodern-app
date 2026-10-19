import { useState, useMemo, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from '../../../hooks';

export const PER_PAGE = 10;

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
 * - filter + pencarian (debounce) -> halaman otomatis kembali ke 1 saat filter berubah
 * - react-query: respons usang diabaikan (kunci query berbeda), data lama bertahan saat memuat
 * - gagal memuat -> total & pagination kembali kosong (tidak menampilkan angka lama)
 * - baris yang dibuka ditutup saat halaman/filter berubah
 *
 * @param {object} options
 * @param {string} options.queryName   nama kunci cache ('anggaran' | 'biaya')
 * @param {function} options.fetcher   mis. AnggaranApi.getAnalysis
 * @param {object} options.initialFilters
 * @param {object} options.emptyTotals
 */
export default function useAnggaranAnalysis({ queryName, fetcher, initialFilters, emptyTotals }) {
  const [filters, setFilters] = useState(initialFilters);
  const debouncedSearch = useDebounce(filters.search, 500);

  const params = useMemo(
    () => cleanParams({ ...filters, search: debouncedSearch, per_page: PER_PAGE }),
    [filters, debouncedSearch]
  );
  const filterKey = JSON.stringify(params);

  // Halaman disimpan bersama kunci filternya: filter berubah -> otomatis halaman 1,
  // tanpa effect tambahan.
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;

  const [expanded, setExpanded] = useState({ scope: '', id: null });
  const scope = `${filterKey}|${page}`;
  const expandedRow = expanded.scope === scope ? expanded.id : null;

  const query = useQuery({
    queryKey: ['pengaturan', queryName, { ...params, page }],
    queryFn: async () => normalize(await fetcher({ ...params, page }), emptyTotals),
    placeholderData: keepPreviousData,
  });

  // Saat gagal memuat, jangan menampilkan data/total lama.
  const result = query.isError || !query.data
    ? { items: [], totals: emptyTotals, meta: { currentPage: 1, totalPages: 1, totalItems: 0 } }
    : query.data;

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Memicu pemuatan satu kali saja: halaman kembali ke 1 lewat kunci filter yang berubah.
  const resetFilters = useCallback(() => setFilters(initialFilters), [initialFilters]);

  const goToPage = useCallback((nextPage) => {
    setPageState({ key: filterKey, page: nextPage });
  }, [filterKey]);

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => ({ scope, id: prev.scope === scope && prev.id === id ? null : id }));
  }, [scope]);

  return {
    filters,
    setFilter,
    resetFilters,
    items: result.items,
    totals: result.totals,
    meta: result.meta,
    perPage: PER_PAGE,
    goToPage,
    expandedRow,
    toggleExpand,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
