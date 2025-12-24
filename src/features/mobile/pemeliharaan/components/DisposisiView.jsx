import DisposisiDetail from '../../../../components/DisposisiDetail';
import DisposisiForm from './DisposisiForm';

/**
 * Disposisi View for Pemeliharaan
 * Shows detail if disposisi exists, otherwise shows form
 */
export default function DisposisiView({ pemeliharaan }) {
  // Check if disposisi already exists
  const hasDisposisi = pemeliharaan?.disposisi_tgl;

  if (hasDisposisi) {
    return (
      <div className="space-y-4">
        {/* Pemeliharaan Info Section */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center mb-4">
            <h4 className="text-lg font-bold text-gray-800">
              Detail Pemeliharaan & Disposisi
            </h4>
            <p className="text-xs text-gray-500">
              Pemeliharaan ini telah selesai ditindaklanjuti.
            </p>
          </div>

          <h5 className="text-sm font-bold text-gray-600 uppercase mb-3">
            Informasi Pemeliharaan
          </h5>

          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <small className="text-xs text-gray-500">No. Inventaris</small>
              <p className="mt-1 font-semibold text-gray-900">
                {pemeliharaan.no_inventaris}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <small className="text-xs text-gray-500">Nama Alat</small>
              <p className="mt-1 font-semibold text-gray-900">
                {pemeliharaan.nama_alat_nama}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <small className="text-xs text-gray-500">
                Keterangan Pemeliharaan
              </small>
              <p className="mt-1 text-gray-900">
                {pemeliharaan.keterangan_pemeliharaan || '-'}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <small className="text-xs text-gray-500">Rekomendasi</small>
              <p className="mt-1 text-gray-900">
                {pemeliharaan.rekomendasi || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Disposisi Detail Section */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <DisposisiDetail disposisi={pemeliharaan} />
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-md transition-colors"
        >
          Kembali ke Home
        </button>
      </div>
    );
  }

  // Show form if no disposisi
  return <DisposisiForm pemeliharaan={pemeliharaan} />;
}
