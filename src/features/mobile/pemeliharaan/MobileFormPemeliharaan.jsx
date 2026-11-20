import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { usePageTitle, useToast, useFormPemeliharaan, useSubmitPemeliharaan } from '../../../hooks';
import { formatDateTime, rupiah } from '../../../utils/format';
import { fotoKeDataUrl } from '../../../utils/foto';
import ImageUploadPreview from '../aduan/components/ImageUploadPreview';
import SignaturePad from '../../../components/SignaturePad';
import StatusBadge from '../../../components/StatusBadge';
import KondisiBadge from '../../../components/KondisiBadge';
import Input from '../../../components/Input';
import ServisPihakKetigaPanel from '../../../components/ServisPihakKetigaPanel';
import DetailSection from '../../../components/detail/DetailSection';
import TeksBlok from '../../../components/detail/TeksBlok';
import { DetailRow } from '../../../components/detail/DetailField';

const FIELD =
  'w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-gray-200 bg-white text-sm font-medium text-text-dark placeholder:text-[#B0B3C7] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10';
const LABEL = 'block text-[13px] font-bold text-text-dark mb-1.5';


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
  const [submitted, setSubmitted] = useState(false);
  // Foto bukti (opsional): berkas mentah; diperkecil saat dikirim.
  const [foto, setFoto] = useState({ sebelum: null, sesudah: null });

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

  // Checklist bersifat opsional: hanya item yang dijawab yang dikirim (jawaban kosong dibuang).
  const answeredOnly = (items) => (items || []).filter(item => String(item.hasil ?? '').trim() !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitMutation.isPending || submitted) return;

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

    let fotoData;
    try {
      fotoData = {
        foto_sebelum: foto.sebelum ? await fotoKeDataUrl(foto.sebelum) : undefined,
        foto_sesudah: foto.sesudah ? await fotoKeDataUrl(foto.sesudah) : undefined,
      };
    } catch {
      showToast('Foto tidak dapat diproses. Pilih foto lain atau hapus foto.', 'error');
      return;
    }

    const submitData = {
      ...formData,
      ...fotoData,
      safety_check: answeredOnly(formData.safety_check),
      maintenance: answeredOnly(formData.maintenance),
      p_fungsi: answeredOnly(formData.p_fungsi),
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
    <div className="max-w-md mx-auto px-4 pb-24 space-y-4">
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-text-dark"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-text-dark leading-tight">Form Pemeliharaan</h1>
          <p className="text-xs text-[#808191]">Isi checklist dan hasil pemeliharaan</p>
        </div>
      </div>

      {/* Pemeriksaan sebelumnya (bila sudah pernah diperiksa) */}
      {isFollowUp && (
        <DetailSection judul="Pemeriksaan sebelumnya">
          <div className="space-y-3">
            <TeksBlok label="Keterangan pemeliharaan">{previous.keterangan_pemeliharaan}</TeksBlok>
            {previous.rekomendasi && <TeksBlok label="Rekomendasi">{previous.rekomendasi}</TeksBlok>}
          </div>
          <dl className="mt-4 pt-4 border-t border-gray-100">
            {previous.kondisi_alat && (
              <DetailRow label="Kondisi alat">
                <KondisiBadge kondisi={previous.kondisi_alat} size="md" />
              </DetailRow>
            )}
            {previous.status && (
              <DetailRow label="Status">
                <StatusBadge status={previous.status} />
              </DetailRow>
            )}
            {previous.tanggal_pemeriksaan && <DetailRow label="Tanggal" value={formatDateTime(previous.tanggal_pemeriksaan)} />}
            {parseFloat(previous.biaya) > 0 && <DetailRow label="Biaya" value={rupiah(previous.biaya)} />}
            {previous.nama_kepala_ruangan && <DetailRow label="Kepala ruangan" value={previous.nama_kepala_ruangan} />}
          </dl>
          <p className="mt-4 rounded-xl bg-brand-primary/10 px-3.5 py-2.5 text-xs font-semibold text-brand-primary">
            Ini pemeriksaan lanjutan. Isi form di bawah untuk memperbarui status terbaru.
          </p>
        </DetailSection>
      )}

      {/* Laporan vendor: di luar <form> agar tidak ikut tersubmit */}
      <DetailSection>
        <ServisPihakKetigaPanel jenis="pemeliharaan" indukId={id} status={previous?.status} />
      </DetailSection>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Checklist: hanya untuk pemeriksaan pertama; pengisian bersifat opsional */}
        {categories.map((category) => (
          <DetailSection key={category.id} judul={`${category.display_kategori} (opsional)`}>
            {category.checklists.length === 0 ? (
              <p className="text-sm text-[#808191] text-center py-4">Checklist kosong</p>
            ) : category.nama_kategori === 'safety_check' ? (
              <div className="space-y-3">
                {category.checklists.map((checklist) => (
                  <div key={checklist.id} id={`checklist-${category.nama_kategori}-${checklist.id}`}>
                    <textarea
                      placeholder={checklist.keterangan}
                      value={getAnswer(category.nama_kategori, checklist.id)}
                      onChange={(e) => handleChecklistChange(category.nama_kategori, checklist.id, e.target.value)}
                      className={`${FIELD} resize-none`}
                      rows="3"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {category.checklists.map((checklist) => {
                  const answer = getAnswer(category.nama_kategori, checklist.id);
                  return (
                    <div
                      key={checklist.id}
                      id={`checklist-${category.nama_kategori}-${checklist.id}`}
                      className="rounded-xl p-3.5 bg-gray-50"
                    >
                      <p className="text-sm font-semibold text-text-dark mb-2">{checklist.keterangan}</p>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`${category.nama_kategori}_${checklist.id}`}
                            value="ok"
                            checked={answer === 'ok'}
                            onChange={(e) => handleChecklistChange(category.nama_kategori, checklist.id, e.target.value)}
                            className="w-4 h-4 accent-green-600"
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
                            className="w-4 h-4 accent-red-600"
                          />
                          <span className="text-sm">Tidak Ok</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DetailSection>
        ))}

        <DetailSection judul="Hasil pemeliharaan">
          <div className="space-y-4">
            <div>
              <label className={LABEL}>
                Status pemeliharaan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className={FIELD}
                required
              >
                <option value="">Pilih status pemeliharaan</option>
                <option value="Selesai">Selesai</option>
                <option value="Tindakan Lanjutan">Tindakan Lanjutan</option>
              </select>
              <p className="text-xs text-[#808191] mt-1.5">Pilih "Tindakan Lanjutan" jika alat membutuhkan penanganan lebih lanjut.</p>
            </div>

            <div>
              <label className={LABEL}>
                Kondisi alat <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kondisi_alat}
                onChange={(e) => setFormData(prev => ({ ...prev, kondisi_alat: e.target.value }))}
                className={FIELD}
                required
              >
                <option value="">Pilih kondisi alat</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
              <p className="text-xs text-[#808191] mt-1.5">Jika "Rusak Berat", notifikasi akan dikirim ke pimpinan.</p>
            </div>

            <div>
              <label className={LABEL}>
                Rekomendasi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.rekomendasi}
                onChange={(e) => setFormData(prev => ({ ...prev, rekomendasi: e.target.value }))}
                placeholder="Masukkan rekomendasi"
                className={`${FIELD} resize-none`}
                rows="3"
                required
              />
            </div>

            <div>
              <label className={LABEL}>
                Keterangan pemeliharaan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.keterangan_pemeliharaan}
                onChange={(e) => setFormData(prev => ({ ...prev, keterangan_pemeliharaan: e.target.value }))}
                placeholder="Masukkan keterangan pemeliharaan"
                className={`${FIELD} resize-none`}
                rows="3"
                required
              />
            </div>

            <div>
              <label className={LABEL}>
                {formData.status === 'Selesai' ? 'Biaya riil pemeliharaan (Rp)' : 'Estimasi biaya pemeliharaan (Rp)'}
              </label>
              <Input
                currency
                name="biaya"
                value={formData.biaya}
                onChange={(e) => setFormData(prev => ({ ...prev, biaya: parseFloat(e.target.value) || 0 }))}
                placeholder="Contoh: 75.000"
                inputMode="numeric"
                required
              />
              <p className="text-xs text-[#808191] mt-1.5">
                {formData.status === 'Selesai'
                  ? 'Masukkan total biaya asli pemeliharaan, termasuk biaya vendor bila dikerjakan pihak ketiga. Isi 0 jika tidak ada biaya.'
                  : 'Masukkan perkiraan biaya pemeliharaan, termasuk biaya vendor bila dikerjakan pihak ketiga. Isi 0 jika tidak ada estimasi.'}
              </p>
            </div>
          </div>
        </DetailSection>

        <DetailSection judul="Foto pemeliharaan (opsional)">
          <div className="space-y-5">
            <div>
              <label className={LABEL}>Foto sebelum</label>
              <ImageUploadPreview onChange={(file) => setFoto((prev) => ({ ...prev, sebelum: file }))} />
            </div>
            <div>
              <label className={LABEL}>Foto sesudah</label>
              <ImageUploadPreview onChange={(file) => setFoto((prev) => ({ ...prev, sesudah: file }))} />
            </div>
          </div>
        </DetailSection>

        <DetailSection judul="Tanda tangan">
          <div className="space-y-5">
            <SignaturePad ref={signatureTeknisiRef} label="Teknisi pelaksana *" />

            <div>
              <SignaturePad ref={signatureKepalaRuangRef} label="Kepala ruangan (opsional)" />
              <p className="text-xs text-[#808191] mt-1.5">Tanda tangan kepala ruangan dapat diisi nanti.</p>
            </div>

            <div>
              <label className={LABEL}>Nama kepala ruangan (opsional)</label>
              <input
                type="text"
                value={formData.nama_kepala_ruangan}
                onChange={(e) => setFormData(prev => ({ ...prev, nama_kepala_ruangan: e.target.value }))}
                placeholder="Masukkan nama kepala ruangan"
                className={FIELD}
              />
              <p className="text-xs text-[#808191] mt-1.5">Nama dapat diisi nanti saat tanda tangan.</p>
            </div>
          </div>
        </DetailSection>

        <div className="sticky bottom-24 pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-12 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
