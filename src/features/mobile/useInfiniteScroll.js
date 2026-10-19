import { useEffect, useRef } from 'react';

/**
 * Muat halaman berikutnya saat pengguna mendekati dasar halaman (window scroll).
 * Satu cara mengukur scroll untuk semua daftar mobile. Bila konten belum memenuhi
 * layar, halaman berikutnya dimuat otomatis sampai layar penuh atau data habis.
 */
export default function useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage, offset = 200 }) {
  const fetchRef = useRef(fetchNextPage);

  useEffect(() => {
    fetchRef.current = fetchNextPage;
  });

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return undefined;

    const loadIfNearBottom = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      if (window.innerHeight + window.scrollY >= scrollHeight - offset) {
        fetchRef.current?.();
      }
    };

    window.addEventListener('scroll', loadIfNearBottom, { passive: true });
    loadIfNearBottom();

    return () => window.removeEventListener('scroll', loadIfNearBottom);
  }, [hasNextPage, isFetchingNextPage, offset]);
}
