import { ArrowLeft, Package, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DisposisiDetail from '../../../components/DisposisiDetail';
import DisposisiForm from './DisposisiForm';
import { DISPOSISI_CONFIG } from './disposisiConfig';

/**
 * Tampilan disposisi: detail (bila sudah ada disposisi) atau form (bila belum).
 * `jenis`: 'aduan' | 'pemeliharaan'.
 */
export default function DisposisiView({ jenis, data }) {
  const navigate = useNavigate();
  const config = DISPOSISI_CONFIG[jenis];

  if (!data?.disposisi_tgl) {
    return <DisposisiForm jenis={jenis} data={data} />;
  }

  return (
    <div className="space-y-4">
      {/* Banner selesai */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-[20px] p-4 flex items-start gap-3">
        <div className="p-2 bg-green-500 rounded-xl">
          <CheckCircle className="text-white" size={20} />
        </div>
        <div>
          <h4 className="font-bold text-green-800 mb-1">Disposisi Selesai</h4>
          <p className="text-xs text-green-700">{config.doneText}</p>
        </div>
      </div>

      {/* Info {config.title} */}
      <div className="bg-white rounded-[20px] shadow-lg p-5">
        <h5 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
          <Package size={16} />
          Informasi {config.title}
        </h5>

        <div className="space-y-3">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
            <small className="text-xs text-purple-600 font-semibold">No. Inventaris</small>
            <p className="mt-1 font-bold text-gray-900">{data.no_inventaris}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
            <small className="text-xs text-blue-600 font-semibold">Nama Alat</small>
            <p className="mt-1 font-bold text-gray-900">{data.nama_alat_nama}</p>
          </div>

          {config.fields
            .filter((field) => field.always || data[field.key])
            .map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className={`bg-gradient-to-br ${field.box} p-4 rounded-xl border`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className={field.text} />
                    <small className={`text-xs ${field.text} font-semibold`}>{field.label}</small>
                  </div>
                  <p className="text-sm text-gray-900">{data[field.key] || '-'}</p>
                </div>
              );
            })}
        </div>
      </div>

      <div className="bg-white rounded-[20px] shadow-lg p-5">
        <DisposisiDetail disposisi={data} />
      </div>

      {/* Halaman ini publik: tujuan akhirnya halaman login */}
      <button
        onClick={() => navigate('/login')}
        className="w-full py-4 bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
      >
        <ArrowLeft size={20} />
        Ke Halaman Login
      </button>
    </div>
  );
}
