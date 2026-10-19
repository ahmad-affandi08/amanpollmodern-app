import React, { useState, useEffect } from 'react';
import { useActivities } from '../../../hooks/queries/useDashboardQueries';
import { Calendar, MapPin, Package } from 'lucide-react';
import { usePageTitle, usePagination } from '../../../hooks';
import Pagination from '../../../components/Pagination';
import StatusBadge from '../../../components/StatusBadge';
import { formatDateTime } from '../../../utils/format';
import { getActivityIcon, getActivityColor, getActivityLabel } from './activityMeta';

const ACTIVITY_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'aduan', label: 'Aduan' },
  { value: 'inventaris', label: 'Inventaris' },
  { value: 'pemeliharaan', label: 'Pemeliharaan' },
];

const ActivityCard = ({ activity }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-full ${getActivityColor(activity.type)}`}>
        {getActivityIcon(activity.type, 20)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-gray-900">{activity.title}</h3>
          <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
            <Calendar className="w-3 h-3" />
            {formatDateTime(activity.date)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1 font-medium">{activity.description}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {activity.meta && activity.meta !== '-' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <MapPin className="w-3 h-3" />
              {activity.meta}
            </span>
          )}
          {/* Aktivitas inventaris hanya bertanda "Baru" (sudah tertulis di judul), jadi tanpa badge status. */}
          {activity.status && activity.type !== 'inventaris' && (
            <StatusBadge status={activity.status} />
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
            {getActivityLabel(activity.type)}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const ActivitiesPage = () => {
  usePageTitle('Riwayat Aktivitas');
  const [filterType, setFilterType] = useState('all');
  const pagination = usePagination(10);

  // Hook sudah memakai placeholderData, jadi daftar lama bertahan saat pindah halaman/filter.
  const { data, isLoading, isFetching } = useActivities({
    type: filterType,
    page: pagination.currentPage,
    per_page: pagination.perPage
  });

  const activities = data?.data || [];

  const { setMetadata } = pagination;
  useEffect(() => {
    if (data) {
      setMetadata({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    }
  }, [data, setMetadata]);

  const handleFilterChange = (type) => {
    setFilterType(type);
    pagination.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Aktivitas</h1>
          <p className="text-gray-500 text-sm mt-1">Memantau semua aktivitas sistem terkini</p>
        </div>

        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          {ACTIVITY_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterType === value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 h-32 rounded-xl animate-pulse bg-gray-100"></div>
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-4 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          {activities.map((activity) => (
            <ActivityCard key={`${activity.type}-${activity.id}`} activity={activity} />
          ))}

          {activities.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada aktivitas ditemukan</p>
            </div>
          )}
        </div>
      )}

      <div className="pb-8">
        <Pagination
          size="sm"
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          totalData={data ? pagination.totalItems : undefined}
        />
      </div>
    </div>
  );
};

export default ActivitiesPage;
