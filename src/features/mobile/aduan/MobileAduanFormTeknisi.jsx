import React, { useRef, useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Edit2, X, ClipboardCheck } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { useAduanDetail, useUpdateInspection } from '../../../hooks/queries/useAduanQueries';
import { useAuthContext } from '../../../context/AuthContext';
import { ToastContext } from '../../../components/Alert/ToastProvider';
import SignaturePad from '../../../components/SignaturePad';
import SearchableSelect from '../../../components/SearchableSelect';
import axiosClient from '../../../api/axiosClient';

export default function MobileAduanFormTeknisi() {
  usePageTitle('Form Pemeriksaan');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { showToast } = useContext(ToastContext);

  const { data: aduan, isLoading } = useAduanDetail(id);
  const updateInspection = useUpdateInspection();

  const ttdTeknisiRef = useRef(null);
  const ttdKepalaRuangRef = useRef(null);

  const [formData, setFormData] = useState({
    tindakan_teknisi: '',
    rekomendasi: '',
    kondisi_alat: '',
    status_aduan: '',
    biaya: '0',
    inventaris_id: null,
  });

  const [isEditingEquipment, setIsEditingEquipment] = useState(false);
  const [inventarisOptions, setInventarisOptions] = useState([]);
  const [isLoadingInventaris, setIsLoadingInventaris] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);


  useEffect(() => {
    const fetchInventaris = async () => {
      if (!isEditingEquipment || !aduan?.ruangan_id) return;

      setIsLoadingInventaris(true);
      try {
        const response = await axiosClient.get('/inventaris/search', {
          params: {
            q: '',
            ruangan_id: aduan.ruangan_id,
            limit: 500
          }
        });

        const options = (response.data.data || []).map(item => ({
          value: item.id_inventaris,
          label: `${item.nama_alat} - ${item.no_inventaris}`,
          ...item
        }));

        setInventarisOptions(options);
      } catch (error) {
        console.error('Fetch inventaris error:', error);
        showToast('Gagal memuat daftar inventaris', 'error');
      } finally {
        setIsLoadingInventaris(false);
      }
    };

    fetchInventaris();
  }, [isEditingEquipment, aduan, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEquipmentChange = (e) => {
    const inventarisId = e.target.value;
    const equipment = inventarisOptions.find(opt => opt.value === parseInt(inventarisId));

    if (equipment) {
      setSelectedEquipment(equipment);
      setFormData(prev => ({ ...prev, inventaris_id: equipment.value }));
    }
  };

  const handleCancelEquipmentChange = () => {
    setIsEditingEquipment(false);
    setSelectedEquipment(null);
    setFormData(prev => ({ ...prev, inventaris_id: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (ttdTeknisiRef.current?.isEmpty()) {
      showToast('Tanda tangan teknisi harus diisi!', 'error');
      return;
    }

    if (ttdKepalaRuangRef.current?.isEmpty()) {
      showToast('Tanda tangan pengadu harus diisi!', 'error');
      return;
    }

    try {
      const inspectionData = {
        ...formData,
        ttd_teknisi: ttdTeknisiRef.current.toDataURL(),
        ttd_kepala_ruang: ttdKepalaRuangRef.current.toDataURL(),
      };

      await updateInspection.mutateAsync({
        id: parseInt(id),
        data: inspectionData,
      });

      showToast('Pemeriksaan berhasil disimpan!', 'success');
      navigate('/mobile/aduan');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan pemeriksaan', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-info-500" size={32} />
      </div>
    );
  }

  if (!aduan) {
    return (
      <div className="p-4 text-center text-danger-500">
        Aduan tidak ditemukan
      </div>
    );
  }

  const displayEquipment = selectedEquipment || aduan;

  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 sticky top-0  z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Form Pemeriksaan</h1>
      </div>

      {/* Equipment Info Card with Edit Feature */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl p-4 mb-4 border border-blue-100 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wide">Informasi Alat</h3>
          {!isEditingEquipment && (
            <button
              onClick={() => setIsEditingEquipment(true)}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-100 transition-all"
            >
              <Edit2 size={12} />
              Ubah Alat
            </button>
          )}
        </div>

        {isEditingEquipment ? (
          <div className="space-y-3">
            {/* SearchableSelect for Equipment */}
            {isLoadingInventaris ? (
              <div className="text-center py-4">
                <Loader2 className="animate-spin text-blue-500 mx-auto" size={20} />
                <p className="text-xs text-gray-500 mt-2">Memuat daftar alat...</p>
              </div>
            ) : (
              <SearchableSelect
                label="Pilih Alat yang Benar"
                options={inventarisOptions}
                value={formData.inventaris_id}
                onChange={handleEquipmentChange}
                name="inventaris_id"
                placeholder="Pilih alat..."
                searchPlaceholder="Cari nama alat atau no inventaris..."
                displayKey="label"
                valueKey="value"
                required
              />
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsEditingEquipment(false)}
                disabled={!formData.inventaris_id}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                Simpan
              </button>
              <button
                onClick={handleCancelEquipmentChange}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium"
              >
                <X size={16} />
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-600">Nama Alat</p>
              <p className="font-bold text-gray-800">{displayEquipment.nama_alat_nama || displayEquipment.nama_alat}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-600">No. Inventaris</p>
                <p className="text-sm font-medium text-gray-800 break-all">{displayEquipment.no_inventaris}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Ruangan</p>
                <p className="text-sm font-medium text-gray-800">{displayEquipment.ruangan_nama}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600">Keluhan</p>
              <p className="text-sm text-gray-700">{aduan.keluhan}</p>
            </div>
          </div>
        )}
      </div>

      {/* Previous Inspection History - Show if already inspected */}
      {aduan.tindakan_teknisi && (
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-3xl p-4 mb-4 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClipboardCheck size={16} className="text-orange-600" />
            </div>
            <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wide">Pemeriksaan Sebelumnya</h3>
          </div>

          <div className="space-y-3">
            {/* Previous Technician Action */}
            <div className="bg-white rounded-xl p-3 border border-orange-100">
              <p className="text-xs text-gray-600 mb-1">Tindakan Teknisi</p>
              <p className="text-sm text-gray-800">{aduan.tindakan_teknisi}</p>
            </div>

            {/* Previous Recommendation */}
            {aduan.rekomendasi && (
              <div className="bg-white rounded-xl p-3 border border-orange-100">
                <p className="text-xs text-gray-600 mb-1">Rekomendasi</p>
                <p className="text-sm text-gray-800">{aduan.rekomendasi}</p>
              </div>
            )}

            {/* Previous Condition & Status */}
            <div className="grid grid-cols-2 gap-2">
              {aduan.kondisi_alat && (
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-600 mb-1">Kondisi Alat</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${aduan.kondisi_alat === 'Baik' ? 'bg-green-100 text-green-700' :
                    aduan.kondisi_alat === 'Rusak Ringan' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {aduan.kondisi_alat}
                  </span>
                </div>
              )}

              {aduan.status_aduan && (
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${aduan.status_aduan === 'Selesai' ? 'bg-green-100 text-green-700' :
                    aduan.status_aduan === 'Tindakan Lanjutan' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                    {aduan.status_aduan}
                  </span>
                </div>
              )}
            </div>

            {/* Previous Inspection Date */}
            {aduan.tanggal_pemeriksaan && (
              <div className="bg-white rounded-xl p-3 border border-orange-100">
                <p className="text-xs text-gray-600 mb-1">Tanggal Pemeriksaan Sebelumnya</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(aduan.tanggal_pemeriksaan).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {/* Info Badge */}
            <div className="bg-orange-100 border border-orange-200 rounded-xl p-3">
              <p className="text-xs text-orange-800 font-medium">
                ℹ️ Ini adalah pemeriksaan lanjutan. Silakan isi form di bawah untuk update status terbaru.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Tindakan Teknisi */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="text-xs font-bold text-gray-700 mb-2 block">
            Safety Check / Tindakan Teknisi <span className='text-red-500'>*</span>
          </label>
          <textarea
            name="tindakan_teknisi"
            value={formData.tindakan_teknisi}
            onChange={handleChange}
            placeholder="Masukkan tindakan yang dilakukan..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            required
          />
        </div>

        {/* Rekomendasi */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="text-xs font-bold text-gray-700 mb-2 block">
            Rekomendasi <span className='text-red-500'>*</span>
          </label>
          <textarea
            name="rekomendasi"
            value={formData.rekomendasi}
            onChange={handleChange}
            placeholder="Masukkan rekomendasi..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            required
          />
        </div>

        {/* Kondisi Alat */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="text-xs font-bold text-gray-700 mb-2 block">
            Kondisi Alat <span className='text-red-500'>*</span>
          </label>
          <select
            name="kondisi_alat"
            value={formData.kondisi_alat}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            required
          >
            <option value="">-- Pilih Kondisi Alat --</option>
            <option value="Baik">Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </select>
        </div>

        {/* Tanda Tangan Teknisi */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <SignaturePad
            ref={ttdTeknisiRef}
            label="Tanda Tangan Teknisi Pelaksana *"
          />
          <p className="text-xs text-gray-500 mt-2">{user?.nama_lengkap}</p>
        </div>

        {/* Tanda Tangan Pengadu */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <SignaturePad
            ref={ttdKepalaRuangRef}
            label="Tanda Tangan Pengadu *"
          />
          <p className="text-xs text-gray-500 mt-2">{aduan.nama_pengadu}</p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="text-xs font-bold text-gray-700 mb-2 block">
            Status <span className='text-red-500'>*</span>
          </label>
          <select
            name="status_aduan"
            value={formData.status_aduan}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            required
          >
            <option value="">-- Pilih Status Aduan --</option>
            <option value="Tindakan Lanjutan">Tindakan Lanjutan</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        {/* Biaya */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="text-xs font-bold text-gray-700 mb-2 block">
            {formData.status_aduan === 'Selesai' ? 'Biaya Riil Perbaikan (Rp)' : 'Estimasi Biaya Perbaikan (Rp)'}
          </label>
          <input
            type="number"
            name="biaya"
            value={formData.biaya}
            onChange={handleChange}
            placeholder="Contoh: 150000"
            min="0"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            required
          />
          <small className="text-xs text-gray-500 mt-1 block">
            {formData.status_aduan === 'Selesai' 
              ? 'Masukkan total biaya asli perbaikan. Isi 0 jika tidak ada biaya.' 
              : 'Masukkan perkiraan biaya perbaikan. Isi 0 jika tidak ada estimasi.'}
          </small>
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-4 pt-2">
          <button
            type="submit"
            disabled={updateInspection.isPending}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            {updateInspection.isPending ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={20} />
                Simpan Pemeriksaan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
