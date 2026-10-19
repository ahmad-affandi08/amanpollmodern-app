import { useParams, useSearchParams } from 'react-router-dom';
import { useDisposisiAduan, usePageTitle } from '../../../hooks';
import DisposisiPage from '../disposisi/DisposisiPage';

/** Halaman disposisi pimpinan untuk aduan (tanpa login; dibuka lewat tautan bertoken). */
export default function MobileDisposisiAduan() {
  usePageTitle('Disposisi Aduan');
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const { data: aduan, isLoading, error } = useDisposisiAduan(id, token);

  return (
    <DisposisiPage jenis="aduan" data={aduan} isLoading={isLoading} error={error} token={token} />
  );
}
