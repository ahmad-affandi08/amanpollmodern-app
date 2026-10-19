import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import NotificationApi from '../../../api/NotificationApi';
import { queryKeys } from '../../../lib/queryKeys';
import { usePageTitle, useMarkAsRead } from '../../../hooks';

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
      <div className="max-w-md mx-auto px-4 pb-4">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-100 rounded w-24"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
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
    <div className="max-w-md mx-auto px-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Detail Notifikasi</h1>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 mb-1">{notifikasi.sender_name}</h2>
            <p className="text-xs text-gray-500">{notifikasi.created_date_relative}</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{notifikasi.isi}</p>
        </div>
      </div>
    </div>
  );
}
