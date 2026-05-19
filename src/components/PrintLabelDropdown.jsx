import React, { useState, useRef, useEffect } from 'react';
import { Printer, ChevronDown, FileText, Tag, Package } from 'lucide-react';

const LABEL_OPTIONS = [
  { value: 'standar', label: 'Standar', size: '50×30mm', icon: Tag, color: 'bg-brand-primary' },
  { value: 'kecil', label: 'Kecil', size: '12×15mm', icon: FileText, color: 'bg-emerald-500' },
  { value: 'besar', label: 'Besar', size: '50×80mm', icon: Package, color: 'bg-amber-500' },
];

/**
 * PrintLabelDropdown — styled dropdown for selecting label size
 * @param {'button' | 'icon'} variant — 'button' for header, 'icon' for table row
 */
export default function PrintLabelDropdown({
  onSelect,
  isPrinting = false,
  variant = 'button',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setIsOpen(false);
    onSelect(value);
  };

  if (variant === 'icon') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !isPrinting && !disabled && setIsOpen(!isOpen)}
          disabled={isPrinting || disabled}
          className={`p-1.5 bg-cyan-500 text-white rounded-lg shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer ${isPrinting ? 'opacity-50 pointer-events-none' : ''}`}
          title="Print Label"
        >
          <Printer size={14} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="px-3 py-2 border-b border-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pilih Ukuran</p>
            </div>
            {LABEL_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-6 h-6 ${opt.color} rounded-md flex items-center justify-center flex-shrink-0`}>
                    <Icon size={12} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 group-hover:text-brand-primary transition-colors">{opt.label}</p>
                    <p className="text-[10px] text-gray-400">{opt.size}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // variant === 'button'
  return (
    <div className="relative w-full md:w-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !isPrinting && setIsOpen(!isOpen)}
        disabled={isPrinting}
        className={`flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all duration-300 cursor-pointer
          ${isPrinting
            ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
            : 'border-brand-primary text-brand-primary hover:bg-brand-primary/10'
          }`}
      >
        {isPrinting ? (
          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <Printer className="w-4 h-4" />
        )}
        <span>{isPrinting ? 'Menyiapkan...' : 'Print Semua Label'}</span>
        {!isPrinting && (
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && !isPrinting && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-brand-primary/5 to-transparent border-b border-gray-100">
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Pilih Ukuran Label</p>
          </div>

          {/* Options */}
          <div className="p-1.5">
            {LABEL_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-brand-primary/5 transition-all group"
                >
                  <div className={`w-8 h-8 ${opt.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 group-hover:text-brand-primary transition-colors">{opt.label}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{opt.size}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
