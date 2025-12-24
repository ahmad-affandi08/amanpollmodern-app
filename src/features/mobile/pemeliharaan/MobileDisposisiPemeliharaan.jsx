import { useParams } from 'react-router-dom';
import { usePemeliharaanDetail } from '../../../hooks/queries/usePemeliharaanQueries';
import DisposisiView from './components/DisposisiView';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * Mobile Disposisi Pemeliharaan Page
 * Main page component for Pemeliharaan disposisi
 */
export default function MobileDisposisiPemeliharaan() {
  const { id } = useParams();
  const { data: pemeliharaan, isLoading, error } = usePemeliharaanDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !pemeliharaan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            Pemeliharaan tidak ditemukan
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto">
        <DisposisiView pemeliharaan={pemeliharaan} />
      </div>
    </div>
  );
}
