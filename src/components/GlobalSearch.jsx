import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText } from 'lucide-react';
import ReactDOM from 'react-dom';

export default function GlobalSearch({ menuItems = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Flatten menu items for search
  const searchablePages = useMemo(() => {
    const pages = [];
    const traverse = (items, parentLabel = '') => {
      items.forEach(item => {
        const currentLabel = parentLabel ? `${parentLabel} > ${item.label}` : item.label;
        if (item.path) {
          pages.push({ 
            label: item.label, 
            fullLabel: currentLabel, 
            path: item.path, 
            icon: item.icon || FileText 
          });
        }
        if (item.children) {
          traverse(item.children, item.label);
        }
      });
    };
    traverse(menuItems);
    return pages;
  }, [menuItems]);

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return searchablePages;
    return searchablePages.filter(page => 
      page.fullLabel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, searchablePages]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSearchQuery('');
      setSelectedIndex(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle arrow keys navigation inside the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleModalKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredPages.length - 1 ? prev + 1 : prev));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredPages[selectedIndex]) {
          handleSelect(filteredPages[selectedIndex].path);
        }
      }
    };
    window.addEventListener('keydown', handleModalKeyDown);
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [isOpen, filteredPages, selectedIndex]);

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="hidden md:flex items-center justify-between bg-white px-3 py-2 rounded-xl shadow-sm w-64 border border-gray-100 hover:border-brand-primary/30 transition-all group"
      >
        <div className="flex items-center text-gray-400 text-sm group-hover:text-brand-primary transition-colors">
          <Search size={16} className="mr-2" />
          <span className="font-medium text-xs">Cari Halaman...</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md font-medium">
          <span>{isMac ? '⌘' : 'Ctrl'}</span><span>K</span>
        </div>
      </button>

      {/* Modal Portal */}
      {isOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[10vh] px-4 font-[Plus_Jakarta_Sans]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-gray-100">
              <Search size={20} className="text-brand-primary mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari menu atau halaman..."
                className="flex-1 bg-transparent border-none outline-none text-base font-medium text-text-dark placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {filteredPages.length > 0 ? (
                <div className="space-y-1">
                  {filteredPages.map((page, index) => {
                    const Icon = page.icon;
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={page.path}
                        onClick={() => handleSelect(page.path)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                          isSelected ? 'bg-brand-primary/5 text-brand-primary' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-primary/10' : 'bg-gray-100'}`}>
                          <Icon size={18} className={isSelected ? 'text-brand-primary' : 'text-gray-500'} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{page.label}</span>
                          <span className="text-[10px] opacity-60 font-medium">{page.fullLabel}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <Search size={24} className="opacity-50" />
                  </div>
                  <p className="font-bold text-gray-600">Tidak ada halaman ditemukan</p>
                  <p className="text-xs mt-1">Coba kata kunci lain</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-200">↑↓</kbd> Navigasi</span>
                <span className="flex items-center gap-1"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-200">Enter</kbd> Pilih</span>
              </div>
              <span className="flex items-center gap-1"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-200">ESC</kbd> Tutup</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
