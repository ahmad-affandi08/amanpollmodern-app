import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

/**
 * KondisiBadge — Unified condition badge for device/equipment status.
 * Used across InventarisList, PemeliharaanList, Report pages, and Mobile views.
 *
 * @param {'Baik' | 'Rusak Ringan' | 'Rusak Berat'} kondisi
 * @param {'sm' | 'md' | 'lg'} size
 */
const KONDISI_CONFIG = {
  'Baik': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: ShieldCheck,
  },
  'Rusak Ringan': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: AlertTriangle,
  },
  'Rusak Berat': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: XCircle,
  },
};

const FALLBACK_CONFIG = {
  bg: 'bg-gray-50',
  text: 'text-gray-600',
  border: 'border-gray-200',
  icon: HelpCircle,
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-1.5 w-full justify-center',
};

const ICON_SIZES = { sm: 10, md: 12, lg: 14 };

export default function KondisiBadge({ kondisi, size = 'md' }) {
  const config = KONDISI_CONFIG[kondisi] || FALLBACK_CONFIG;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${SIZE_CLASSES[size] || SIZE_CLASSES.md}`}
    >
      <Icon size={ICON_SIZES[size] || 12} />
      {kondisi || 'Belum Ditentukan'}
    </span>
  );
}
