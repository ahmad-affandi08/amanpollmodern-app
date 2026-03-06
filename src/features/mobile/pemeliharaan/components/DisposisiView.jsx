import { ArrowLeft, Package, FileText, Wrench, Lightbulb, CheckCircle } from 'lucide-react';
import DisposisiDetail from '../../../../components/DisposisiDetail';
import DisposisiForm from './DisposisiForm';
import { useNavigate } from 'react-router-dom';

/**
 * Disposisi View for Pemeliharaan
 * Modern redesign with glassmorphism and smooth animations (matching Aduan design)
 */
export default function DisposisiView({ pemeliharaan }) {
  const navigate = useNavigate();
  const hasDisposisi = pemeliharaan?.disposisi_tgl;

  if (hasDisposisi) {
    return (
      <div className="space-y-4">
        {/* Success Banner */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-[20px] p-4 flex items-start gap-3">
          <div className="p-2 bg-green-500 rounded-xl">
            <CheckCircle className="text-white" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-green-800 mb-1">Disposisi Selesai</h4>
            <p className="text-xs text-green-700">
              Pemeliharaan ini telah mendapat disposisi dari pimpinan.
            </p>
          </div>
        </div>

        {/* Pemeliharaan Info Card */}
        <div className="bg-white rounded-[20px] shadow-lg p-5">
          <h5 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
            <Package size={16} />
            Informasi Pemeliharaan
          </h5>

          <div className="space-y-3">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
              <small className="text-xs text-purple-600 font-semibold">No. Inventaris</small>
              <p className="mt-1 font-bold text-gray-900">{pemeliharaan.no_inventaris}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
              <small className="text-xs text-blue-600 font-semibold">Nama Alat</small>
              <p className="mt-1 font-bold text-gray-900">{pemeliharaan.nama_alat_nama}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-orange-600" />
                <small className="text-xs text-orange-600 font-semibold">Keterangan Pemeliharaan</small>
              </div>
              <p className="text-sm text-gray-900">{pemeliharaan.keterangan_pemeliharaan || '-'}</p>
            </div>

            {pemeliharaan.rekomendasi && (
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-100">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={14} className="text-yellow-600" />
                  <small className="text-xs text-yellow-600 font-semibold">Rekomendasi</small>
                </div>
                <p className="text-sm text-gray-900">{pemeliharaan.rekomendasi}</p>
              </div>
            )}
          </div>
        </div>

        {/* Disposisi Detail Card */}
        <div className="bg-white rounded-[20px] shadow-lg p-5">
          <DisposisiDetail disposisi={pemeliharaan} />
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Kembali ke Home
        </button>
      </div>
    );
  }


  return <DisposisiForm pemeliharaan={pemeliharaan} />;
}
