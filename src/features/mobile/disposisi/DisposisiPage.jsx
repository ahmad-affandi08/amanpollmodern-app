import { AlertCircle } from 'lucide-react';
import DisposisiView from './DisposisiView';
import { DISPOSISI_CONFIG } from './disposisiConfig';

/**
 * Kerangka halaman disposisi publik (tanpa login) untuk aduan dan pemeliharaan.
 * Data diambil oleh halaman pemanggil sesuai jenisnya.
 */
export default function DisposisiPage({ jenis, data, isLoading, error, token }) {
  const config = DISPOSISI_CONFIG[jenis];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-primary-soft flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-primary font-semibold">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const forbidden = error?.response?.status === 403;
    return (
      <div className="min-h-screen bg-brand-primary-soft flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-[20px] shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {forbidden ? 'Tautan Tidak Valid' : `${config.title} Tidak Ditemukan`}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {forbidden
                ? 'Tautan disposisi ini tidak valid atau tidak lengkap. Gunakan tautan terbaru dari notifikasi WhatsApp, atau login sebagai pimpinan.'
                : `Data ${config.title.toLowerCase()} tidak dapat dimuat. Silakan coba lagi atau hubungi administrator.`}
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full py-3 bg-gradient-to-br from-brand-primary to-brand-primary-light text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-primary-soft">
      <div className="max-w-md mx-auto px-4 py-6">
        <DisposisiView jenis={jenis} data={data} token={token} />
      </div>
    </div>
  );
}
