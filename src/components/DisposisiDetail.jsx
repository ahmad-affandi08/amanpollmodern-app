/**
 * Disposisi Detail Component
 * Displays disposisi information in read-only format
 */
export default function DisposisiDetail({ disposisi }) {
  if (!disposisi || !disposisi.disposisi_tgl) {
    return null;
  }


  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} - ${hours}:${minutes} WIB`;
  };

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
            {formatDate(disposisi.disposisi_tgl)}
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
