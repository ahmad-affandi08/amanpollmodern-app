import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, PackagePlus } from 'lucide-react';
import { useAlatBaru } from '../../../hooks/queries/useAlatBaruQueries';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import AlatBaruCard from './components/AlatBaruCard';
import Button from '../../../components/Button';

export default function MobileAlatBaru() {
  usePageTitle('Alat Baru');
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAlatBaru({ per_page: 10 });

  const alatBaruList = data?.pages || [];


  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 space-y-4 pt-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[20px] p-4 border border-gray-100 animate-pulse">
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }


  if (isError) {
    return (
      <div className="max-w-md mx-auto px-4 pt-3">
        <div className="bg-white rounded-[20px] p-6 text-center border border-gray-100">
          <PackagePlus className="mx-auto text-danger-500 mb-3" size={48} />
          <h3 className="text-lg font-bold text-text-dark mb-2">Terjadi Kesalahan</h3>
          <p className="text-sm text-text-gray">{error?.message || 'Gagal memuat data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between py-3">
        <h1 className="text-xl font-bold text-text-dark">Alat Baru</h1>
        <Button
          onClick={() => navigate('/mobile/alat-baru/add')}
          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          <span className="font-semibold">Tambah</span>
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {alatBaruList.length > 0 ? (
          <>
            {alatBaruList.map((item) => (
              <AlatBaruCard
                key={item.id}
                data={item}
                onClick={() => navigate(`/mobile/alat-baru/${item.id}`)}
              />
            ))}

            {/* Load More Button */}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-3 text-brand-primary font-semibold rounded-2xl bg-white border-2 border-brand-primary hover:bg-brand-primary hover:text-white transition-all disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Memuat...' : 'Muat Lebih Banyak'}
              </button>
            )}
          </>
        ) : (

          <div className="bg-white rounded-[20px] p-8 text-center border border-gray-100 mt-8">
            <PackagePlus className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-bold text-text-dark mb-2">Belum Ada Alat Baru</h3>
            <p className="text-sm text-text-gray mb-4">
              Klik tombol "Tambah" untuk mengajukan alat baru
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
