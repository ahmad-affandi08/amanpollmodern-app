import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import ToastProvider from './components/Alert/ToastProvider';
import LandingPage from './features/LandingPage';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';
import Dashboard from './features/desktop/dashboard/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import { ROLES } from './features/auth/constants';
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
import ActivitiesPage from './features/desktop/activities/ActivitiesPage';
import DashboardLayoutMobile from './layouts/DashboardLayoutMobile';
import MobileDashboard from './features/mobile/dashboard/MobileDashboard';
import MobileAduan from './features/mobile/aduan/MobileAduan';
import MobileInventaris from './features/mobile/inventaris/MobileInventaris';
import MobileInventarisDetail from './features/mobile/inventaris/MobileInventarisDetail';
import MobileProfile from './features/mobile/profile/MobileProfile';
import MobileScanner from './features/mobile/scanner/MobileScanner';
import MobileAduanFormTeknisi from './features/mobile/aduan/MobileAduanFormTeknisi';
import MobilePemeliharaan from './features/mobile/pemeliharaan/MobilePemeliharaan';
import MobilePemeliharaanDetail from './features/mobile/pemeliharaan/MobilePemeliharaanDetail';
import MobilePemeliharaanHistory from './features/mobile/pemeliharaan/MobilePemeliharaanHistory';
import MobileFormPemeliharaan from './features/mobile/pemeliharaan/MobileFormPemeliharaan';
import MobileNotifikasi from './features/mobile/notifikasi/MobileNotifikasi';
import MobileNotifikasiDetail from './features/mobile/notifikasi/MobileNotifikasiDetail';
import MobileAduanHistory from './features/mobile/aduan/MobileAduanHistory';
import MobileAduanDetail from './features/mobile/aduan/MobileAduanDetail';
import MobileDisposisiAduan from './features/mobile/aduan/MobileDisposisiAduan';
import MobileDisposisiPemeliharaan from './features/mobile/pemeliharaan/MobileDisposisiPemeliharaan';
import MobileAlatBaru from './features/mobile/alat-baru/MobileAlatBaru';
import MobileAddAlatBaru from './features/mobile/alat-baru/MobileAddAlatBaru';
import MobileAlatBaruDetail from './features/mobile/alat-baru/MobileAlatBaruDetail';
import AlatBaruList from './features/desktop/alat-baru/AlatBaruList';
import KonfigurasiIntegrasi from './features/desktop/konfigurasi/KonfigurasiIntegrasi';
import KonfigurasiData from './features/desktop/konfigurasi/KonfigurasiData';
import KonfigurasiSistem from './features/desktop/konfigurasi/KonfigurasiSistem';
import Profile from './features/desktop/profile/Profile';
import MaintenancePage from './features/system/MaintenancePage';
import MaintenanceBypass from './features/system/MaintenanceBypass';

const router = createBrowserRouter(
  [
    { path: '/', element: <LandingPage /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/maintenance', element: <MaintenancePage /> },
    { path: '/bypass/:token', element: <MaintenanceBypass /> },


    { path: '/mobile/aduan/:id/disposisi', element: <MobileDisposisiAduan /> },
    { path: '/mobile/pemeliharaan/:id/disposisi', element: <MobileDisposisiPemeliharaan /> },


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
    {
      path: '/profile',
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },

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


    {
      path: '/aduan',
      element: <ProtectedRoute><DashboardLayout><AduanList /></DashboardLayout></ProtectedRoute>
    },


    {
      path: '/pemeliharaan',
      element: <ProtectedRoute><DashboardLayout><PemeliharaanList /></DashboardLayout></ProtectedRoute>
    },


    {
      path: '/scanner',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.TEKNISI, ROLES.PIMPINAN]}><DashboardLayout><QrScanner /></DashboardLayout></ProtectedRoute>
    },


    {
      path: '/report/aduan',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN]}><DashboardLayout><ReportAduan /></DashboardLayout></ProtectedRoute>
    },


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


    {
      path: '/anggaran/pengaturan',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><PengaturanAnggaran /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/anggaran/pemeliharaan',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN]}><DashboardLayout><AnggaranPemeliharaan /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/anggaran/pemeliharaan/:id',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN]}><DashboardLayout><DetailAnggaranPemeliharaan /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/anggaran/biaya-perbaikan',
      element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN]}><DashboardLayout><BiayaPerbaikan /></DashboardLayout></ProtectedRoute>
    },

    {
      path: '/notifications',
      element: <ProtectedRoute><DashboardLayout><NotificationCenter /></DashboardLayout></ProtectedRoute>
    },
    {
      path: '/activities',
      element: <ProtectedRoute><DashboardLayout><ActivitiesPage /></DashboardLayout></ProtectedRoute>
    },

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


    {
      path: '/scanner',
      element: <ProtectedRoute><DashboardLayout><div className="bg-white rounded-2xl p-8 shadow-sm"><h1 className="text-2xl font-bold mb-4">Scanner QR Code</h1></div></DashboardLayout></ProtectedRoute>
    },


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
        { path: 'aduan/:id', element: <MobileAduanFormTeknisi /> },
        { path: 'riwayat-aduan', element: <MobileAduanHistory /> },
        { path: 'riwayat-aduan/:id', element: <MobileAduanDetail /> },
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


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
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
