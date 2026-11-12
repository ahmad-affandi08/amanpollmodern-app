import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const numberId = new Intl.NumberFormat('id-ID');

function NavButton({ onClick, disabled, label, className, children }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={className}>
      {children}
    </button>
  );
}

/**
 * Pagination (client-side maupun server-side).
 *
 * Responsif terhadap lebar kontainernya (container query), bukan lebar layar, karena sidebar
 * mengurangi ruang tabel:
 *   lebar  (≥ 36rem): info jumlah data di kiri, kontrol halaman di kanan
 *   sedang (≥ 28rem): kontrol halaman di bawah info, tombol angka ditampilkan
 *   sempit (< 28rem): kontrol ringkas «  ‹  1 / 108  ›  » dengan area sentuh 40px
 *
 * @param {number} currentPage   halaman aktif (mulai dari 1)
 * @param {number} totalPages    jumlah halaman
 * @param {function} onPageChange callback (nomor halaman baru)
 * @param {boolean} showFirstLast tombol halaman pertama/terakhir (default true)
 * @param {number} totalData     total data; bila ada, info jumlah data ditampilkan
 * @param {number} perPage       baris per halaman; bila ada, info menjadi "Menampilkan 1–10 dari 1.076 data"
 * @param {'sm'|'md'|'lg'} size
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  className = '',
  totalData,
  perPage,
  size = 'md'
}) {
  // Area sentuh 40px di kontainer sempit, mengecil di kontainer lebar.
  const sizeClasses = {
    sm: 'h-10 min-w-10 @md:h-8 @md:min-w-8 text-xs',
    md: 'h-10 min-w-10 @md:h-9 @md:min-w-9 text-sm',
    lg: 'h-11 min-w-11 @md:h-10 @md:min-w-10 text-base',
  };
  const iconSizes = { sm: 14, md: 16, lg: 18 };

  const hasTotal = totalData !== undefined && totalData !== null;

  if (totalPages <= 1 && !hasTotal) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const showPaginationButtons = totalPages > 1;
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const btn = `${sizeClasses[size]} inline-flex items-center justify-center rounded-lg border font-semibold transition-colors
    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40`;
  const btnIdle = 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-text-dark';
  const btnDisabled = 'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600';

  const navCls = `${btn} ${btnIdle} ${btnDisabled}`;

  // "Menampilkan 1–10 dari 1.076 data" bila perPage diketahui, selain itu "Total 1.076 data".
  let info = null;
  if (hasTotal) {
    if (totalData === 0) {
      info = <>Tidak ada data</>;
    } else if (perPage) {
      const from = (currentPage - 1) * perPage + 1;
      const to = Math.min(currentPage * perPage, totalData);
      info = (
        <>
          Menampilkan <b className="font-bold text-text-dark">{numberId.format(from)}–{numberId.format(to)}</b>{' '}
          dari <b className="font-bold text-text-dark">{numberId.format(totalData)}</b> data
        </>
      );
    } else {
      info = (
        <>
          Total <b className="font-bold text-text-dark">{numberId.format(totalData)}</b> data
        </>
      );
    }
  }

  return (
    <nav aria-label="Navigasi halaman" className={`@container w-full ${className}`}>
      <div className="flex flex-col items-center gap-3 @xl:flex-row @xl:justify-between">
        {info && <p className="text-xs text-text-gray font-medium text-center @xl:text-left">{info}</p>}

        {showPaginationButtons && (
          <div className="flex items-center gap-1.5">
            {showFirstLast && (
              <NavButton onClick={() => onPageChange(1)} disabled={isFirst} label="Halaman pertama" className={navCls}>
                <ChevronsLeft size={iconSizes[size]} />
              </NavButton>
            )}
            <NavButton onClick={() => onPageChange(currentPage - 1)} disabled={isFirst} label="Sebelumnya" className={navCls}>
              <ChevronLeft size={iconSizes[size]} />
            </NavButton>

            {/* Kontainer sempit: penunjuk ringkas */}
            <span
              className="@md:hidden px-3 text-sm font-semibold text-text-dark tabular-nums"
              aria-live="polite"
            >
              {numberId.format(currentPage)} <span className="text-text-gray font-medium">/ {numberId.format(totalPages)}</span>
            </span>

            {/* Kontainer sedang & lebar: tombol angka */}
            <div className="hidden @md:flex items-center gap-1.5">
              {getPageNumbers().map((page, index) =>
                page === '...' ? (
                  <span key={`gap-${index}`} className="px-1 text-text-gray select-none" aria-hidden="true">…</span>
                ) : (
                  <button
                    type="button"
                    key={page}
                    onClick={() => onPageChange(page)}
                    aria-label={`Halaman ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`${btn} px-2 tabular-nums ${currentPage === page
                      ? 'border-brand-primary bg-brand-primary text-white shadow-sm shadow-brand-primary/25'
                      : btnIdle}`}
                  >
                    {numberId.format(page)}
                  </button>
                )
              )}
            </div>

            <NavButton onClick={() => onPageChange(currentPage + 1)} disabled={isLast} label="Berikutnya" className={navCls}>
              <ChevronRight size={iconSizes[size]} />
            </NavButton>
            {showFirstLast && (
              <NavButton onClick={() => onPageChange(totalPages)} disabled={isLast} label="Halaman terakhir" className={navCls}>
                <ChevronsRight size={iconSizes[size]} />
              </NavButton>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
