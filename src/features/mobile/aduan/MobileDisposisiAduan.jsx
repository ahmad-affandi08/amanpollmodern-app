import { useParams } from 'react-router-dom';
import { useAduanDetail, usePageTitle } from '../../../hooks';
import DisposisiPage from '../disposisi/DisposisiPage';

/** Halaman disposisi pimpinan untuk aduan (publik, tanpa login). */
export default function MobileDisposisiAduan() {
  usePageTitle('Disposisi Aduan');
  const { id } = useParams();
  const { data: aduan, isLoading, isError } = useAduanDetail(id);

  return <DisposisiPage jenis="aduan" data={aduan} isLoading={isLoading} isError={isError} />;
}
