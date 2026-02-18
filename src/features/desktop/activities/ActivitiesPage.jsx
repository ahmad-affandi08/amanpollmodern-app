import React, { useState } from 'react';
import { useActivities } from '../../../hooks/queries/useDashboardQueries';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Wrench,
    AlertCircle,
    Package,
    Calendar,
    MapPin,
    Clock
} from 'lucide-react';
import { usePageTitle } from '../../../hooks';

const ActivityCard = ({ activity }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'aduan': return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'investaris': return <Package className="w-5 h-5 text-blue-500" />;
            case 'inventaris': return <Package className="w-5 h-5 text-blue-500" />;
            case 'pemeliharaan': return <Wrench className="w-5 h-5 text-orange-500" />;
            default: return <Package className="w-5 h-5 text-gray-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'aduan': return 'bg-red-50';
            case 'inventaris': return 'bg-blue-50';
            case 'pemeliharaan': return 'bg-orange-50';
            default: return 'bg-gray-50';
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${getBgColor(activity.type)}`}>
                    {getIcon(activity.type)}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(activity.date), 'dd MMM yyyy HH:mm', { locale: id })}
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
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${activity.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                            activity.status === 'Baru' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            <Clock className="w-3 h-3" />
                            {activity.status}
                        </span>
                        <span className="capitalize inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                            {activity.type}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivitiesPage = () => {
    usePageTitle('Riwayat Aktivitas');
    const [filterType, setFilterType] = useState('all');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useActivities({
        type: filterType,
        page: page,
        per_page: 10
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Riwayat Aktivitas</h1>
                    <p className="text-gray-500 text-sm mt-1">Memantau semua aktivitas sistem terkini</p>
                </div>

                <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    {['all', 'aduan', 'inventaris', 'pemeliharaan'].map((type) => (
                        <button
                            key={type}
                            onClick={() => { setFilterType(type); setPage(1); }}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterType === type
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {type === 'all' ? 'Semua' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="bg-white p-4 h-32 rounded-xl animate-pulse bg-gray-50"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {data?.data?.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                    ))}

                    {data?.data?.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Tidak ada aktivitas ditemukan</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {data && data.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-8 pb-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                        Sebelumnya
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600 flex items-center bg-white border border-gray-200 rounded-lg">
                        Halaman {page} dari {data.last_page}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= data.last_page || isLoading}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                        Selanjutnya
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivitiesPage;
