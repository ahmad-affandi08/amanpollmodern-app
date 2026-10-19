import { formatDateTime } from '../utils/format';

/**
 * Detail disposisi (baca-saja).
 */
export default function DisposisiDetail({ disposisi }) {
  if (!disposisi || !disposisi.disposisi_tgl) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h5 className="text-sm font-bold text-gray-600 uppercase">
        Detail Disposisi Pimpinan
      </h5>

      <div className="space-y-3">
        {/* Tanggal Disposisi */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <small className="text-xs text-gray-500">Tanggal Disposisi</small>
          <p className="mt-1 font-semibold text-gray-900">
            {formatDateTime(disposisi.disposisi_tgl)}
          </p>
        </div>

        {/* Isi Disposisi */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <small className="text-xs text-gray-500">Isi Disposisi</small>
          <p className="mt-1 text-gray-900 whitespace-pre-wrap">
            {disposisi.disposisi_isi || '-'}
          </p>
        </div>

        {/* Nama & Tanda Tangan */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <small className="text-xs text-gray-500">
            Nama & Tanda Tangan Pimpinan
          </small>
          <div className="mt-2 flex justify-between items-end">
            <p className="font-semibold text-gray-900">
              {disposisi.disposisi_nama || '-'}
            </p>
            {disposisi.disposisi_ttd && (
              <img
                src={disposisi.disposisi_ttd}
                alt="Tanda Tangan"
                className="max-w-[120px] h-auto border border-gray-200 rounded"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
