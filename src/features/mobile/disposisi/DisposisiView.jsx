import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DisposisiDetail from '../../../components/DisposisiDetail';
import DetailSection from '../../../components/detail/DetailSection';
import DetailField from '../../../components/detail/DetailField';
import TeksBlok from '../../../components/detail/TeksBlok';
import DisposisiForm from './DisposisiForm';
import { DISPOSISI_CONFIG } from './disposisiConfig';

/**
 * Tampilan disposisi: detail (bila sudah ada disposisi) atau form (bila belum).
 * `jenis`: 'aduan' | 'pemeliharaan'.
 */
export default function DisposisiView({ jenis, data, token }) {
  const navigate = useNavigate();
  const config = DISPOSISI_CONFIG[jenis];

  if (!data?.disposisi_tgl) {
    return <DisposisiForm jenis={jenis} data={data} token={token} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-[20px] bg-success-50 border border-success-100 p-4">
        <CheckCircle className="text-success-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-success-700">Disposisi selesai</h4>
          <p className="text-sm text-success-700">{config.doneText}</p>
        </div>
      </div>

      <DetailSection judul={`Informasi ${config.title.toLowerCase()}`}>
        <dl className="grid grid-cols-2 gap-4">
          <DetailField label="No. inventaris" value={data.no_inventaris} mono />
          <DetailField label="Nama alat" value={data.nama_alat_nama} />
        </dl>
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
          {config.fields
            .filter((field) => field.always || data[field.key])
            .map((field) => (
              <TeksBlok key={field.key} label={field.label}>{data[field.key]}</TeksBlok>
            ))}
        </div>
      </DetailSection>

      <DetailSection>
        <DisposisiDetail disposisi={data} />
      </DetailSection>

      {/* Halaman ini publik: tujuan akhirnya halaman login */}
      <button
        type="button"
        onClick={() => navigate('/login')}
        className="w-full h-12 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft size={18} />
        Ke halaman login
      </button>
    </div>
  );
}
