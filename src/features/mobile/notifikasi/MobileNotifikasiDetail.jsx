import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import NotificationApi from '../../../api/NotificationApi';

export default function MobileNotifikasiDetail() {
  usePageTitle('Detail Notifikasi');
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [notifikasi, setNotifikasi] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await NotificationApi.getAll({ page: 1, per_page: 100 });
        // API returns: response.data = { data: [...], meta: {...} }
        const notifications = response.data?.data || [];
        const notification = notifications.find(n => n.id == id);
        setNotifikasi(notification);

        // Auto mark as read if unread
        if (notification && !notification.is_read) {
          NotificationApi.markAsRead(id)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['notifications'] });
            })
            .catch(err => console.error('Failed to mark as read:', err));
        }
      } catch (error) {
        console.error('Failed to fetch notification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchNotification();
    }
  }, [id, queryClient]);

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
    return (
      <div className="p-4 text-center text-red-500">
        Notifikasi tidak ditemukan
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
