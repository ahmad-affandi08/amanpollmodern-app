import { useState, useRef } from 'react';
import SignaturePad from '../../../components/SignaturePad';
import { useToast, useCreateDisposisiAduan, useCreateDisposisiPemeliharaan } from '../../../hooks';
import { toInputDate } from '../../../utils/format';
import { DISPOSISI_CONFIG } from './disposisiConfig';
import DetailSection from '../../../components/detail/DetailSection';
import DetailField from '../../../components/detail/DetailField';
import TeksBlok from '../../../components/detail/TeksBlok';

const FIELD =
  'w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-gray-200 bg-white text-sm font-medium text-text-dark placeholder:text-[#B0B3C7] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10';
const LABEL = 'block text-[13px] font-bold text-text-dark mb-1.5';

/**
 * Form disposisi pimpinan (halaman publik, tanpa login).
 * `jenis` memilih mutation, label, dan blok info: 'aduan' | 'pemeliharaan'.
 */
export default function DisposisiForm({ jenis, data, token }) {
  const config = DISPOSISI_CONFIG[jenis];
  const { showToast } = useToast();
  const signaturePadRef = useRef(null);
  const [formData, setFormData] = useState({
    isi_disposisi: '',
    nama_pimpinan: '',
  });

  // Toast sukses/gagal ditampilkan oleh mutation; di sini hanya memilih yang sesuai jenis.
  const createAduan = useCreateDisposisiAduan();
  const createPemeliharaan = useCreateDisposisiPemeliharaan();
  const isPending = jenis === 'aduan' ? createAduan.isPending : createPemeliharaan.isPending;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPending) return;

    if (signaturePadRef.current?.isEmpty()) {
      showToast('Silakan tanda tangan terlebih dahulu.', 'warning');
      return;
    }

    const payload = { ...formData, ttd_base64: signaturePadRef.current?.toDataURL() };

    // Setelah berhasil, data di-refresh sehingga halaman otomatis menampilkan detail disposisi.
    if (jenis === 'aduan') {
      createAduan.mutate({ aduanId: data[config.idKey], data: payload, token });
    } else {
      createPemeliharaan.mutate({ pemeliharaanId: data[config.idKey], data: payload, token });
    }
  };

  return (
    <DetailSection judul="Disposisi pimpinan">
      <dl className="grid grid-cols-2 gap-4">
        <DetailField label="No. inventaris" value={data.no_inventaris} mono />
        <DetailField label="Nama alat" value={data.nama_alat_nama} />
      </dl>
      <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
        {config.fields.map((field) => (
          <TeksBlok key={field.key} label={field.label}>{data[field.key]}</TeksBlok>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-5 pt-5 border-t border-gray-100">
        {/* Tanggal (hanya baca) */}
        <div>
          <label className={LABEL}>Tanggal</label>
          <input type="date" value={toInputDate()} readOnly className={`${FIELD} bg-gray-50`} />
        </div>

        <div>
          <label className={LABEL}>
            Isi disposisi <span className="text-red-500">*</span>
          </label>
          <textarea
            name="isi_disposisi"
            value={formData.isi_disposisi}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Masukkan isi disposisi..."
            className={`${FIELD} resize-none`}
          />
        </div>

        <div>
          <label className={LABEL}>
            Nama pimpinan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama_pimpinan"
            value={formData.nama_pimpinan}
            onChange={handleChange}
            required
            placeholder="Masukkan nama Anda..."
            className={FIELD}
          />
        </div>

        <SignaturePad ref={signaturePadRef} label="Tanda tangan *" />

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Menyimpan...' : 'Simpan disposisi'}
        </button>
      </form>
    </DetailSection>
  );
}
