import { useState } from 'react';
import { Bell, Trash2, Check, CheckCheck, Search, Info } from 'lucide-react';
import {
  useToast,
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  usePageTitle,
} from '../../../hooks';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import FilterBar from '../../../components/FilterBar';
import SegmentTabs from '../../../components/SegmentTabs';
import TablePagination from '../../../components/TablePagination';
import ConfirmDialog from '../../../components/Alert/Alert';
import { parseDate } from '../../../utils/format';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const FILTER_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'unread', label: 'Belum Dibaca' },
  { value: 'read', label: 'Sudah Dibaca' }
];

// API notifikasi hanya mendukung page dan per_page, jadi filter dan pencarian dijalankan TanStack
// di sisi klien pada halaman yang sedang ditampilkan (paginasi tetap dari server).
const COLUMNS = [
  {
    id: 'status',
    header: 'Status',
    filterFn: (row, _columnId, value) => (value === 'unread' ? !row.original.is_read : !!row.original.is_read),
  },
];
const matchSearch = (notif, text) => !!notif.isi?.toLowerCase().includes(text);

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
  // Mengubah filter/pencarian tidak memindahkan halaman: keduanya hanya menyaring halaman yang sedang tampil.
  const tableState = useTableState({ pageSize: 20, resetPageOnFilter: false });
  const { pageIndex, pageSize } = tableState.state.pagination;
  // { kind: 'single', id } atau { kind: 'all' }; null = dialog tertutup.
  const [confirmAction, setConfirmAction] = useState(null);

  const { data, isLoading } = useNotifications(pageIndex + 1, pageSize);
  const notifications = data?.data || [];
  const meta = data?.meta;

  const table = useDataTable({
    columns: COLUMNS,
    data: notifications,
    tableState,
    pageCount: meta?.last_page,
    rowCount: meta?.total,
    matchSearch,
    getRowId: (notif) => notif.id_notifikasi,
  });
  const f = getTableFilters(table);

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const deleteAllMutation = useDeleteAllNotifications();

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

  const status = f.get('status');
  const filteredNotifications = table.getRowModel().rows.map((row) => row.original);
  const isClientFiltering = status !== '' || f.search.trim() !== '';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Pusat Notifikasi</h1>
          <p className="text-text-gray text-xs mt-1">
            Kelola semua notifikasi Anda
          </p>
        </div>
        <div className="grid grid-cols-1 sm:flex gap-2 w-full md:w-auto">
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="gap-2 w-full md:w-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai Semua Dibaca
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmAction({ kind: 'all' })}
            disabled={deleteAllMutation.isPending}
            className="gap-2 w-full md:w-auto"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Semua
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          className="mb-0"
          search={
            <Input
              name="search"
              size="sm"
              placeholder="Cari notifikasi..."
              value={f.search}
              onChange={(e) => f.setSearch(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
              className="!bg-white"
            />
          }
          actions={
            <SegmentTabs
              ariaLabel="Status notifikasi"
              tabs={FILTER_OPTIONS}
              value={status}
              onChange={(value) => f.set('status', value)}
            />
          }
        />

        {isClientFiltering && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            Filter dan pencarian hanya berlaku pada notifikasi di halaman ini. Pindah halaman untuk melihat notifikasi lainnya.
          </p>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="divide-y divide-gray-100">
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
                className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''
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
                      className="p-2 bg-danger-500 text-white rounded-xl shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50"
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
        {data && (
          <div className="p-3 sm:p-4 border-t border-gray-100">
            <TablePagination table={table} />
          </div>
        )}
      </div>

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
