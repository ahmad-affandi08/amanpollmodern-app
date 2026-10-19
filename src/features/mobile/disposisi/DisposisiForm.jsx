import { useState, useRef } from 'react';
import SignaturePad from '../../../components/SignaturePad';
import { useToast, useCreateDisposisiAduan, useCreateDisposisiPemeliharaan } from '../../../hooks';
import { toInputDate } from '../../../utils/format';
import { DISPOSISI_CONFIG } from './disposisiConfig';

/**
 * Form disposisi pimpinan (halaman publik, tanpa login).
 * `jenis` memilih mutation, label, dan blok info: 'aduan' | 'pemeliharaan'.
 */
export default function DisposisiForm({ jenis, data }) {
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
      createAduan.mutate({ aduanId: data[config.idKey], data: payload });
    } else {
      createPemeliharaan.mutate({ pemeliharaanId: data[config.idKey], data: payload });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="text-lg font-bold text-gray-800 mb-4">
        Disposisi Pimpinan
      </h4>

      {/* Info {config.title} */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-2">
        <div>
          <strong className="text-sm">No. Inventaris:</strong>
          <br />
          <span className="text-sm">{data.no_inventaris}</span>
        </div>
        <div>
          <strong className="text-sm">Nama Alat:</strong>
          <br />
          <span className="text-sm">{data.nama_alat_nama}</span>
        </div>
        {config.fields.map((field) => (
          <div key={field.key}>
            <hr className="my-2" />
            <strong className="text-sm">{field.label}:</strong>
            <br />
            <span className="text-sm">{data[field.key] || '-'}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tanggal (hanya baca) */}
        <div>
          <label className="block text-sm font-semibold mb-1">Tanggal</label>
          <input
            type="date"
            value={toInputDate()}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Isi Disposisi <span className="text-red-500">*</span>
          </label>
          <textarea
            name="isi_disposisi"
            value={formData.isi_disposisi}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Masukkan isi disposisi..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Nama Pimpinan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama_pimpinan"
            value={formData.nama_pimpinan}
            onChange={handleChange}
            required
            placeholder="Masukkan nama Anda..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <SignaturePad ref={signaturePadRef} label="Tanda Tangan *" />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Disposisi'}
        </button>
      </form>
    </div>
  );
}
