import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignaturePad from '../../../../components/SignaturePad';
import { useCreateDisposisiAduan } from '../../../../hooks/mutations/useDisposisiMutations';

/**
 * Disposisi Form for Aduan
 * Allows Pimpinan to add disposition with signature
 */
export default function DisposisiForm({ aduan }) {
  const navigate = useNavigate();
  const signaturePadRef = useRef(null);
  const [formData, setFormData] = useState({
    isi_disposisi: '',
    nama_pimpinan: '',
  });

  const createDisposisi = useCreateDisposisiAduan();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate signature
    if (signaturePadRef.current?.isEmpty()) {
      alert('Silakan tanda tangan terlebih dahulu.');
      return;
    }

    // Get signature data
    const ttd_base64 = signaturePadRef.current?.toDataURL();

    // Submit
    createDisposisi.mutate(
      {
        aduanId: aduan.id_aduan,
        data: {
          ...formData,
          ttd_base64,
        },
      },
      {
        onSuccess: () => {
          // Navigate back or refresh
          navigate(-1);
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="text-lg font-bold text-gray-800 mb-4">
        Disposisi Pimpinan
      </h4>

      {/* Aduan Info */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-2">
        <div>
          <strong className="text-sm">No. Inventaris:</strong>
          <br />
          <span className="text-sm">{aduan.no_inventaris}</span>
        </div>
        <div>
          <strong className="text-sm">Nama Alat:</strong>
          <br />
          <span className="text-sm">{aduan.nama_alat_nama}</span>
        </div>
        <hr className="my-2" />
        <div>
          <strong className="text-sm">Uraian Aduan:</strong>
          <br />
          <span className="text-sm">{aduan.keluhan}</span>
        </div>
        <hr className="my-2" />
        <div>
          <strong className="text-sm">Tindakan Petugas:</strong>
          <br />
          <span className="text-sm">{aduan.tindakan_teknisi || '-'}</span>
        </div>
        <hr className="my-2" />
        <div>
          <strong className="text-sm">Rekomendasi Petugas:</strong>
          <br />
          <span className="text-sm">{aduan.rekomendasi || '-'}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tanggal (Read-only) */}
        <div>
          <label className="block text-sm font-semibold mb-1">Tanggal</label>
          <input
            type="date"
            value={new Date().toISOString().split('T')[0]}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Isi Disposisi */}
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

        {/* Nama Pimpinan */}
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

        {/* Signature */}
        <div>
          <SignaturePad ref={signaturePadRef} label="Tanda Tangan *" />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={createDisposisi.isPending}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createDisposisi.isPending ? 'Menyimpan...' : 'Simpan Disposisi'}
        </button>
      </form>
    </div>
  );
}
