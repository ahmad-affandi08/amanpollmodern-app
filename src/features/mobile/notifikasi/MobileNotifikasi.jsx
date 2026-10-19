import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import NotificationApi from '../../../api/NotificationApi';
import { queryKeys } from '../../../lib/queryKeys';
import {
  usePageTitle,
  useToast,
  useUnreadCount,
  useMarkAllAsRead,
  useDeleteAllNotifications,
} from '../../../hooks';
import ConfirmDialog from '../../../components/Alert/Alert';
import useInfiniteScroll from '../useInfiniteScroll';

const PER_PAGE = 20;

export default function MobileNotifikasi() {
  usePageTitle('Notifikasi');
  const navigate = useNavigate();
  const [showMarkAllDialog, setShowMarkAllDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const { showToast } = useToast();

  // Daftar langsung dari cache react-query (berawalan 'notifications'), sehingga tandai-dibaca
  // dan hapus otomatis memperbarui daftar tanpa menyalin data ke state lokal.
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [...queryKeys.notifications.all, 'infinite', PER_PAGE],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await NotificationApi.getAll({ page: pageParam, per_page: PER_PAGE });
      return {
        data: Array.isArray(res.data?.data) ? res.data.data : [],
        meta: res.data?.meta,
      };
    },
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta || {};
      return current_page && last_page && current_page < last_page ? current_page + 1 : undefined;
    },
  });

  const { data: unreadCount } = useUnreadCount();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteAllMutation = useDeleteAllNotifications();

  useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  const notifikasiList = data?.pages.flatMap(page => page.data) || [];
  const total = data?.pages[data.pages.length - 1]?.meta?.total ?? notifikasiList.length;

  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      showToast('Semua notifikasi ditandai sudah dibaca', 'success');
      setShowMarkAllDialog(false);
    } catch {
      showToast('Gagal menandai notifikasi', 'error');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllMutation.mutateAsync();
      showToast('Semua notifikasi berhasil dihapus', 'success');
      setShowDeleteAllDialog(false);
    } catch {
      showToast('Gagal menghapus notifikasi', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-4">
      {/* Header */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifikasi</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
            </p>
          </div>

          {/* Action Buttons */}
          {notifikasiList.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowMarkAllDialog(true)}
                disabled={markAllAsReadMutation.isPending || !unreadCount}
                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Tandai semua sudah dibaca"
              >
                <CheckCheck size={20} />
              </button>
              <button
                onClick={() => setShowDeleteAllDialog(true)}
                disabled={deleteAllMutation.isPending}
                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Hapus semua"
              >
                <Trash2 size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isError ? (
          <div className="text-center py-12">
            <BellOff className="mx-auto text-red-500 mb-2" size={48} />
            <p className="text-danger-600 mb-3">Gagal memuat notifikasi</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
            >
              Coba Lagi
            </button>
          </div>
        ) : isLoading ? (

          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-20"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))
        ) : notifikasiList.length === 0 ? (

          <div className="text-center py-16">
            <Bell className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-sm font-medium">Tidak ada notifikasi</p>
            <p className="text-gray-400 text-xs mt-1">Notifikasi baru akan muncul di sini</p>
          </div>
        ) : (
          notifikasiList.map((item) => (
            <button
              key={item.id_notifikasi}
              onClick={() => navigate(`/mobile/notifikasi/${item.id_notifikasi}`)}
              className={`w-full text-left rounded-2xl border shadow-sm transition-all hover:shadow-md active:scale-[0.98] relative overflow-hidden ${!item.is_read
                ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200'
                : 'bg-white border-gray-200 opacity-75'
                }`}
            >
              {/* Unread Indicator */}
              {!item.is_read && (
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>
              )}

              <div className="p-4 pl-5">
                {/* Header with Avatar */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!item.is_read
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                    : 'bg-gray-300'
                    }`}>
                    <Bell className="text-white" size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-sm truncate ${!item.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'
                        }`}>
                        {item.sender_name}
                      </h3>
                      {!item.is_read && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">
                          BARU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{item.created_date_relative}</p>
                  </div>
                </div>

                {/* Message Preview */}
                <p className={`text-sm line-clamp-3 break-words leading-relaxed ${!item.is_read ? 'text-gray-800 font-medium' : 'text-gray-500'
                  }`}>
                  {item.isi_preview}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Loading More Indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-6">
          <div className="flex items-center gap-2 text-brand-primary">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {/* End of List */}
      {!isLoading && !isError && !hasNextPage && notifikasiList.length > 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">Semua notifikasi telah ditampilkan ({total} total)</p>
        </div>
      )}

      {/* Mark All Read Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showMarkAllDialog}
        onCancel={() => setShowMarkAllDialog(false)}
        onConfirm={handleMarkAllRead}
        title="Tandai Semua Sudah Dibaca"
        message="Apakah Anda yakin ingin menandai semua notifikasi sebagai sudah dibaca?"
        confirmText="Ya, Tandai Semua"
        cancelText="Batal"
        type="info"
      />

      {/* Delete All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAllDialog}
        onCancel={() => setShowDeleteAllDialog(false)}
        onConfirm={handleDeleteAll}
        title="Hapus Semua Notifikasi"
        message="Apakah Anda yakin ingin menghapus semua notifikasi? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}
