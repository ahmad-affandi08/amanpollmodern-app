// Query Keys - Centralized query key management
export const queryKeys = {
  // Aduan
  aduan: {
    all: ['aduan'],
    lists: () => [...queryKeys.aduan.all, 'list'],
    list: (filters) => [...queryKeys.aduan.lists(), filters],
    details: () => [...queryKeys.aduan.all, 'detail'],
    detail: (id) => [...queryKeys.aduan.details(), id],
  },

  // Inventaris
  inventaris: {
    all: ['inventaris'],
    lists: () => [...queryKeys.inventaris.all, 'list'],
    list: (filters) => [...queryKeys.inventaris.lists(), filters],
    details: () => [...queryKeys.inventaris.all, 'detail'],
    detail: (id) => [...queryKeys.inventaris.details(), id],
  },

  // Pemeliharaan
  pemeliharaan: {
    all: ['pemeliharaan'],
    lists: () => [...queryKeys.pemeliharaan.all, 'list'],
    list: (filters) => [...queryKeys.pemeliharaan.lists(), filters],
    details: () => [...queryKeys.pemeliharaan.all, 'detail'],
    detail: (id) => [...queryKeys.pemeliharaan.details(), id],
  },

  // Notifications
  notifications: {
    all: ['notifications'],
    unread: () => [...queryKeys.notifications.all, 'unread'],
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'],
    list: (page) => [...queryKeys.notifications.all, 'list', page],
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'],
    stats: () => [...queryKeys.dashboard.all, 'stats'],
  },

  // Master Data
  master: {
    users: (filters) => ['master', 'users', filters],
    ruangan: (filters) => ['master', 'ruangan', filters],
    divisi: (filters) => ['master', 'divisi', filters],
    namaAlat: (filters) => ['master', 'namaAlat', filters],
    kategori: (filters) => ['master', 'kategori', filters],
  },

  // Reports
  reports: {
    aduan: (filters) => ['reports', 'aduan', filters],
    pemeliharaan: (filters) => ['reports', 'pemeliharaan', filters],
  },

  // Pengaturan
  pengaturan: {
    anggaran: (filters) => ['pengaturan', 'anggaran', filters],
    biaya: (filters) => ['pengaturan', 'biaya', filters],
  },
  // Dashboard
  dashboard: {
    all: ['dashboard'],
    stats: (filters) => [...queryKeys.dashboard.all, 'stats', filters],
  },

  // Reports
  reports: {
    all: ['reports'],
    aduan: (filters) => [...queryKeys.reports.all, 'aduan', filters],
    pemeliharaan: (filters) => [...queryKeys.reports.all, 'pemeliharaan', filters],
  },

  // Konfigurasi
  konfigurasi: {
    all: ['konfigurasi'],
    fonnte: () => [...queryKeys.konfigurasi.all, 'fonnte'],
  },
};
