import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Search, RefreshCw } from 'lucide-react';
import AnggaranApi from '../../../api/AnggaranApi';
import TableSkeleton from '../../../components/TableSkeleton';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle, useAuth } from '../../../hooks';
import SearchableSelect from '../../../components/SearchableSelect';
import RuanganApi from '../../../api/RuanganApi';
import DivisiApi from '../../../api/DivisiApi';
import KategoriAlatApi from '../../../api/KategoriAlatApi';
import Pagination from '../../../components/Pagination';

export default function AnggaranPemeliharaan() {
  usePageTitle('Anggaran Pemeliharaan');
  const { showToast } = useToast();
  const { user } = useAuth();

  const ROLE_ADMIN_DIVISI = 4;
  const isAdminDivisi = Number(user?.kategori_user_id) === ROLE_ADMIN_DIVISI;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ total_aic: 0, total_rab: 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    totalItems: 0
  });

  const [expandedRow, setExpandedRow] = useState(null);

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

      const cleanedFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '' && v != null)
      );

      const params = {
        ...cleanedFilters,
        page: page,
        per_page: pagination.perPage
      };

      const res = await AnggaranApi.getAnalysis(params);
      const responseData = res.data.data;

      if (responseData && responseData.items) {
        setData(responseData.items.data || []);
        setTotals(responseData.totals || { total_aic: 0, total_rab: 0 });
        setPagination(prev => ({
          ...prev,
          currentPage: responseData.items.current_page,
          totalPages: responseData.items.last_page,
          totalItems: responseData.items.total
        }));
      } else {
        setData(Array.isArray(responseData) ? responseData : []);
        setTotals(responseData?.totals || { total_aic: 0, total_rab: 0 });
      }

    } catch (error) {
      console.error(error);
      showToast('Gagal memuat data analisis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchData(1, filters);
  };

  const handleReset = () => {
    const emptyFilters = {
      divisi_id: '',
      kategori_alat_id: '',
      ruangan_id: '',
      tahun_pengadaan: '',
      search: ''
    };
    setFilters(emptyFilters);
    fetchData(1, emptyFilters);
  };

  const handlePageChange = (page) => {
    setExpandedRow(null);
    fetchData(page, filters);
  };

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-bold text-text-dark flex items-center gap-2">
          Anggaran Pemeliharaan (AIC)
        </h1>
        <p className="text-text-gray text-xs mt-0.5">Analisis biaya pemeliharaan tahunan berdasarkan inflasi dan usia pakai aset.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 text-xs mb-1">Total Anggaran Pemeliharaan (RAB) Tahun Ini</p>
          <h2 className="text-2xl font-extrabold text-brand-primary">{formatCurrency(totals.total_rab)}</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 text-xs mb-1">Total Annual Investment Cost (AIC) Tahun Ini</p>
          <h2 className="text-2xl font-extrabold text-text-dark">{formatCurrency(totals.total_aic)}</h2>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#808191] mb-1.5 pl-1">Cari Alat / No Inv</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nama alat atau no inventaris..."
                className="w-full px-3 py-2 bg-bg-light border border-gray-200 rounded-lg text-text-dark text-sm font-medium outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-gray-400"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          {!isAdminDivisi && (
            <SearchableSelect
              label="Divisi"
              name="divisi_id"
              placeholder="-- Pilih Divisi --"
              searchPlaceholder="Cari divisi..."
              options={[{ label: '-- Pilih Divisi --', value: '' }, ...divisiOptions]}
              value={filters.divisi_id}
              onChange={(e) => handleFilterChange('divisi_id', e.target.value)}
            />
          )}

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

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="overflow-x-auto rounded-lg border border-gray-100 custom-scrollbar mb-3">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-light border-b border-gray-100">
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider sticky left-0 bg-bg-light z-10 w-[40px]"></th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">No</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Nama Alat</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Ruangan</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Usia / Masa Pakai</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Tahun</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">Harga Awal</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">Est. Harga Kini</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">AIC Tahunan</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right bg-purple-50 text-brand-primary">RAB (Budget)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {loading ? (
                <TableSkeleton rows={5} columns={10} />
              ) : data.length === 0 ? (
                <tr><td colSpan="10" className="py-6 text-center text-gray-400 text-xs">Tidak ada data analisis</td></tr>
              ) : (
                data.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr className={`hover:bg-gray-50/50 cursor-pointer ${expandedRow === item.id_inventaris ? 'bg-gray-50' : ''}`} onClick={() => toggleExpand(item.id_inventaris)}>
                      <td className="py-2.5 px-4 text-center border-r border-gray-50">
                        <div className={`transition-transform duration-200 ${expandedRow === item.id_inventaris ? 'rotate-90' : ''}`}>
                          <div className={`p-0.5 rounded-full ${expandedRow === item.id_inventaris ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400'}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-gray-800">
                        {(pagination.currentPage - 1) * pagination.perPage + idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-text-dark">
                        {item.nama_alat}
                        <div className="text-[10px] text-gray-400 font-normal">{item.merk}</div>
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">{item.ruangan}</td>
                      <td className="py-2.5 px-4 text-gray-600">{item.usia_sekarang} Thn / {item.usia_pakai} Thn</td>
                      <td className="py-2.5 px-4">{item.tahun_pengadaan}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-600">{formatCurrency(item.harga_awal)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-600">{formatCurrency(item.estimasi_harga_sekarang)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-800">{formatCurrency(item.aic_tahunan)}</td>
                      <td className="py-2.5 px-4 text-right font-bold font-mono text-brand-primary bg-purple-50/30">
                        {formatCurrency(item.rab_tahunan)}
                      </td>
                    </tr>
                    {expandedRow === item.id_inventaris && (
                      <tr className="bg-bg-light">
                        <td colSpan="10" className="p-4 cursor-default">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-scale-in">
                            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-cyan-500">
                              <h6 className="font-bold text-cyan-600 mb-3 text-sm">Detail Aset & Usia</h6>
                              <div className="space-y-2 text-xs text-gray-600">
                                <p><strong>Harga Beli Awal:</strong> {formatCurrency(item.harga_awal)} (Thn {item.tahun_pengadaan})</p>
                                <p><strong>Standar Masa Pakai:</strong> {item.usia_pakai} Tahun</p>
                                <p>
                                  <strong>Usia Saat Ini:</strong> {item.usia_sekarang} Tahun
                                  <span className="text-gray-400 ml-1">
                                    ({item.usia_pakai > 0 ? ((item.usia_sekarang / item.usia_pakai) * 100).toFixed(1) : 0}% terpakai)
                                  </span>
                                </p>
                                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                  <div
                                    className="bg-cyan-500 h-2 rounded-full"
                                    style={{ width: `${Math.min(100, item.usia_pakai > 0 ? ((item.usia_sekarang / item.usia_pakai) * 100) : 0)}%` }}
                                  ></div>
                                </div>
                                <hr className="border-gray-100 my-3" />
                                <p><strong>Perhitungan RAB</strong> menggunakan <strong className="text-cyan-600">{(item.persentase_rab || 0).toFixed(2)}%</strong> dari nilai AIC.</p>

                                <Link
                                  to={`/anggaran/pemeliharaan/${item.id_inventaris}`}
                                  className="flex items-center justify-center w-full mt-3 py-1.5 px-3 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors font-medium text-xs gap-1.5"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                  Lihat Laporan Lengkap & Cetak
                                </Link>
                              </div>
                            </div>

                            <div className="md:col-span-2 bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                              <h6 className="font-bold text-green-600 mb-3 text-sm">Proyeksi Biaya Tahunan (AIC & RAB)</h6>
                              <div className="overflow-x-auto rounded-lg border border-gray-100">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-bg-light">
                                    <tr>
                                      <th className="px-3 py-2 font-semibold text-gray-600">Tahun</th>
                                      <th className="px-3 py-2 font-semibold text-gray-600">Usia Alat</th>
                                      <th className="px-3 py-2 font-semibold text-gray-600 text-right">Nilai AIC</th>
                                      <th className="px-3 py-2 font-semibold text-gray-600 text-right">RAB Pemeliharaan</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {item.projections && item.projections.length > 0 ? item.projections.map((proj, pIdx) => (
                                      <tr key={pIdx} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium text-gray-900">{proj.tahun}</td>
                                        <td className="px-3 py-2 text-gray-500">{proj.tahun - item.tahun_pengadaan} Tahun</td>
                                        <td className="px-3 py-2 text-right font-mono text-gray-600">{formatCurrency(proj.aic)}</td>
                                        <td className="px-3 py-2 text-right font-mono font-bold text-green-600 bg-green-50/30">{formatCurrency(proj.rab)}</td>
                                      </tr>
                                    )) : (
                                      <tr><td colSpan="4" className="px-3 py-6 text-center text-gray-400">Data proyeksi tidak tersedia</td></tr>
                                    )}
                                  </tbody>
                                  <tfoot className="bg-gray-50 font-bold border-t border-gray-100">
                                    <tr>
                                      <td colSpan="3" className="px-3 py-2 text-right text-gray-600">Jumlah Total Proyeksi AIC</td>
                                      <td className="px-3 py-2 text-right text-gray-800">{formatCurrency(item.total_projected_aic || 0)}</td>
                                    </tr>
                                    <tr className="bg-green-50/50">
                                      <td colSpan="3" className="px-3 py-2 text-right text-green-700">Jumlah Total Proyeksi RAB</td>
                                      <td className="px-3 py-2 text-right text-green-700">{formatCurrency(item.total_projected_rab || 0)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
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
          totalData={pagination.totalItems}
        />
      </div>
    </div>
  );
}
