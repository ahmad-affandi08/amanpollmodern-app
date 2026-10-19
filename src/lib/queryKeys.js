
export const queryKeys = {

  aduan: {
    all: ['aduan'],
    lists: () => [...queryKeys.aduan.all, 'list'],
    list: (filters) => [...queryKeys.aduan.lists(), filters],
    details: () => [...queryKeys.aduan.all, 'detail'],
    detail: (id) => [...queryKeys.aduan.details(), id],
  },


  inventaris: {
    all: ['inventaris'],
    lists: () => [...queryKeys.inventaris.all, 'list'],
    list: (filters) => [...queryKeys.inventaris.lists(), filters],
    details: () => [...queryKeys.inventaris.all, 'detail'],
    detail: (id) => [...queryKeys.inventaris.details(), id],
  },


  pemeliharaan: {
    all: ['pemeliharaan'],
    lists: () => [...queryKeys.pemeliharaan.all, 'list'],
    list: (filters) => [...queryKeys.pemeliharaan.lists(), filters],
    details: () => [...queryKeys.pemeliharaan.all, 'detail'],
    detail: (id) => [...queryKeys.pemeliharaan.details(), id],
  },


  notifications: {
    all: ['notifications'],
    unread: () => [...queryKeys.notifications.all, 'unread'],
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'],
    list: (page, perPage) => [...queryKeys.notifications.all, 'list', page, perPage],
  },


  master: {
    users: (filters) => ['master', 'users', filters],
    ruangan: (filters) => ['master', 'ruangan', filters],
    divisi: (filters) => ['master', 'divisi', filters],
    namaAlat: (filters) => ['master', 'namaAlat', filters],
    kategori: (filters) => ['master', 'kategori', filters],
  },


  pengaturan: {
    anggaran: (filters) => ['pengaturan', 'anggaran', filters],
    biaya: (filters) => ['pengaturan', 'biaya', filters],
  },

  dashboard: {
    all: ['dashboard'],
    stats: (filters) => [...queryKeys.dashboard.all, 'stats', filters],
  },


  reports: {
    all: ['reports'],
    aduan: (filters) => [...queryKeys.reports.all, 'aduan', filters],
    pemeliharaan: (filters) => [...queryKeys.reports.all, 'pemeliharaan', filters],
  },


  konfigurasi: {
    all: ['konfigurasi'],
    fonnte: () => [...queryKeys.konfigurasi.all, 'fonnte'],
  },
};
