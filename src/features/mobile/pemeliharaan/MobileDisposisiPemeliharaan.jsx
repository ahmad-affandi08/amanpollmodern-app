import { useParams } from 'react-router-dom';
import { usePemeliharaanDetail, usePageTitle } from '../../../hooks';
import DisposisiPage from '../disposisi/DisposisiPage';

/** Halaman disposisi pimpinan untuk pemeliharaan (publik, tanpa login). */
export default function MobileDisposisiPemeliharaan() {
  usePageTitle('Disposisi Pemeliharaan');
  const { id } = useParams();
  const { data: pemeliharaan, isLoading, isError } = usePemeliharaanDetail(id);

  return <DisposisiPage jenis="pemeliharaan" data={pemeliharaan} isLoading={isLoading} isError={isError} />;
}
