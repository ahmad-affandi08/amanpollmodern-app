import React from 'react';

/**
 * Kartu angka ringkas (dashboard dan halaman ringkasan). Bila `onClick` diberikan kartu menjadi
 * tombol (mis. untuk menyaring tabel); `active` menandai kartu yang sedang dipilih.
 */
export default function StatCard({ icon, title, value, subValue, bgColor, iconColor, cardBgColor, onClick, active = false }) {
  const interactive = onClick
    ? { role: 'button', tabIndex: 0, onClick, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } }
    : {};

  return (
    <div
      {...interactive}
      className={`${cardBgColor || 'bg-gradient-to-br from-white via-white to-gray-50/30'} rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 backdrop-blur-sm ${onClick ? 'cursor-pointer' : ''} ${active ? 'ring-2 ring-brand-primary' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`${bgColor} ${iconColor} p-2.5 rounded-xl shadow-inner border border-white/60`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[#92929D] text-xs font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-[#11142D] tracking-tight">{value}</h4>
        {subValue && (
          <p className="text-[10px] text-gray-400 mt-1 font-mono tracking-wide">{subValue}</p>
        )}
      </div>
    </div>
  );
}
