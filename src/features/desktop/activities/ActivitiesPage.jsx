import React from 'react';
import { useActivities } from '../../../hooks/queries/useDashboardQueries';
import { Calendar, MapPin, Package } from 'lucide-react';
import { usePageTitle } from '../../../hooks';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import FilterBar from '../../../components/FilterBar';
import SegmentTabs from '../../../components/SegmentTabs';
import TablePagination from '../../../components/TablePagination';
import StatusBadge from '../../../components/StatusBadge';
import { formatDateTime } from '../../../utils/format';
import { getActivityIcon, getActivityColor, getActivityLabel } from './activityMeta';

const ACTIVITY_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'aduan', label: 'Aduan' },
  { value: 'inventaris', label: 'Inventaris' },
  { value: 'pemeliharaan', label: 'Pemeliharaan' },
];

// Filter diatur lewat state TanStack. Peta: id filter -> parameter query server. Tipe awal 'all' (seperti sebelumnya).
const FILTER_MAP = { tipe: 'type' };
const INITIAL_FILTERS = [{ id: 'tipe', value: 'all' }];
// Daftar kartu: state halaman & filter dipegang instance TanStack, kartunya dirender dari baris tabel.
const NO_COLUMNS = [];

const ActivityCard = ({ activity }) => (
  <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-start gap-3 sm:gap-4">
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
  const tableState = useTableState({ pageSize: 10, filterMap: FILTER_MAP, initialFilters: INITIAL_FILTERS });
  const { params } = tableState;

  // Hook sudah memakai placeholderData, jadi daftar lama bertahan saat pindah halaman/filter.
  const { data, isLoading, isFetching } = useActivities({
    type: params.type,
    page: params.page,
    per_page: params.per_page,
  });

  const activities = data?.data || [];

  const table = useDataTable({
    columns: NO_COLUMNS,
    data: activities,
    tableState,
    pageCount: data?.last_page,
    rowCount: data?.total,
    getRowId: (activity) => `${activity.type}-${activity.id}`,
  });
  const f = getTableFilters(table);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-dark">Riwayat Aktivitas</h1>
        <p className="text-text-gray text-xs mt-1">Memantau semua aktivitas sistem terkini</p>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          className="mb-0"
          actions={
            <SegmentTabs
              ariaLabel="Tipe aktivitas"
              tabs={ACTIVITY_FILTERS}
              value={f.get('tipe')}
              onChange={(value) => f.set('tipe', value)}
            />
          }
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 h-32 rounded-xl animate-pulse bg-gray-100"></div>
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-4 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          {table.getRowModel().rows.map(({ original: activity, id }) => (
            <ActivityCard key={id} activity={activity} />
          ))}

          {activities.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada aktivitas ditemukan</p>
            </div>
          )}
        </div>
      )}

      {data && (
        <div className="pb-8">
          <TablePagination table={table} />
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;
