import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import NotificationApi from '../../../api/NotificationApi';
import { queryKeys } from '../../../lib/queryKeys';
import { usePageTitle, useMarkAsRead } from '../../../hooks';
import DetailSection from '../../../components/detail/DetailSection';
import DetailSkeleton from '../../../components/detail/DetailSkeleton';

export default function MobileNotifikasiDetail() {
  usePageTitle('Detail Notifikasi');
  const { id } = useParams();
  const navigate = useNavigate();
  const markAsRead = useMarkAsRead();
  const markedRef = useRef(null);

  // Memakai endpoint detail GET /mobile/notifikasi/{id} (bukan mengambil 100 notifikasi lalu mencari).
  const { data: notifikasi, isLoading, error } = useQuery({
    queryKey: [...queryKeys.notifications.all, 'detail', id],
    queryFn: async () => {
      const res = await NotificationApi.getById(id);
      return res.data?.data ?? res.data;
    },
    enabled: !!id,
    retry: (failureCount, err) => err?.response?.status !== 404 && failureCount < 2,
  });

  // Tandai sudah dibaca satu kali per notifikasi yang dibuka.
  const { mutate: markRead } = markAsRead;
  useEffect(() => {
    if (notifikasi && !notifikasi.is_read && markedRef.current !== id) {
      markedRef.current = id;
      markRead(id);
    }
  }, [notifikasi, id, markRead]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4 pb-4">
        <DetailSkeleton />
      </div>
    );
  }

  if (!notifikasi) {
    const notFound = error?.response?.status === 404 || !error;
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">
          {notFound ? 'Notifikasi tidak ditemukan' : 'Gagal memuat notifikasi'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/mobile/notifikasi')}
          className="text-brand-primary font-bold"
        >
          Kembali ke daftar notifikasi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-4 space-y-4">
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-text-dark"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold text-text-dark">Detail Notifikasi</h1>
      </div>

      <DetailSection>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 shrink-0 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
            <Bell size={22} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-dark truncate">{notifikasi.sender_name}</h2>
            <p className="text-xs text-[#808191]">{notifikasi.created_date_relative}</p>
          </div>
        </div>
        <p className="text-sm text-text-dark whitespace-pre-wrap break-words">{notifikasi.isi}</p>
      </DetailSection>
    </div>
  );
}
