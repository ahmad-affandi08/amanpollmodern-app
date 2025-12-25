import React, { useState, useEffect } from 'react';
import { Hammer, Search, AlertTriangle, CheckCircle, TrendingUp, Info } from 'lucide-react';
import AnggaranApi from '../../../api/AnggaranApi';
import TableSkeleton from '../../../components/TableSkeleton';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import SearchableSelect from '../../../components/SearchableSelect';
import RuanganApi from '../../../api/RuanganApi';
import DivisiApi from '../../../api/DivisiApi';
import KategoriAlatApi from '../../../api/KategoriAlatApi';
import Pagination from '../../../components/Pagination';

export default function BiayaPerbaikan() {
  usePageTitle('Biaya Perbaikan');
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ total_biaya_aktual: 0, total_mmel: 0, jumlah_ganti_aset: 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    totalItems: 0
  });
  const [expandedRow, setExpandedRow] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    divisi_id: '',
    kategori_alat_id: '',
    ruangan_id: '',
    tahun_pengadaan: '',
    search: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [ruanganOptions, setRuanganOptions] = useState([]);
  const [divisiOptions, setDivisiOptions] = useState([]);
  const [kategoriOptions, setKategoriOptions] = useState([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    fetchData(1, { ...filters, search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.divisi_id, filters.kategori_alat_id, filters.ruangan_id, filters.tahun_pengadaan, debouncedSearch]);

  const fetchOptions = async () => {
    try {
      const [resRuangan, resDivisi, resKategori] = await Promise.all([
        RuanganApi.getAll(),
        DivisiApi.getAll(),
        KategoriAlatApi.getAll()
      ]);

      const ruanganData = Array.isArray(resRuangan) ? resRuangan : (resRuangan.data || []);
      const divisiData = Array.isArray(resDivisi) ? resDivisi : (resDivisi.data || []);
      const kategoriData = Array.isArray(resKategori) ? resKategori : (resKategori.data || []);

      setRuanganOptions(ruanganData.map(r => ({ value: r.id_ruangan, label: r.nama_ruangan })));
      setDivisiOptions(divisiData.map(d => ({ value: d.id_divisi, label: d.nama_divisi })));
      setKategoriOptions(kategoriData.map(k => ({ value: k.id, label: k.nama_kategori })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      // Clean filters
      const cleanedFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '' && v != null)
      );

      const params = {
        ...cleanedFilters,
        page: page,
        per_page: pagination.perPage
      };

      const res = await AnggaranApi.getRepairAnalysis(params);
      const responseData = res.data.data;

      // Check structure: { items: { data: [], ... }, totals: { ... } }
      if (responseData && responseData.items) {
        setData(responseData.items.data || []);
        setTotals(responseData.totals || { total_biaya_aktual: 0, total_mmel: 0, jumlah_ganti_aset: 0 });
        setPagination(prev => ({
          ...prev,
          currentPage: responseData.items.current_page,
          totalPages: responseData.items.last_page,
          totalItems: responseData.items.total
        }));
      } else if (responseData && responseData.data) {
        // Fallback if previous structure
        setData(responseData.data || []);
      } else {
        setData([]);
      }

    } catch (error) {
      console.error(error);
      showToast('Gagal memuat data analisis perbaikan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page) => {
    fetchData(page, filters);
  };

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-dark flex items-center gap-2">
          Biaya Perbaikan vs MMEL
        </h1>
        <p className="text-text-gray text-sm mt-1">
          Analisis kelayakan alat dengan membandingkan Biaya Perbaikan Tahunan dengan Batas MMEL (Maximum Maintenance Expenditure Limit).
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col items-center justify-center text-center border-l-4 border-brand-primary">
          <p className="text-gray-500 text-sm mb-2">Total Biaya Perbaikan (Tahun Ini)</p>
          <h2 className="text-2xl font-extrabold text-text-dark">{formatCurrency(totals.total_biaya_aktual)}</h2>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col items-center justify-center text-center border-l-4 border-gray-400">
          <p className="text-gray-500 text-sm mb-2">Total Batas MMEL (Tahun Ini)</p>
          <h2 className="text-2xl font-extrabold text-gray-400">{formatCurrency(totals.total_mmel)}</h2>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col items-center justify-center text-center border-l-4 border-red-500">
          <p className="text-gray-500 text-sm mb-2">Aset Direkomendasikan Ganti</p>
          <h2 className="text-2xl font-extrabold text-red-500">{totals.jumlah_ganti_aset} Unit</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#808191] mb-2 pl-1">Cari Alat / No Inv</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nama alat atau no inventaris..."
                className="w-full px-4 py-3 bg-bg-light border border-gray-200 rounded-xl text-text-dark font-medium outline-none focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-gray-400"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <SearchableSelect
            label="Divisi"
            name="divisi_id"
            placeholder="-- Pilih Divisi --"
            searchPlaceholder="Cari divisi..."
            options={[{ label: '-- Pilih Divisi --', value: '' }, ...divisiOptions]}
            value={filters.divisi_id}
            onChange={(e) => handleFilterChange('divisi_id', e.target.value)}
          />

          <SearchableSelect
            label="Kategori Alat"
            name="kategori_alat_id"
            placeholder="-- Kategori Alat --"
            searchPlaceholder="Cari kategori..."
            options={[{ label: '-- Kategori Alat --', value: '' }, ...kategoriOptions]}
            value={filters.kategori_alat_id}
            onChange={(e) => handleFilterChange('kategori_alat_id', e.target.value)}
          />

          <SearchableSelect
            label="Bagian / Ruangan"
            name="ruangan_id"
            placeholder="-- Bagian/Ruangan --"
            searchPlaceholder="Cari ruangan..."
            options={[{ label: '-- Bagian/Ruangan --', value: '' }, ...ruanganOptions]}
            value={filters.ruangan_id}
            onChange={(e) => handleFilterChange('ruangan_id', e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        <div className="overflow-x-auto rounded-xl border border-gray-100 custom-scrollbar mb-4">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-light border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider sticky left-0 bg-bg-light z-10 w-[50px]"></th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">No</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Nama Alat</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Ruangan</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider text-right">Biaya Aktual</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider text-right">Batas MMEL</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider text-center">% Biaya/MMEL</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider text-center">Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <TableSkeleton rows={5} columns={8} />
              ) : data.length === 0 ? (
                <tr><td colSpan="8" className="py-8 text-center text-gray-400">Tidak ada data analisis</td></tr>
              ) : (
                data.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr
                      className={`hover:bg-gray-50/50 cursor-pointer ${expandedRow === item.id_inventaris ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleExpand(item.id_inventaris)}
                    >
                      <td className="py-4 px-6 sticky left-0 z-10 text-center border-r border-gray-50">
                        <div className={`transition-transform duration-200 ${expandedRow === item.id_inventaris ? 'rotate-90' : ''}`}>
                          <div className={`p-1 rounded-full ${expandedRow === item.id_inventaris ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-800">
                        {(pagination.currentPage - 1) * pagination.perPage + idx + 1}
                      </td>
                      <td className="py-4 px-6 font-medium text-text-dark">
                        {item.nama_alat}
                        <div className="text-xs text-brand-primary font-normal">{item.no_inventaris}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{item.ruangan}</td>
                      <td className="py-4 px-6 text-right font-mono text-gray-800">{formatCurrency(item.biaya_aktual)}</td>
                      <td className="py-4 px-6 text-right font-mono text-gray-500">{formatCurrency(item.mmel)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.percentage > 100 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                          {item.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {item.status === 'Ganti Aset' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold uppercase tracking-wide">
                            <AlertTriangle size={14} />
                            Ganti Aset
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold uppercase tracking-wide">
                            <CheckCircle size={14} />
                            Aman
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Detail View */}
                    {expandedRow === item.id_inventaris && (
                      <tr className="bg-bg-light">
                        <td colSpan="8" className="p-6 cursor-default">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
                            {/* Card 1: Asset Info */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                              <h6 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Info size={16} /> Informasi Aset
                              </h6>
                              <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex justify-between"><span>Harga Awal (IIC):</span> <span className="font-medium text-gray-800">{formatCurrency(item.harga_awal)}</span></li>
                                <li className="flex justify-between"><span>Tahun Pengadaan:</span> <span className="font-medium text-gray-800">{item.tahun}</span></li>
                                <li className="flex justify-between"><span>Usia Alat:</span> <span className="font-medium text-gray-800">{item.usia_alat} Tahun</span></li>
                                <li className="flex justify-between"><span>Standar Usia Pakai:</span> <span className="font-medium text-gray-800">{item.usia_pakai} Tahun</span></li>
                              </ul>
                            </div>

                            {/* Card 2: Calculation Factors */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                              <h6 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <TrendingUp size={16} /> Faktor Perhitungan
                              </h6>
                              <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex justify-between">
                                  <span title="Harga Pengganti saat ini (Compounded Inflation)">Harga Pengganti (FV):</span>
                                  <span className="font-medium text-gray-800">{formatCurrency(item.harga_pengganti)}</span>
                                </li>
                                <li className="flex justify-between">
                                  <span title="Faktor Kategori Alat (Khusus=0.9, Standar=0.8)">MEL Factor:</span>
                                  <span className="font-medium text-gray-800">{item.mel_faktor}</span>
                                </li>
                                <li className="flex justify-between">
                                  <span title="Fraksi sisa masa pakai (Remaining / Useful Life)">Fraksi Usia Manfaat:</span>
                                  <span className="font-medium text-gray-800">{(item.life_fraction * 100).toFixed(1)}%</span>
                                </li>
                              </ul>
                            </div>

                            {/* Card 3: Result Breakdown */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 bg-gradient-to-br from-white to-gray-50">
                              <h6 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Hammer size={16} /> Analisis MMEL
                              </h6>
                              <div className="text-sm text-gray-600 space-y-1 mb-3">
                                <p><strong>Rumus:</strong> MMEL = MEL Factor × Fraksi Usia × FV</p>
                              </div>
                              <div className="flex justify-between items-center py-2 border-t border-gray-200">
                                <span className="text-sm font-semibold">MMEL Limit:</span>
                                <span className="text-lg font-bold text-gray-800">{formatCurrency(item.mmel)}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-t border-gray-200">
                                <span className="text-sm font-semibold">Biaya Perbaikan:</span>
                                <span className={`text-lg font-bold ${item.biaya_aktual > item.mmel ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrency(item.biaya_aktual)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
