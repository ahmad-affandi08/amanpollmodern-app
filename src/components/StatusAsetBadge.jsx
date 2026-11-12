import React from 'react';
import { STATUS_ASET_STYLE } from '../utils/statusAset';

/** Badge status aset: Aktif / Digudangkan / Dihapus. */
export default function StatusAsetBadge({ status, size = 'md' }) {
  const style = STATUS_ASET_STYLE[status] || STATUS_ASET_STYLE.Aktif;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${style} ${sizeClass}`}>
      {status || 'Aktif'}
    </span>
  );
}
