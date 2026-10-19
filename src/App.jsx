import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import ToastProvider from './components/Alert/ToastProvider';
import LandingPage from './features/LandingPage';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';
import Dashboard from './features/desktop/dashboard/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute, { PublicOnlyRoute } from './routes/ProtectedRoute';
import { ACCESS } from './features/auth/constants';
import NotFound from './features/system/NotFound';
import RouteError from './features/system/RouteError';
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
import NotificationTemplatePage from './features/desktop/konfigurasi/NotificationTemplatePage';
import KeandalanAlatPage from './features/desktop/analisis/KeandalanAlatPage';
import KinerjaTeknisiPage from './features/desktop/analisis/KinerjaTeknisiPage';
import SebaranRuanganPage from './features/desktop/analisis/SebaranRuanganPage';
import BiayaPemeliharaanPage from './features/desktop/analisis/BiayaPemeliharaanPage';
import KepatuhanKalibrasiPage from './features/desktop/analisis/KepatuhanKalibrasiPage';
/** Halaman desktop: butuh login, dibatasi peran (jika ada), dan dibungkus layout dashboard. */
const desktopPage = (element, roles = []) => (
  <ProtectedRoute allowedRoles={roles}>
    <DashboardLayout>{element}</DashboardLayout>
  </ProtectedRoute>
);

/** Halaman di bawah /mobile: layout sudah membungkus, di sini hanya pembatas peran. */
const mobilePage = (element, roles = ACCESS.mobile) => (
  <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>
);

const guestOnly = (element) => <PublicOnlyRoute>{element}</PublicOnlyRoute>;

const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: guestOnly(<Login />) },
  { path: '/register', element: guestOnly(<Register />) },
  { path: '/forgot-password', element: guestOnly(<ForgotPassword />) },
  { path: '/maintenance', element: <MaintenancePage /> },
  { path: '/bypass/:token', element: <MaintenanceBypass /> },

  // Dibuka lewat tautan dari pimpinan (tanpa login), sengaja berada di luar ProtectedRoute.
  { path: '/mobile/aduan/:id/disposisi', element: <MobileDisposisiAduan /> },
  { path: '/mobile/pemeliharaan/:id/disposisi', element: <MobileDisposisiPemeliharaan /> },

  { path: '/dashboard', element: desktopPage(<Dashboard />, ACCESS.dashboard) },
  { path: '/profile', element: desktopPage(<Profile />) },
  { path: '/notifications', element: desktopPage(<NotificationCenter />) },
  { path: '/activities', element: desktopPage(<ActivitiesPage />) },

  { path: '/inventaris', element: <Navigate to="/inventaris/data" replace /> },
  { path: '/inventaris/kategori', element: desktopPage(<MasterKategori />, ACCESS.masterKategori) },
  { path: '/inventaris/nama-alat', element: desktopPage(<MasterNamaAlat />, ACCESS.masterNamaAlat) },
  { path: '/inventaris/data', element: desktopPage(<InventarisList />, ACCESS.inventarisView) },
  { path: '/inventaris/baru', element: desktopPage(<InventarisForm />, ACCESS.inventarisManage) },
  { path: '/inventaris/edit/:id', element: desktopPage(<InventarisForm />, ACCESS.inventarisManage) },
  { path: '/inventaris/detail/:id', element: desktopPage(<InventarisDetail />, ACCESS.inventarisView) },
  { path: '/alat-baru', element: desktopPage(<AlatBaruList />, ACCESS.alatBaru) },

  { path: '/aduan', element: desktopPage(<AduanList />, ACCESS.aduan) },
  { path: '/pemeliharaan', element: desktopPage(<PemeliharaanList />, ACCESS.pemeliharaan) },
  { path: '/scanner', element: desktopPage(<QrScanner />, ACCESS.scanner) },

  { path: '/report/aduan', element: desktopPage(<ReportAduan />, ACCESS.report) },
  { path: '/report/aduan/:id', element: desktopPage(<DetailReportAduan />, ACCESS.report) },
  { path: '/report/pemeliharaan', element: desktopPage(<ReportPemeliharaan />, ACCESS.report) },
  { path: '/report/pemeliharaan/:id', element: desktopPage(<DetailReportPemeliharaan />, ACCESS.report) },

  { path: '/anggaran/pengaturan', element: desktopPage(<PengaturanAnggaran />, ACCESS.anggaranPengaturan) },
  { path: '/anggaran/pemeliharaan', element: desktopPage(<AnggaranPemeliharaan />, ACCESS.anggaran) },
  { path: '/anggaran/pemeliharaan/:id', element: desktopPage(<DetailAnggaranPemeliharaan />, ACCESS.anggaran) },
  { path: '/anggaran/biaya-perbaikan', element: desktopPage(<BiayaPerbaikan />, ACCESS.anggaran) },

  { path: '/users', element: desktopPage(<MasterUser />, ACCESS.users) },
  { path: '/users/divisi', element: desktopPage(<MasterDivisi />, ACCESS.users) },
  { path: '/users/ruangan', element: desktopPage(<MasterRuangan />, ACCESS.users) },

  { path: '/konfigurasi/data', element: desktopPage(<KonfigurasiData />, ACCESS.konfigurasi) },
  { path: '/konfigurasi/integrasi', element: desktopPage(<KonfigurasiIntegrasi />, ACCESS.konfigurasi) },
  { path: '/konfigurasi/sistem', element: desktopPage(<KonfigurasiSistem />, ACCESS.konfigurasi) },
  { path: '/konfigurasi/template-notifikasi', element: desktopPage(<NotificationTemplatePage />, ACCESS.konfigurasi) },

  { path: '/analisis/keandalan', element: desktopPage(<KeandalanAlatPage />, ACCESS.analisis) },
  { path: '/analisis/kinerja', element: desktopPage(<KinerjaTeknisiPage />, ACCESS.analisis) },
  { path: '/analisis/ruangan', element: desktopPage(<SebaranRuanganPage />, ACCESS.analisis) },
  { path: '/analisis/biaya', element: desktopPage(<BiayaPemeliharaanPage />, ACCESS.analisis) },
  { path: '/analisis/kalibrasi', element: desktopPage(<KepatuhanKalibrasiPage />, ACCESS.analisis) },

  {
    path: '/mobile',
    element: (
      <ProtectedRoute allowedRoles={ACCESS.mobile}>
        <DashboardLayoutMobile />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/mobile/dashboard" replace /> },
      { path: 'dashboard', element: mobilePage(<MobileDashboard />) },
      { path: 'aduan', element: mobilePage(<MobileAduan />) },
      { path: 'aduan/:id', element: mobilePage(<MobileAduanFormTeknisi />, ACCESS.mobileTeknisi) },
      { path: 'riwayat-aduan', element: mobilePage(<MobileAduanHistory />) },
      { path: 'riwayat-aduan/:id', element: mobilePage(<MobileAduanDetail />) },
      { path: 'inventaris', element: mobilePage(<MobileInventaris />) },
      { path: 'inventaris/:id', element: mobilePage(<MobileInventarisDetail />) },
      { path: 'alat-baru', element: mobilePage(<MobileAlatBaru />, ACCESS.mobileUserRuangan) },
      { path: 'alat-baru/add', element: mobilePage(<MobileAddAlatBaru />, ACCESS.mobileUserRuangan) },
      { path: 'alat-baru/:id', element: mobilePage(<MobileAlatBaruDetail />, ACCESS.mobileUserRuangan) },
      { path: 'scan', element: mobilePage(<MobileScanner />) },
      { path: 'pemeliharaan', element: mobilePage(<MobilePemeliharaan />, ACCESS.mobileTeknisi) },
      { path: 'pemeliharaan/history', element: mobilePage(<MobilePemeliharaanHistory />, ACCESS.mobileTeknisi) },
      { path: 'pemeliharaan/:id', element: mobilePage(<MobilePemeliharaanDetail />, ACCESS.mobileTeknisi) },
      { path: 'pemeliharaan/:id/form', element: mobilePage(<MobileFormPemeliharaan />, ACCESS.mobileTeknisi) },
      { path: 'notifikasi', element: mobilePage(<MobileNotifikasi />) },
      { path: 'notifikasi/:id', element: mobilePage(<MobileNotifikasiDetail />) },
      { path: 'profile', element: mobilePage(<MobileProfile />) },
    ]
  },

  { path: '/superadmin', element: <Navigate to="/dashboard" replace /> },
  { path: '/userruangan', element: <Navigate to="/mobile/dashboard" replace /> },
  { path: '/teknisi', element: <Navigate to="/mobile/dashboard" replace /> },
  { path: '/admindivisi', element: <Navigate to="/dashboard" replace /> },
  { path: '/pimpinan', element: <Navigate to="/dashboard" replace /> },

  { path: '*', element: <NotFound /> },
];

const router = createBrowserRouter(
  [{ errorElement: <RouteError />, children: routes }],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
    basename: '/'
  }
);

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
