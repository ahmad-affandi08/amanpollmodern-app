import React, { useState, useEffect } from 'react';
import { Save, Trash2, TrendingUp, DollarSign, Calendar, Plus } from 'lucide-react';
import AnggaranApi from '../../../api/AnggaranApi';
import Button from '../../../components/Button';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import ConfirmDialog from '../../../components/Alert/Alert';
import TableSkeleton from '../../../components/TableSkeleton';

export default function PengaturanAnggaran() {
  usePageTitle('Pengaturan Anggaran');
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  const [inflasiList, setInflasiList] = useState([]);
  const [rabData, setRabData] = useState({ persentase: 5.00 });

  const [rabInput, setRabInput] = useState('');
  const [inflasiForm, setInflasiForm] = useState({
    tahun: new Date().getFullYear(),
    tingkat_inflasi: ''
  });

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await AnggaranApi.getAll();
      setInflasiList(res.data.inflasi);
      setRabData(res.data.rab);
      setRabInput(res.data.rab?.persentase || 5.00);
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat data anggaran', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRab = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const res = await AnggaranApi.updateRab({ persentase: rabInput });
      setRabData(res.data.data);
      showToast('Persentase RAB berhasil diperbarui', 'success');
    } catch (error) {
      console.error(error);
      showToast('Gagal memperbarui RAB', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddInflasi = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);

      await AnggaranApi.createInflasi(inflasiForm);
      showToast('Data inflasi berhasil ditambahkan', 'success');
      setInflasiForm({
        tahun: new Date().getFullYear(),
        tingkat_inflasi: ''
      });
      fetchData();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Gagal menambahkan inflasi';
      showToast(msg, 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteInflasi = (id) => {
    setConfirmDialog({ isOpen: true, id });
  };

  const confirmDeleteInflasi = async () => {
    try {
      await AnggaranApi.deleteInflasi(confirmDialog.id);
      showToast('Data inflasi berhasil dihapus', 'success');
      setConfirmDialog({ isOpen: false, id: null });
      fetchData();
    } catch (error) {
      console.error(error);
      showToast('Gagal menghapus data inflasi', 'error');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-bold text-text-dark flex items-center gap-2">
          Pengaturan Anggaran
        </h1>
        <p className="text-text-gray text-xs mt-0.5">Kelola persentase RAB dan data inflasi tahunan</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          <div className="space-y-4">
            <div className="bg-white rounded-xl h-48 w-full shadow-sm"></div>
            <div className="bg-white rounded-xl h-48 w-full shadow-sm"></div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl h-full min-h-[400px] w-full p-4 shadow-sm">
              <div className="h-5 w-40 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-4">

            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1.5 text-brand-primary">
                <TrendingUp size={20} />
                <h3 className="font-bold text-sm text-gray-800">Persentase RAB</h3>
              </div>

              <p className="text-gray-400 text-xs mb-4">Dasar perhitungan RAB dari nilai AIC tahunan</p>

              <h1 className="text-4xl font-extrabold text-text-dark mb-4">
                {parseFloat(rabData?.persentase).toLocaleString('id-ID')}%
              </h1>

              <form onSubmit={handleUpdateRab} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-text-gray uppercase tracking-wider mb-1.5 block text-left">Ubah Persentase</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none font-bold text-gray-800 text-sm"
                      value={rabInput}
                      onChange={(e) => setRabInput(e.target.value)}
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">%</span>
                  </div>
                </div>
                <Button type="submit" className="w-full justify-center" disabled={updateLoading}>
                  {updateLoading ? 'Menyimpan...' : 'Update Persentase'}
                </Button>
              </form>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-800">Tambah Data Inflasi</h3>
              </div>

              <form onSubmit={handleAddInflasi} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-text-gray uppercase tracking-wider mb-1.5 block">Tahun</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-xs font-medium"
                      value={inflasiForm.tahun}
                      onChange={(e) => setInflasiForm({ ...inflasiForm, tahun: e.target.value })}
                      placeholder="Tahun"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-gray uppercase tracking-wider mb-1.5 block">Tingkat Inflasi (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-xs font-medium"
                    value={inflasiForm.tingkat_inflasi}
                    onChange={(e) => setInflasiForm({ ...inflasiForm, tingkat_inflasi: e.target.value })}
                    placeholder="Contoh: 3.50"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full justify-center bg-green-500 hover:bg-green-600 border-green-500" disabled={updateLoading}>
                  {updateLoading ? 'Menyimpan...' : 'Simpan Data'}
                </Button>
              </form>
            </div>

          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl p-4 shadow-sm h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-800">Riwayat Inflasi Tahunan</h3>
                <div className="bg-purple-50 text-brand-primary px-3 py-1 rounded-lg text-xs font-medium">
                  Total Data: {inflasiList.length}
                </div>
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-lg border border-gray-100 custom-scrollbar relative">
                <table className="w-full text-left border-collapse relative">
                  <thead className="sticky top-0 z-10 shadow-sm">
                    <tr className="bg-bg-light border-b border-gray-100">
                      <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider bg-bg-light">Tahun</th>
                      <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider bg-bg-light">Tingkat Inflasi</th>
                      <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right bg-bg-light">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {inflasiList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-6 text-center text-gray-400 text-xs">Belum ada data inflasi</td>
                      </tr>
                    ) : (
                      inflasiList.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-2.5 px-4 font-medium text-gray-800 text-xs">{item.tahun}</td>
                          <td className="py-2.5 px-4 font-bold text-brand-primary text-xs">
                            {(parseFloat(item.tingkat_inflasi) * 100).toLocaleString('id-ID', { minimumFractionDigits: 2 })}%
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteInflasi(item.id)}
                              className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Hapus Data Inflasi"
        message="Apakah Anda yakin ingin menghapus data inflasi ini?"
        onConfirm={confirmDeleteInflasi}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </div>
  );
}
