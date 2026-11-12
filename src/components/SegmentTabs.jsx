import React from 'react';

/**
 * Tab segmen untuk filter pilihan tunggal (mis. status, tipe). Satu gaya untuk semua page.
 *
 * @param {Array<{ value: string, label: string }>} tabs
 * @param {string} value             nilai tab aktif
 * @param {(value: string) => void} onChange
 * @param {string} ariaLabel         nama kelompok tab untuk pembaca layar
 */
export default function SegmentTabs({ tabs, value, onChange, ariaLabel, className = '' }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={`flex gap-1.5 sm:gap-2 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value || 'semua'}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-[13px] sm:text-sm font-semibold whitespace-nowrap transition-all ${active
              ? 'bg-brand-primary text-white shadow-lg'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
