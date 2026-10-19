import { useParams, useSearchParams } from 'react-router-dom';
import { useDisposisiPemeliharaan, usePageTitle } from '../../../hooks';
import DisposisiPage from '../disposisi/DisposisiPage';

/** Halaman disposisi pimpinan untuk pemeliharaan (tanpa login; dibuka lewat tautan bertoken). */
export default function MobileDisposisiPemeliharaan() {
  usePageTitle('Disposisi Pemeliharaan');
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const { data: pemeliharaan, isLoading, error } = useDisposisiPemeliharaan(id, token);

  return (
    <DisposisiPage jenis="pemeliharaan" data={pemeliharaan} isLoading={isLoading} error={error} token={token} />
  );
}
