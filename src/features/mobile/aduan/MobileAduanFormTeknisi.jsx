import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';
import { usePageTitle, useAuth, useToast, useAduanDetail, useUpdateInspection } from '../../../hooks';
import { formatDateTime } from '../../../utils/format';
import StatusBadge from '../../../components/StatusBadge';
import KondisiBadge from '../../../components/KondisiBadge';
import SignaturePad from '../../../components/SignaturePad';
import SearchableSelect from '../../../components/SearchableSelect';
import Input from '../../../components/Input';
import axiosClient from '../../../api/axiosClient';
import ServisPihakKetigaPanel from '../../../components/ServisPihakKetigaPanel';
import DetailSection from '../../../components/detail/DetailSection';
import TeksBlok from '../../../components/detail/TeksBlok';
import { DetailRow } from '../../../components/detail/DetailField';

const FIELD =
  'w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-gray-200 bg-white text-sm font-medium text-text-dark placeholder:text-[#B0B3C7] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10';
const LABEL = 'block text-[13px] font-bold text-text-dark mb-1.5';



export default function MobileAduanFormTeknisi() {
  usePageTitle('Form Pemeriksaan');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const { data: aduan, isLoading } = useAduanDetail(id);
  const updateInspection = useUpdateInspection();

  const ttdTeknisiRef = useRef(null);
  const ttdKepalaRuangRef = useRef(null);

  const [formData, setFormData] = useState({
    tindakan_teknisi: '',
    rekomendasi: '',
    kondisi_alat: '',
    tingkat_kerusakan: '',
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
      showToast('Tanda tangan Kepala Ruangan harus diisi!', 'error');
      return;
    }

    if (updateInspection.isPending) return;

    try {
      const inspectionData = {
        ...formData,
        // Pemeriksaan lanjutan memakai tingkat yang sudah tercatat bila belum diubah; kosong dikirim null.
        tingkat_kerusakan: formData.tingkat_kerusakan || aduan.tingkat_kerusakan || null,
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
        <h1 className="text-lg font-extrabold text-text-dark">Form Pemeriksaan</h1>
      </div>

      <DetailSection
        judul="Informasi alat"
        aksi={
          !isEditingEquipment && (
            <button
              type="button"
              onClick={() => setIsEditingEquipment(true)}
              className="text-xs font-bold text-brand-primary px-2 py-1 rounded-lg hover:bg-brand-primary/10 transition-colors"
            >
              Ubah alat
            </button>
          )
        }
      >
        {isEditingEquipment ? (
          <div className="space-y-3">
            {isLoadingInventaris ? (
              <div className="text-center py-4">
                <Loader2 className="animate-spin text-brand-primary mx-auto" size={20} />
                <p className="text-xs text-[#808191] mt-2">Memuat daftar alat...</p>
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

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsEditingEquipment(false)}
                disabled={!formData.inventaris_id}
                className="flex items-center justify-center gap-2 h-11 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                Simpan
              </button>
              <button
                type="button"
                onClick={handleCancelEquipmentChange}
                className="flex items-center justify-center gap-2 h-11 rounded-xl bg-gray-100 text-text-dark text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
                Batal
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-lg font-extrabold text-text-dark">{displayEquipment.nama_alat_nama || displayEquipment.nama_alat}</p>
            <p className="font-mono text-xs text-[#808191] mt-0.5 break-all">{displayEquipment.no_inventaris}</p>
            <dl className="mt-4 pt-4 border-t border-gray-100">
              <DetailRow label="Ruangan" value={displayEquipment.ruangan_nama} />
              <DetailRow label="Keluhan" value={aduan.keluhan} />
            </dl>
          </>
        )}
      </DetailSection>

      {/* Pemeriksaan sebelumnya: tampil bila aduan sudah pernah diperiksa */}
      {aduan.tindakan_teknisi && (
        <DetailSection judul="Pemeriksaan sebelumnya">
          <div className="space-y-3">
            <TeksBlok label="Tindakan teknisi">{aduan.tindakan_teknisi}</TeksBlok>
            {aduan.rekomendasi && <TeksBlok label="Rekomendasi">{aduan.rekomendasi}</TeksBlok>}
          </div>
          <dl className="mt-4 pt-4 border-t border-gray-100">
            {aduan.kondisi_alat && (
              <DetailRow label="Kondisi alat">
                <KondisiBadge kondisi={aduan.kondisi_alat} size="md" />
              </DetailRow>
            )}
            {aduan.status_aduan && (
              <DetailRow label="Status">
                <StatusBadge status={aduan.status_aduan} />
              </DetailRow>
            )}
            {aduan.tanggal_pemeriksaan && <DetailRow label="Tanggal" value={formatDateTime(aduan.tanggal_pemeriksaan)} />}
          </dl>
          <p className="mt-4 rounded-xl bg-brand-primary/10 px-3.5 py-2.5 text-xs font-semibold text-brand-primary">
            Ini pemeriksaan lanjutan. Isi form di bawah untuk memperbarui status terbaru.
          </p>
        </DetailSection>
      )}

      {/* Laporan vendor: di luar <form> agar tidak ikut tersubmit; boleh ditambah sebelum atau sesudah pemeriksaan */}
      <DetailSection>
        <ServisPihakKetigaPanel jenis="aduan" indukId={aduan.id_aduan} status={aduan.status_aduan} />
      </DetailSection>

      <form onSubmit={handleSubmit} className="space-y-4">
        <DetailSection judul="Hasil pemeriksaan">
          <div className="space-y-4">
            <div>
              <label className={LABEL} htmlFor="tindakan_teknisi">
                Tindakan teknisi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="tindakan_teknisi"
                name="tindakan_teknisi"
                value={formData.tindakan_teknisi}
                onChange={handleChange}
                placeholder="Masukkan tindakan yang dilakukan..."
                rows={3}
                className={`${FIELD} resize-none`}
                required
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="rekomendasi">
                Rekomendasi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rekomendasi"
                name="rekomendasi"
                value={formData.rekomendasi}
                onChange={handleChange}
                placeholder="Masukkan rekomendasi..."
                rows={3}
                className={`${FIELD} resize-none`}
                required
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="kondisi_alat">
                Kondisi alat <span className="text-red-500">*</span>
              </label>
              <select id="kondisi_alat" name="kondisi_alat" value={formData.kondisi_alat} onChange={handleChange} className={FIELD} required>
                <option value="">Pilih kondisi alat</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>

            <div>
              <label className={LABEL} htmlFor="tingkat_kerusakan">
                Tingkat kerusakan {formData.status_aduan === 'Selesai' && <span className="text-red-500">*</span>}
              </label>
              <select
                id="tingkat_kerusakan"
                name="tingkat_kerusakan"
                value={formData.tingkat_kerusakan || aduan.tingkat_kerusakan || ''}
                onChange={handleChange}
                className={FIELD}
                required={formData.status_aduan === 'Selesai'}
                aria-describedby="tingkat_kerusakan_hint"
              >
                <option value="">Pilih tingkat kerusakan</option>
                <option value="Ringan">Ringan</option>
                <option value="Berat">Berat</option>
              </select>
              <p id="tingkat_kerusakan_hint" className="mt-1 text-[11px] text-[#808191]">
                Dipakai untuk rekap realisasi SKI (korektif ringan atau berat). Wajib diisi saat status Selesai.
              </p>
            </div>

            <div>
              <label className={LABEL} htmlFor="status_aduan">
                Status <span className="text-red-500">*</span>
              </label>
              <select id="status_aduan" name="status_aduan" value={formData.status_aduan} onChange={handleChange} className={FIELD} required>
                <option value="">Pilih status aduan</option>
                <option value="Tindakan Lanjutan">Tindakan Lanjutan</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div>
              <label className={LABEL}>
                {formData.status_aduan === 'Selesai' ? 'Biaya riil perbaikan (Rp)' : 'Estimasi biaya perbaikan (Rp)'}
              </label>
              <Input
                currency
                name="biaya"
                value={formData.biaya}
                onChange={handleChange}
                placeholder="Contoh: 150.000"
                inputMode="numeric"
                required
              />
              <small className="text-xs text-[#808191] mt-1.5 block">
                {formData.status_aduan === 'Selesai'
                  ? 'Masukkan total biaya asli perbaikan, termasuk biaya vendor bila dikerjakan pihak ketiga. Isi 0 jika tidak ada biaya.'
                  : 'Masukkan perkiraan biaya perbaikan, termasuk biaya vendor bila dikerjakan pihak ketiga. Isi 0 jika tidak ada estimasi.'}
              </small>
            </div>
          </div>
        </DetailSection>

        <DetailSection judul="Tanda tangan">
          <div className="space-y-5">
            <div>
              <SignaturePad ref={ttdTeknisiRef} label="Teknisi pelaksana *" />
              <p className="text-xs text-[#808191] mt-1.5">{user?.nama_lengkap}</p>
            </div>
            <div>
              <SignaturePad ref={ttdKepalaRuangRef} label="Kepala ruangan *" />
              <p className="text-xs text-[#808191] mt-1.5">Pelapor: {aduan.nama_pengadu}</p>
            </div>
          </div>
        </DetailSection>

        <div className="sticky bottom-24 pt-1">
          <button
            type="submit"
            disabled={updateInspection.isPending}
            className="w-full h-12 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {updateInspection.isPending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan pemeriksaan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
