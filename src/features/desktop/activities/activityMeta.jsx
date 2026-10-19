import React from 'react';
import { AlertCircle, Wrench, Package, Activity } from 'lucide-react';

/**
 * Ikon dan warna tipe aktivitas (aduan, pemeliharaan, inventaris).
 * Dipakai bersama oleh Dashboard dan Riwayat Aktivitas supaya tampilannya sama.
 * Warna status (Selesai, Pending, dst.) tetap berasal dari utils/status lewat StatusBadge.
 */
const ACTIVITY_TYPES = {
  aduan: { label: 'Aduan', Icon: AlertCircle, tone: 'bg-red-100 text-red-600' },
  pemeliharaan: { label: 'Pemeliharaan', Icon: Wrench, tone: 'bg-blue-100 text-blue-600' },
  inventaris: { label: 'Inventaris', Icon: Package, tone: 'bg-purple-100 text-purple-600' },
};

const FALLBACK_TYPE = { label: 'Aktivitas', Icon: Activity, tone: 'bg-gray-100 text-gray-600' };

const getActivityType = (type) => ACTIVITY_TYPES[type] || FALLBACK_TYPE;

export const getActivityIcon = (type, size = 14) => {
  const { Icon } = getActivityType(type);
  return <Icon size={size} />;
};

/** Kelas warna latar dan teks ikon. */
export const getActivityColor = (type) => getActivityType(type).tone;

export const getActivityLabel = (type) => getActivityType(type).label;
