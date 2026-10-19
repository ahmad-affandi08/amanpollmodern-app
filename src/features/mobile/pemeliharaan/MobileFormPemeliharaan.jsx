import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ClipboardCheck } from 'lucide-react';
import { usePageTitle, useToast, useFormPemeliharaan, useSubmitPemeliharaan } from '../../../hooks';
import { formatDateTime, rupiah } from '../../../utils/format';
import SignaturePad from '../../../components/SignaturePad';
import StatusBadge from '../../../components/StatusBadge';
import KondisiBadge from '../../../components/KondisiBadge';

const SELECT_CLASS =
  'w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm bg-white';

export default function MobileFormPemeliharaan() {
  usePageTitle('Form Pemeliharaan');
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useFormPemeliharaan(id);

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

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <p className="text-danger-600 mb-4">Gagal memuat form</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-brand-primary font-bold"
        >
          Kembali
        </button>
      </div>
    );
  }

  // Form dibuat setelah data siap, sehingga nilai awal diambil langsung dari data (tanpa effect).
  return <FormBody id={id} data={data} />;
}

function FormBody({ id, data }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const submitMutation = useSubmitPemeliharaan();

  const signatureTeknisiRef = useRef(null);
  const signatureKepalaRuangRef = useRef(null);

  const previous = data.pemeliharaan;
  // Checklist hanya diisi pada pemeriksaan pertama; pemeriksaan lanjutan sudah punya keterangan.
  const isFollowUp = !!previous?.keterangan_pemeliharaan;
  const categories = isFollowUp ? [] : (data.checklist_categories || []);

  const [formData, setFormData] = useState({
    safety_check: [],
    maintenance: [],
    p_fungsi: [],
    rekomendasi: '',
    keterangan_pemeliharaan: '',
    nama_kepala_ruangan: previous?.nama_kepala_ruangan || '',
    biaya: previous?.biaya || 0,
    // Status & kondisi wajib dipilih eksplisit (tidak ada nilai bawaan).
    status: '',
    kondisi_alat: '',
  });
  const [showChecklistErrors, setShowChecklistErrors] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getAnswer = (category, checklistId) =>
    formData[category]?.find(item => item.id === checklistId)?.hasil || '';

  const handleChecklistChange = (category, checklistId, value) => {
    setFormData(prev => {
      const list = prev[category] || [];
      const exists = list.some(item => item.id === checklistId);
      return {
        ...prev,
        [category]: exists
          ? list.map(item => (item.id === checklistId ? { ...item, hasil: value } : item))
          : [...list, { id: checklistId, hasil: value }],
      };
    });
  };

  // Item checklist yang belum dijawab (untuk validasi dan penandaan).
  const getUnanswered = () =>
    categories.flatMap(category =>
      category.checklists
        .filter(checklist => !getAnswer(category.nama_kategori, checklist.id).trim())
        .map(checklist => ({ category: category.nama_kategori, id: checklist.id, keterangan: checklist.keterangan }))
    );

  const unanswered = getUnanswered();
  const isUnanswered = (category, checklistId) =>
    showChecklistErrors && unanswered.some(item => item.category === category && item.id === checklistId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitMutation.isPending || submitted) return;

    if (unanswered.length > 0) {
      setShowChecklistErrors(true);
      showToast(`Masih ada ${unanswered.length} item checklist yang belum dijawab`, 'warning');
      const first = unanswered[0];
      document.getElementById(`checklist-${first.category}-${first.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!formData.status) {
      showToast('Pilih status pemeliharaan terlebih dahulu', 'warning');
      return;
    }

    if (!formData.kondisi_alat) {
      showToast('Pilih kondisi alat terlebih dahulu', 'warning');
      return;
    }

    if (signatureTeknisiRef.current?.isEmpty()) {
      showToast('Tanda tangan teknisi harus diisi', 'error');
      return;
    }

    const submitData = {
      ...formData,
      ttd_teknisi: signatureTeknisiRef.current.toDataURL(),
      ttd_kepala_ruang: signatureKepalaRuangRef.current?.isEmpty()
        ? null
        : signatureKepalaRuangRef.current.toDataURL(),
    };

    try {
      await submitMutation.mutateAsync({ id, data: submitData });
      // Tombol tetap nonaktif; langsung pindah halaman (toast global tetap tampil).
      setSubmitted(true);
      showToast('Pemeliharaan berhasil disimpan', 'success');
      navigate('/mobile/pemeliharaan');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan pemeliharaan', 'error');
    }
  };

  const isSaving = submitMutation.isPending || submitted;

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

      {/* Pemeriksaan sebelumnya (bila sudah pernah diperiksa) */}
      {isFollowUp && (
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-3xl p-4 mb-4 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClipboardCheck size={16} className="text-orange-600" />
            </div>
            <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wide">Pemeriksaan Sebelumnya</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-xl p-3 border border-orange-100">
              <p className="text-xs text-gray-600 mb-1">Keterangan Pemeliharaan</p>
              <p className="text-sm text-gray-800">{previous.keterangan_pemeliharaan}</p>
            </div>

            {previous.rekomendasi && (
              <div className="bg-white rounded-xl p-3 border border-orange-100">
                <p className="text-xs text-gray-600 mb-1">Rekomendasi</p>
                <p className="text-sm text-gray-800">{previous.rekomendasi}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {previous.kondisi_alat && (
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-600 mb-1">Kondisi Alat</p>
                  <KondisiBadge kondisi={previous.kondisi_alat} />
                </div>
              )}

              {previous.status && (
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <StatusBadge status={previous.status} />
                </div>
              )}
            </div>

            {previous.tanggal_pemeriksaan && (
              <div className="bg-white rounded-xl p-3 border border-orange-100">
                <p className="text-xs text-gray-600 mb-1">Tanggal Pemeriksaan Sebelumnya</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDateTime(previous.tanggal_pemeriksaan)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {parseFloat(previous.biaya) > 0 && (
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-600 mb-1">Biaya</p>
                  <p className="text-sm font-medium text-gray-800">{rupiah(previous.biaya)}</p>
                </div>
              )}

              {previous.nama_kepala_ruangan && (
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-600 mb-1">Kepala Ruangan</p>
                  <p className="text-sm font-medium text-gray-800">{previous.nama_kepala_ruangan}</p>
                </div>
              )}
            </div>

            <div className="bg-orange-100 border border-orange-200 rounded-xl p-3">
              <p className="text-xs text-orange-800 font-medium">
                Ini adalah pemeriksaan lanjutan. Silakan isi form di bawah untuk memperbarui status terbaru.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Checklist: hanya untuk pemeriksaan pertama, semua item wajib dijawab */}
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">{category.display_kategori}</h3>

            {category.checklists.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Checklist Kosong</p>
            ) : category.nama_kategori === 'safety_check' ? (
              <div className="space-y-3">
                {category.checklists.map((checklist) => {
                  const missing = isUnanswered(category.nama_kategori, checklist.id);
                  return (
                    <div key={checklist.id} id={`checklist-${category.nama_kategori}-${checklist.id}`}>
                      <textarea
                        placeholder={checklist.keterangan}
                        value={getAnswer(category.nama_kategori, checklist.id)}
                        onChange={(e) => handleChecklistChange(category.nama_kategori, checklist.id, e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border-2 focus:outline-none focus:border-indigo-500 text-sm resize-none ${missing ? 'border-red-400' : 'border-gray-300'}`}
                        rows="3"
                      />
                      {missing && <p className="text-xs text-red-500 mt-1">Belum dijawab</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {category.checklists.map((checklist) => {
                  const missing = isUnanswered(category.nama_kategori, checklist.id);
                  const answer = getAnswer(category.nama_kategori, checklist.id);
                  return (
                    <div
                      key={checklist.id}
                      id={`checklist-${category.nama_kategori}-${checklist.id}`}
                      className={`rounded-xl p-3 ${missing ? 'bg-red-50 border border-red-300' : 'bg-gray-50'}`}
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">{checklist.keterangan}</p>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`${category.nama_kategori}_${checklist.id}`}
                            value="ok"
                            checked={answer === 'ok'}
                            onChange={(e) => handleChecklistChange(category.nama_kategori, checklist.id, e.target.value)}
                            className="w-4 h-4 text-success-600"
                          />
                          <span className="text-sm">Ok</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`${category.nama_kategori}_${checklist.id}`}
                            value="notok"
                            checked={answer === 'notok'}
                            onChange={(e) => handleChecklistChange(category.nama_kategori, checklist.id, e.target.value)}
                            className="w-4 h-4 text-danger-600"
                          />
                          <span className="text-sm">Tidak Ok</span>
                        </label>
                      </div>
                      {missing && <p className="text-xs text-red-500 mt-2">Belum dijawab</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Status Pemeliharaan */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Status Pemeliharaan <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className={SELECT_CLASS}
            required
          >
            <option value="">Pilih status pemeliharaan</option>
            <option value="Selesai">Selesai</option>
            <option value="Tindakan Lanjutan">Tindakan Lanjutan</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Pilih "Tindakan Lanjutan" jika alat membutuhkan penanganan lebih lanjut.
          </p>
        </div>

        {/* Kondisi Alat */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Kondisi Alat <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.kondisi_alat}
            onChange={(e) => setFormData(prev => ({ ...prev, kondisi_alat: e.target.value }))}
            className={SELECT_CLASS}
            required
          >
            <option value="">Pilih kondisi alat</option>
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
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Rekomendasi <span className="text-red-500">*</span>
          </label>
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
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Keterangan Pemeliharaan <span className="text-red-500">*</span>
          </label>
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
            label="Tanda Tangan Teknisi Pelaksana *"
          />
        </div>

        {/* Tanda Tangan Kepala Ruangan */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <SignaturePad
            ref={signatureKepalaRuangRef}
            label="Tanda Tangan Kepala Ruangan (Opsional)"
          />
          <p className="text-xs text-gray-500 mt-2">Tanda tangan Kepala Ruangan dapat diisi nanti</p>
        </div>

        {/* Nama Kepala Ruangan */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">Nama Kepala Ruangan (Opsional)</label>
          <input
            type="text"
            value={formData.nama_kepala_ruangan}
            onChange={(e) => setFormData(prev => ({ ...prev, nama_kepala_ruangan: e.target.value }))}
            placeholder="Masukkan nama Kepala Ruangan"
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
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
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
    </div>
  );
}
