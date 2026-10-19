import { useState, useEffect } from 'react';
import { Bell, Trash2, Check, CheckCheck, Search, Info } from 'lucide-react';
import {
  usePagination,
  useDebounce,
  useToast,
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  usePageTitle,
} from '../../../hooks';
import Pagination from '../../../components/Pagination';
import ConfirmDialog from '../../../components/Alert/Alert';
import { parseDate } from '../../../utils/format';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'unread', label: 'Belum Dibaca' },
  { value: 'read', label: 'Sudah Dibaca' }
];

/** Waktu relatif ("5 menit yang lalu"); '-' bila tanggal kosong atau tidak valid. */
const formatRelativeTime = (value) => {
  const date = parseDate(value);
  if (!date) return '-';
  return formatDistanceToNow(date, { addSuffix: true, locale: idLocale });
};

const getErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;

const NotificationCenter = () => {
  usePageTitle('Pusat Notifikasi');
  const { showToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const pagination = usePagination(20);
  // { kind: 'single', id } atau { kind: 'all' }; null = dialog tertutup.
  const [confirmAction, setConfirmAction] = useState(null);

  const { data, isLoading } = useNotifications(pagination.currentPage, pagination.perPage);
  const notifications = data?.data || [];
  const meta = data?.meta;

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const deleteAllMutation = useDeleteAllNotifications();

  const { setMetadata } = pagination;
  useEffect(() => {
    if (meta) {
      setMetadata(meta);
    }
  }, [meta, setMetadata]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      showToast('Notifikasi ditandai sudah dibaca', 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'Gagal menandai notifikasi'), 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      showToast('Semua notifikasi ditandai sudah dibaca', 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'Gagal menandai semua notifikasi'), 'error');
    }
  };

  const handleConfirmDelete = async () => {
    const action = confirmAction;
    try {
      if (action?.kind === 'all') {
        await deleteAllMutation.mutateAsync();
        showToast('Semua notifikasi berhasil dihapus', 'success');
      } else if (action?.kind === 'single') {
        await deleteNotificationMutation.mutateAsync(action.id);
        showToast('Notifikasi berhasil dihapus', 'success');
      }
    } catch (error) {
      showToast(
        getErrorMessage(error, action?.kind === 'all' ? 'Gagal menghapus semua notifikasi' : 'Gagal menghapus notifikasi'),
        'error'
      );
    } finally {
      setConfirmAction(null);
    }
  };

  // API notifikasi hanya mendukung page dan per_page, jadi filter dan pencarian
  // dijalankan di sisi klien pada halaman yang sedang ditampilkan.
  const normalizedSearch = debouncedSearch.trim().toLowerCase();
  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !notif.is_read) ||
      (filter === 'read' && notif.is_read);

    const matchesSearch = !normalizedSearch ||
      notif.isi?.toLowerCase().includes(normalizedSearch);

    return matchesFilter && matchesSearch;
  });

  const isClientFiltering = filter !== 'all' || normalizedSearch !== '';

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
            onClick={() => setConfirmAction({ kind: 'all' })}
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
            {FILTER_OPTIONS.map(({ value, label }) => (
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

        {isClientFiltering && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            Filter dan pencarian hanya berlaku pada notifikasi di halaman ini. Pindah halaman untuk melihat notifikasi lainnya.
          </p>
        )}
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
            <p className="text-gray-600">
              {isClientFiltering && notifications.length > 0
                ? 'Tidak ada notifikasi yang cocok di halaman ini'
                : 'Tidak ada notifikasi'}
            </p>
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
                    {formatRelativeTime(notif.created_date || notif.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id_notifikasi)}
                      disabled={markAsReadMutation.isPending && markAsReadMutation.variables === notif.id_notifikasi}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Tandai sudah dibaca"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmAction({ kind: 'single', id: notif.id_notifikasi })}
                    disabled={deleteNotificationMutation.isPending && deleteNotificationMutation.variables === notif.id_notifikasi}
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
      <Pagination
        size="sm"
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
        totalData={pagination.totalItems}
      />

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.kind === 'all' ? 'Hapus Semua Notifikasi' : 'Hapus Notifikasi'}
        message={confirmAction?.kind === 'all'
          ? 'Semua notifikasi Anda akan dihapus permanen. Lanjutkan?'
          : 'Hapus notifikasi ini?'}
        type="danger"
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

export default NotificationCenter;
