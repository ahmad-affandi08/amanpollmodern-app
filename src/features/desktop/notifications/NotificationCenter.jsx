import { useState } from 'react';
import { Bell, Trash2, Check, CheckCheck, Search } from 'lucide-react';
import { usePagination, useDebounce } from '../../../hooks';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  usePageTitle,
} from '../../../hooks';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const NotificationCenter = () => {
  usePageTitle('Pusat Notifikasi');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const pagination = usePagination(20);


  const { data, isLoading } = useNotifications(pagination.currentPage, pagination.perPage);
  const notifications = data?.data || [];
  const meta = data?.meta;

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const deleteAllMutation = useDeleteAllNotifications();


  if (meta && meta.current_page !== pagination.currentPage) {
    pagination.setMetadata(meta);
  }


  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };


  const handleDelete = (id) => {
    if (!confirm('Hapus notifikasi ini?')) return;
    deleteNotificationMutation.mutate(id);
  };


  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };


  const handleDeleteAll = () => {
    if (!confirm('Hapus semua notifikasi?')) return;
    deleteAllMutation.mutate();
  };


  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !notif.is_read) ||
      (filter === 'read' && notif.is_read);

    const matchesSearch = !debouncedSearch ||
      notif.isi?.toLowerCase().includes(debouncedSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pusat Notifikasi</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola semua notifikasi Anda
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white shadow-lg bg-brand-primary rounded-lg hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={deleteAllMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white shadow-lg bg-danger-500 rounded-lg hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Semua
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari notifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Semua' },
              { value: 'unread', label: 'Belum Dibaca' },
              { value: 'read', label: 'Sudah Dibaca' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === value
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Memuat notifikasi...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Tidak ada notifikasi</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id_notifikasi}
              className={`p-4 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!notif.is_read ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                  <Bell className={`w-5 h-5 ${!notif.is_read ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {notif.isi}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notif.created_date || notif.created_at), {
                      addSuffix: true,
                      locale: idLocale
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id_notifikasi)}
                      disabled={markAsReadMutation.isPending}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Tandai sudah dibaca"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id_notifikasi)}
                    disabled={deleteNotificationMutation.isPending}
                    className="p-3 bg-danger-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{((pagination.currentPage - 1) * pagination.perPage) + 1}</span> -
            <span className="font-medium">{Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)}</span> dari
            <span className="font-medium"> {pagination.totalItems}</span> notifikasi
          </p>

          <div className="flex gap-2">
            <button
              onClick={pagination.prevPage}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={pagination.nextPage}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
