import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  useUnreadNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../hooks';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // React Query hooks
  const { data: notifications = [], isLoading } = useUnreadNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle mark as read
  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    if (!id) {
      console.error('Invalid notification ID');
      return;
    }
    markAsReadMutation.mutate(id);
  };

  // Handle delete
  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!id) {
      console.error('Invalid notification ID');
      return;
    }
    if (confirm('Hapus notifikasi ini?')) {
      deleteNotificationMutation.mutate(id);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 shadow-sm bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed sm:absolute right-4 sm:right-0 mt-2 w-[calc(100vw-2rem)] max-w-md sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifikasi</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tandai Semua Dibaca
              </button>
              <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-600 rounded-full">
                {unreadCount}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Memuat...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Tidak ada notifikasi baru</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''
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
                    <div className="flex items-center gap-1">
                      {!notif.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          disabled={markAsReadMutation.isPending}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                          title="Tandai sudah dibaca"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(notif.id, e)}
                        disabled={deleteNotificationMutation.isPending}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
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

          {/* Footer - Always show */}
          <div className="p-3 border-t border-gray-200">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2"
            >
              Lihat Semua Notifikasi
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
