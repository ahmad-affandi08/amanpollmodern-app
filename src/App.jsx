import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import ToastProvider from './components/Alert/ToastProvider';
import LandingPage from './features/LandingPage';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/desktop/dashboard/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import { ROLES } from './features/auth/constants';

// Pages
import MasterKategori from './features/desktop/inventaris/MasterKategori';
import MasterNamaAlat from './features/desktop/inventaris/MasterNamaAlat';
import InventarisList from './features/desktop/inventaris/InventarisList';
import InventarisForm from './features/desktop/inventaris/InventarisForm';
import InventarisDetail from './features/desktop/inventaris/InventarisDetail';
import MasterDivisi from './features/desktop/master-data/divisi/MasterDivisi';
import MasterRuangan from './features/desktop/master-data/ruangan/MasterRuangan';
import MasterUser from './features/desktop/master-data/user/MasterUser';
import AduanList from './features/desktop/aduan/AduanList';
import PemeliharaanList from './features/desktop/pemeliharaan/PemeliharaanList';
import QrScanner from './features/desktop/scanner/QrScanner';
import ReportAduan from './features/desktop/report/ReportAduan';
import DetailReportAduan from './features/desktop/report/DetailReportAduan';
import ReportPemeliharaan from './features/desktop/report/ReportPemeliharaan';
import DetailReportPemeliharaan from './features/desktop/report/DetailReportPemeliharaan';
import PengaturanAnggaran from './features/desktop/pengaturan/PengaturanAnggaran';
import AnggaranPemeliharaan from './features/desktop/pengaturan/AnggaranPemeliharaan';
import DetailAnggaranPemeliharaan from './features/desktop/pengaturan/DetailAnggaranPemeliharaan';
import BiayaPerbaikan from './features/desktop/pengaturan/BiayaPerbaikan';
import NotificationCenter from './features/desktop/notifications/NotificationCenter';

// Mobile
import DashboardLayoutMobile from './layouts/DashboardLayoutMobile';
import MobileDashboard from './features/mobile/dashboard/MobileDashboard';
import MobileAduan from './features/mobile/aduan/MobileAduan';
import MobileInventaris from './features/mobile/inventaris/MobileInventaris';
import MobileInventarisDetail from './features/mobile/inventaris/MobileInventarisDetail';
import MobileProfile from './features/mobile/profile/MobileProfile';
import MobileScanner from './features/mobile/scanner/MobileScanner';
import MobileAduanDetailTeknisi from './features/mobile/aduan/MobileAduanDetailTeknisi';
import MobilePemeliharaan from './features/mobile/pemeliharaan/MobilePemeliharaan';
import MobilePemeliharaanDetail from './features/mobile/pemeliharaan/MobilePemeliharaanDetail';
import MobilePemeliharaanHistory from './features/mobile/pemeliharaan/MobilePemeliharaanHistory';
import MobileFormPemeliharaan from './features/mobile/pemeliharaan/MobileFormPemeliharaan';
import MobileNotifikasi from './features/mobile/notifikasi/MobileNotifikasi';
import MobileNotifikasiDetail from './features/mobile/notifikasi/MobileNotifikasiDetail';
import MobileAduanHistory from './features/mobile/aduan/MobileAduanHistory';
import MobileAduanDetailUser from './features/mobile/aduan/MobileAduanDetailUser';
import MobileDisposisiAduan from './features/mobile/aduan/MobileDisposisiAduan';
import MobileDisposisiPemeliharaan from './features/mobile/pemeliharaan/MobileDisposisiPemeliharaan';
import MobileAlatBaru from './features/mobile/alat-baru/MobileAlatBaru';
import MobileAddAlatBaru from './features/mobile/alat-baru/MobileAddAlatBaru';
import MobileAlatBaruDetail from './features/mobile/alat-baru/MobileAlatBaruDetail';
import AlatBaruList from './features/desktop/alat-baru/AlatBaruList';
import KonfigurasiIntegrasi from './features/desktop/konfigurasi/KonfigurasiIntegrasi';
import KonfigurasiData from './features/desktop/konfigurasi/KonfigurasiData';
import KonfigurasiSistem from './features/desktop/konfigurasi/KonfigurasiSistem';
import MaintenancePage from './features/system/MaintenancePage';
import MaintenanceBypass from './features/system/MaintenanceBypass';

const router = createBrowserRouter(
  [
    // ... existing routes ...
    // Public routes
    { path: '/', element: <LandingPage /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/maintenance', element: <MaintenancePage /> },
    { path: '/bypass/:token', element: <MaintenanceBypass /> },

    // Public Disposisi routes - accessible from WhatsApp notifications
    { path: '/mobile/aduan/:id/disposisi', element: <MobileDisposisiAduan /> },
    { path: '/mobile/pemeliharaan/:id/disposisi', element: <MobileDisposisiPemeliharaan /> },

    // Protected routes with Dashboard Layout
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    // Inventaris Routes
    {
      path: '/inventaris',
      element: <Navigate to="/inventaris/data" replace />
    },
    {
      path: '/inventaris/kategori',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI]}><DashboardLayout><MasterKategori /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/inventaris/nama-alat',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI]}><DashboardLayout><MasterNamaAlat /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/inventaris/data',
      element: <ProtectedRoute><DashboardLayout><InventarisList /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/inventaris/baru',
      element: <ProtectedRoute><DashboardLayout><InventarisForm /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/inventaris/edit/:id',
      element: <ProtectedRoute><DashboardLayout><InventarisForm /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/inventaris/detail/:id',
      element: <ProtectedRoute><DashboardLayout><InventarisDetail /></DashboardLayout></ProtectedRoute>
    },

    // Aduan Routes
    {
      path: '/aduan',
      element: <ProtectedRoute><DashboardLayout><AduanList /></DashboardLayout></ProtectedRoute>
    },

    // Pemeliharaan Routes
    {
      path: '/pemeliharaan',
      element: <ProtectedRoute><DashboardLayout><PemeliharaanList /></DashboardLayout></ProtectedRoute>
    },

    // Scanner Route
    {
      path: '/scanner',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.TEKNISI, ROLES.PIMPINAN]}><DashboardLayout><QrScanner /></DashboardLayout></ProtectedRoute>
    },

    // Report Routes
    {
      path: '/report/aduan',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN]}><DashboardLayout><ReportAduan /></DashboardLayout></ProtectedRoute>
    },

    // Alat Baru Routes (Desktop)
    {
      path: '/alat-baru',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI]}><DashboardLayout><AlatBaruList /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/report/aduan/:id',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN]}><DashboardLayout><DetailReportAduan /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/report/pemeliharaan',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN]}><DashboardLayout><ReportPemeliharaan /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/report/pemeliharaan/:id',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN]}><DashboardLayout><DetailReportPemeliharaan /></DashboardLayout></ProtectedRoute>
    },

    // Anggaran Routes
    {
      path: '/anggaran/pengaturan',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><PengaturanAnggaran /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/anggaran/pemeliharaan',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI]}><DashboardLayout><AnggaranPemeliharaan /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/anggaran/pemeliharaan/:id',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI]}><DashboardLayout><DetailAnggaranPemeliharaan /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/anggaran/biaya-perbaikan',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI]}><DashboardLayout><BiayaPerbaikan /></DashboardLayout></ProtectedRoute>
    },
    // Notifications
    {
      path: '/notifications',
      element: <ProtectedRoute><DashboardLayout><NotificationCenter /></DashboardLayout></ProtectedRoute>
    },
    // User Management Routes
    {
      path: '/users',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><MasterUser /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/users/divisi',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><MasterDivisi /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/users/ruangan',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><MasterRuangan /></DashboardLayout></ProtectedRoute>
    },

    // Konfigurasi Routes
    {
      path: '/konfigurasi/data',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><KonfigurasiData /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/konfigurasi/integrasi',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><KonfigurasiIntegrasi /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/konfigurasi/sistem',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><KonfigurasiSistem /></DashboardLayout></ProtectedRoute>
    },

    // Scanner
    {
      path: '/scanner',
      element: <ProtectedRoute><DashboardLayout><div className="bg-white rounded-2xl p-8 shadow-sm"><h1 className="text-2xl font-bold mb-4">Scanner QR Code</h1></div></DashboardLayout></ProtectedRoute>
    },

    // Mobile Routes (User Ruangan & Teknisi)
    {
      path: '/mobile',
      element: (
        <ProtectedRoute allowedRoles={[ROLES.TEKNISI, ROLES.USER_RUANGAN]}>
          <DashboardLayoutMobile />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/mobile/dashboard" replace /> },
        { path: 'dashboard', element: <MobileDashboard /> },
        { path: 'aduan', element: <MobileAduan /> },
        { path: 'aduan/:id', element: <MobileAduanDetailTeknisi /> },
        { path: 'riwayat-aduan', element: <MobileAduanHistory /> },
        { path: 'riwayat-aduan/:id', element: <MobileAduanDetailUser /> },
        { path: 'inventaris', element: <MobileInventaris /> },
        { path: 'inventaris/:id', element: <MobileInventarisDetail /> },
        { path: 'alat-baru', element: <MobileAlatBaru /> },
        { path: 'alat-baru/add', element: <MobileAddAlatBaru /> },
        { path: 'alat-baru/:id', element: <MobileAlatBaruDetail /> },
        { path: 'scan', element: <MobileScanner /> },
        { path: 'pemeliharaan', element: <MobilePemeliharaan /> },
        { path: 'pemeliharaan/history', element: <MobilePemeliharaanHistory /> },
        { path: 'pemeliharaan/:id', element: <MobilePemeliharaanDetail /> },
        { path: 'pemeliharaan/:id/form', element: <MobileFormPemeliharaan /> },
        { path: 'notifikasi', element: <MobileNotifikasi /> },
        { path: 'notifikasi/:id', element: <MobileNotifikasiDetail /> },
        { path: 'profile', element: <MobileProfile /> },
      ]
    },

    // Legacy routes - redirect to appropriate dashboard
    { path: '/superadmin', element: <Navigate to="/dashboard" replace /> },
    { path: '/userruangan', element: <Navigate to="/mobile/dashboard" replace /> },
    { path: '/teknisi', element: <Navigate to="/mobile/dashboard" replace /> },
    { path: '/admindivisi', element: <Navigate to="/dashboard" replace /> },
    { path: '/pimpinan', element: <Navigate to="/dashboard" replace /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
    basename: '/'
  }
);

// Create QueryClient with optimal configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;