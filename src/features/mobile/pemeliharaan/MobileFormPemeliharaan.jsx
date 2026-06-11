import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ClipboardCheck } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import SignaturePad from '../../../components/SignaturePad';
import { useFormPemeliharaan, useSubmitPemeliharaan } from '../../../hooks/queries/usePemeliharaanQueries';
import { ToastDialog } from '../../../components/Alert/Alert';

export default function MobileFormPemeliharaan() {
  usePageTitle('Form Pemeliharaan');
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useFormPemeliharaan(id);
  const submitMutation = useSubmitPemeliharaan();

  const signatureTeknisiRef = useRef(null);
  const signatureKepalaRuangRef = useRef(null);

  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    safety_check: [],
    maintenance: [],
    p_fungsi: [],
    rekomendasi: '',
    keterangan_pemeliharaan: '',
    nama_kepala_ruangan: '',
    biaya: 0,
    status: 'Selesai',
    kondisi_alat: 'Baik',
  });


  React.useEffect(() => {
    if (data?.pemeliharaan) {
      setFormData(prev => ({
        ...prev,

        nama_kepala_ruangan: data.pemeliharaan.nama_kepala_ruangan || '',
        biaya: data.pemeliharaan.biaya || 0,



      }));
    }
  }, [data]);

  const handleSafetyCheckChange = (checklistId, value) => {
    setFormData(prev => {
      const safetyCheck = prev?.safety_check || [];
      const existing = safetyCheck.find(item => item.id === checklistId);
      if (existing) {
        return {
          ...prev,
          safety_check: safetyCheck.map(item =>
            item.id === checklistId ? { ...item, hasil: value } : item
          )
        };
      } else {
        return {
          ...prev,
          safety_check: [...safetyCheck, { id: checklistId, hasil: value }]
        };
      }
    });
  };

  const handleRadioChange = (category, checklistId, value) => {
    setFormData(prev => {
      const categoryArray = prev?.[category] || [];
      const existing = categoryArray.find(item => item.id === checklistId);
      if (existing) {
        return {
          ...prev,
          [category]: categoryArray.map(item =>
            item.id === checklistId ? { ...item, hasil: value } : item
          )
        };
      } else {
        return {
          ...prev,
          [category]: [...categoryArray, { id: checklistId, hasil: value }]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (signatureTeknisiRef.current.isEmpty()) {
      setToast({ type: 'error', message: 'Tanda tangan teknisi harus diisi' });
      return;
    }

    const ttdTeknisi = signatureTeknisiRef.current.toDataURL();


    const ttdKepalaRuang = signatureKepalaRuangRef.current.isEmpty()
      ? null
      : signatureKepalaRuangRef.current.toDataURL();

    const submitData = {
      ...formData,
      ttd_teknisi: ttdTeknisi,
      ttd_kepala_ruang: ttdKepalaRuang,
    };

    try {
      await submitMutation.mutateAsync({ id, data: submitData });

      setToast({ type: 'success', message: 'Pemeliharaan berhasil disimpan' });

      setTimeout(() => {
        navigate('/mobile/pemeliharaan');
      }, 1500);
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Gagal menyimpan pemeliharaan'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <p className="text-danger-600">Gagal memuat form</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-4">
      {/* Header */}
      <div className="py-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Form Pemeliharaan</h1>
          <p className="text-sm text-gray-500">Isi checklist pemeliharaan</p>
        </div>
      </div>

      {/* Previous Inspection History - Show if already inspected */}
      {data?.pemeliharaan?.keterangan_pemeliharaan && (
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-3xl p-4 mb-4 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClipboardCheck size={16} className="text-orange-600" />
            </div>
            <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wide">Pemeriksaan Sebelumnya</h3>
          </div>

          <div className="space-y-3">
            {/* Previous Keterangan */}
            <div className="bg-white rounded-xl p-3 border border-orange-100">
              <p className="text-xs text-gray-600 mb-1">Keterangan Pemeliharaan</p>
              <p className="text-sm text-gray-800">{data.pemeliharaan.keterangan_pemeliharaan}</p>
            </div>

            {/* Previous Recommendation */}
            {data.pemeliharaan.rekomendasi && (
              <div className="bg-white rounded-xl p-3 border border-orange-100">
                <p className="text-xs text-gray-600 mb-1">Rekomendasi</p>
                <p className="text-sm text-gray-800">{data.pemeliharaan.rekomendasi}</p>
              </div>
            )}

            {/* Previous Condition & Status */}
            <div className="grid grid-cols-2 gap-2">
              {data.pemeliharaan.kondisi_alat && (
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-600 mb-1">Kondisi Alat</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${data.pemeliharaan.kondisi_alat === 'Baik' ? 'bg-green-100 text-green-700' :
                    data.pemeliharaan.kondisi_alat === 'Rusak Ringan' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {data.pemeliharaan.kondisi_alat}
                  </span>
                </div>
              )}

              {data.pemeliharaan.status && (
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${data.pemeliharaan.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                    data.pemeliharaan.status === 'Tindakan Lanjutan' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                    {data.pemeliharaan.status}
                  </span>
                </div>
              )}
            </div>

            {/* Previous Inspection Date */}
            {data.pemeliharaan.tanggal_pemeriksaan && (
              <div className="bg-white rounded-xl p-3 border border-orange-100">
                <p className="text-xs text-gray-600 mb-1">Tanggal Pemeriksaan Sebelumnya</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(data.pemeliharaan.tanggal_pemeriksaan).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {/* Previous Biaya & Kepala Ruangan */}
            <div className="grid grid-cols-2 gap-2">
              {data.pemeliharaan.biaya > 0 && (
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-600 mb-1">Biaya</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.pemeliharaan.biaya)}
                  </p>
                </div>
              )}

              {data.pemeliharaan.nama_kepala_ruangan && (
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-600 mb-1">Kepala Ruangan</p>
                  <p className="text-sm font-medium text-gray-800">{data.pemeliharaan.nama_kepala_ruangan}</p>
                </div>
              )}
            </div>

            {/* Info Badge */}
            <div className="bg-orange-100 border border-orange-200 rounded-xl p-3">
              <p className="text-xs text-orange-800 font-medium">
                ℹ️ Ini adalah pemeriksaan lanjutan. Silakan isi form di bawah untuk update status terbaru.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Render Checklist Categories - Only for first inspection */}
        {!data?.pemeliharaan?.keterangan_pemeliharaan && (
          <>
            {data?.checklist_categories?.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">{category.display_kategori}</h3>

                {category.checklists.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Checklist Kosong</p>
                ) : category.nama_kategori === 'safety_check' ? (

                  <div className="space-y-3">
                    {category.checklists.map((checklist) => (
                      <textarea
                        key={checklist.id}
                        placeholder={checklist.keterangan}
                        value={formData.safety_check?.find(item => item.id === checklist.id)?.hasil || ''}
                        onChange={(e) => handleSafetyCheckChange(checklist.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                        rows="3"
                      />
                    ))}
                  </div>
                ) : (

                  <div className="space-y-3">
                    {category.checklists.map((checklist) => (
                      <div key={checklist.id} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">{checklist.keterangan}</p>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`${category.nama_kategori}_${checklist.id}`}
                              value="ok"
                              onChange={(e) => handleRadioChange(category.nama_kategori, checklist.id, e.target.value)}
                              className="w-4 h-4 text-success-600"
                            />
                            <span className="text-sm">Ok</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`${category.nama_kategori}_${checklist.id}`}
                              value="notok"
                              onChange={(e) => handleRadioChange(category.nama_kategori, checklist.id, e.target.value)}
                              className="w-4 h-4 text-danger-600"
                            />
                            <span className="text-sm">Not Ok</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Status Pemeliharaan */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">Status Pemeliharaan</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm bg-white"
          >
            <option value="Selesai">Selesai</option>
            <option value="Tindakan Lanjutan">Tindakan Lanjutan</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Pilih "Tindakan Lanjutan" jika alat membutuhkan penanganan lebih lanjut.
          </p>
        </div>

        {/* Kondisi Alat */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">Kondisi Alat</label>
          <select
            value={formData.kondisi_alat}
            onChange={(e) => setFormData(prev => ({ ...prev, kondisi_alat: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm bg-white"
          >
            <option value="Baik">Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Jika "Rusak Berat", notifikasi akan dikirim ke pimpinan.
          </p>
        </div>

        {/* Rekomendasi */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">Rekomendasi</label>
          <textarea
            value={formData.rekomendasi}
            onChange={(e) => setFormData(prev => ({ ...prev, rekomendasi: e.target.value }))}
            placeholder="Masukkan rekomendasi"
            className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm resize-none"
            rows="3"
            required
          />
        </div>

        {/* Keterangan Pemeliharaan */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">Keterangan Pemeliharaan</label>
          <textarea
            value={formData.keterangan_pemeliharaan}
            onChange={(e) => setFormData(prev => ({ ...prev, keterangan_pemeliharaan: e.target.value }))}
            placeholder="Masukkan keterangan pemeliharaan"
            className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm resize-none"
            rows="3"
            required
          />
        </div>

        {/* Tanda Tangan Teknisi */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <SignaturePad
            ref={signatureTeknisiRef}
            label="Tanda Tangan Teknisi Pelaksana"
          />
        </div>

        {/* Tanda Tangan Kepala Ruang */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <SignaturePad
            ref={signatureKepalaRuangRef}
            label="Tanda Tangan Kepala Ruang (Opsional)"
          />
          <p className="text-xs text-gray-500 mt-2">Tanda tangan kepala ruang dapat diisi nanti</p>
        </div>

        {/* Nama Kepala Ruangan */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">Nama Kepala Ruangan (Opsional)</label>
          <input
            type="text"
            value={formData.nama_kepala_ruangan}
            onChange={(e) => setFormData(prev => ({ ...prev, nama_kepala_ruangan: e.target.value }))}
            placeholder="Masukkan nama kepala ruangan"
            className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Nama dapat diisi nanti saat tanda tangan</p>
        </div>

        {/* Biaya */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            {formData.status === 'Selesai' ? 'Biaya Riil Pemeliharaan (Rp)' : 'Estimasi Biaya Pemeliharaan (Rp)'}
          </label>
          <input
            type="number"
            value={formData.biaya}
            onChange={(e) => setFormData(prev => ({ ...prev, biaya: parseFloat(e.target.value) || 0 }))}
            placeholder="Contoh: 75000"
            className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm"
            min="0"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.status === 'Selesai' 
              ? 'Masukkan total biaya asli pemeliharaan. Isi 0 jika tidak ada biaya.' 
              : 'Masukkan perkiraan biaya pemeliharaan. Isi 0 jika tidak ada estimasi.'}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitMutation.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={20} />
              Simpan
            </>
          )}
        </button>
      </form>

      {/* Toast Notification */}
      <ToastDialog
        isOpen={!!toast}
        type={toast?.type || 'info'}
        message={toast?.message}
        onClose={() => setToast(null)}
        duration={3000}
      />
    </div>
  );
}
