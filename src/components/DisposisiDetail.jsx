import { formatDateTime } from '../utils/format';
import DetailField from './detail/DetailField';
import TeksBlok from './detail/TeksBlok';

/**
 * Detail disposisi (baca-saja).
 */
export default function DisposisiDetail({ disposisi }) {
  if (!disposisi || !disposisi.disposisi_tgl) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-bold text-text-dark">Disposisi pimpinan</h2>

      <dl>
        <DetailField label="Tanggal disposisi" value={formatDateTime(disposisi.disposisi_tgl)} />
      </dl>

      <TeksBlok label="Isi disposisi">{disposisi.disposisi_isi}</TeksBlok>

      <div>
        <p className="text-xs font-semibold text-[#808191] mb-1">Nama dan tanda tangan pimpinan</p>
        <div className="flex items-end justify-between gap-3">
          <p className="text-sm font-semibold text-text-dark">{disposisi.disposisi_nama || '-'}</p>
          {disposisi.disposisi_ttd && (
            <img
              src={disposisi.disposisi_ttd}
              alt="Tanda tangan pimpinan"
              className="max-w-[120px] h-auto border border-dashed border-gray-300 rounded-lg bg-white p-1"
            />
          )}
        </div>
      </div>
    </div>
  );
}
