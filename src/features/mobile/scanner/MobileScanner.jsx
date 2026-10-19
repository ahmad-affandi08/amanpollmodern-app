import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { Flashlight, RefreshCw, AlertCircle, Eye, CheckCircle, CameraOff } from 'lucide-react';
import { useAuth, useToast, usePageTitle } from '../../../hooks';
import { ROLES, isRole } from '../../auth/constants';
import InventarisApi from '../../../api/InventarisApi';

// Kategori alat yang terlihat dari ruangan mana pun
// (sama dengan InventarisRepository::getAllPaginated di backend).
const KATEGORI_ALAT_UMUM = 23;

/**
 * Aturan lihat alat untuk User Ruangan, disamakan dengan filter daftar inventaris backend:
 * alat di ruangan pengguna, atau kategori umum (23). Alat yang sedang dipindah ke ruangan
 * pengguna (ruang_sekarang) juga diizinkan. Pengguna tanpa ruangan tidak dibatasi.
 */
const canUserRuanganViewItem = (user, item) => {
  if (!user?.ruangan_id) return true;
  if (Number(item.nama_alat?.kategori_alat_id) === KATEGORI_ALAT_UMUM) return true;

  const userRuangan = String(user.ruangan_id);
  return [item.ruangan_id, item.ruang_sekarang_id].some(
    (ruanganId) => ruanganId != null && String(ruanganId) === userRuangan
  );
};

const getCameraErrorMessage = (err) => {
  const text = `${err?.name || ''} ${err?.message || err || ''}`;
  if (/NotAllowed|Permission|denied/i.test(text)) {
    return 'Izin kamera ditolak. Aktifkan izin kamera untuk situs ini di pengaturan browser, lalu coba lagi.';
  }
  if (/not found|NotFound|Camera not found/i.test(text)) {
    return 'Kamera tidak ditemukan pada perangkat ini.';
  }
  return 'Kamera tidak dapat dibuka. Pastikan tidak sedang dipakai aplikasi lain, lalu coba lagi.';
};

export default function MobileScanner() {
  usePageTitle('Scan QR');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isUserRuangan = isRole(user, ROLES.USER_RUANGAN);

  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const handleScanRef = useRef(() => { });
  const processingRef = useRef(false);

  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  // Kamera dibuat ulang setiap `camera` berubah (ganti kamera / coba lagi).
  const [camera, setCamera] = useState({ mode: 'environment', attempt: 0 });
  const [cameraError, setCameraError] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [scanned, setScanned] = useState(null);

  // Satu instance per `camera`; cleanup selalu menghancurkan instance yang dibuat efek ini
  // (termasuk setelah ganti kamera), sehingga kamera tidak bocor.
  useEffect(() => {
    if (!videoRef.current) return undefined;

    const instance = new QrScanner(
      videoRef.current,
      (result) => handleScanRef.current(result),
      {
        onDecodeError: () => { },
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 2,
        preferredCamera: camera.mode,
      }
    );
    scannerRef.current = instance;

    instance
      .start()
      .then(() => instance.hasFlash())
      .then((flash) => {
        if (scannerRef.current !== instance) return;
        setCameraError(null);
        setHasFlash(flash);
        setIsFlashOn(false);
      })
      .catch((err) => {
        // Instance sudah diganti/dihancurkan (mis. pindah halaman): abaikan.
        if (scannerRef.current !== instance) return;
        console.error('Kamera tidak dapat dibuka:', err);
        setHasFlash(false);
        setCameraError(getCameraErrorMessage(err));
      });

    return () => {
      if (scannerRef.current === instance) scannerRef.current = null;
      instance.destroy();
    };
  }, [camera]);

  // Lanjutkan pemindaian setelah hasil diproses / modal ditutup.
  const resumeScanning = () => {
    processingRef.current = false;
    const active = scannerRef.current;
    if (!active) return;
    active.start().catch((err) => {
      if (scannerRef.current !== active) return;
      setCameraError(getCameraErrorMessage(err));
    });
  };

  const handleScan = async (result) => {
    // Hanya proses hasil pertama; hasil berikutnya diabaikan sampai pemindaian dilanjutkan.
    if (processingRef.current || !result?.data) return;
    processingRef.current = true;
    scannerRef.current?.stop();

    if (navigator.vibrate) {
      try {
        navigator.vibrate(200);
      } catch {
        // Getar tidak didukung perangkat: abaikan.
      }
    }

    const code = String(result.data).trim();

    try {
      const itemRes = await InventarisApi.getById(code);
      const item = itemRes.data || itemRes;

      if (isUserRuangan && !canUserRuanganViewItem(user, item)) {
        const itemRoomName = item.ruangan?.nama_ruangan || 'ruangan lain';
        const userRoomName = user.ruangan_nama || `ID ${user.ruangan_id}`;
        showToast(
          `Akses ditolak: alat berada di ruangan "${itemRoomName}", Anda di ruangan "${userRoomName}"`,
          'error'
        );
        setTimeout(resumeScanning, 1500);
        return;
      }

      const itemName = item.nama_alat?.nama_nama_alat || item.no_inventaris || code;
      setScanned({ id: item.id ?? code, noInventaris: item.no_inventaris || code });
      showToast(`Scan berhasil: ${itemName}`, 'success');
      setShowActionModal(true);
    } catch (error) {
      console.error('Scan validation error:', error);

      let errorMsg = 'Gagal memvalidasi alat.';
      if (error.response) {
        errorMsg = error.response.status === 404
          ? `Alat dengan kode '${code}' tidak ditemukan.`
          : `${errorMsg} Kesalahan server: ${error.response.status}`;
      } else if (error.message) {
        errorMsg += ` ${error.message}`;
      }

      showToast(errorMsg, 'error');
      setTimeout(resumeScanning, 1500);
    }
  };

  useEffect(() => {
    handleScanRef.current = handleScan;
  });

  const handleViewDetail = () => {
    navigate(`/mobile/inventaris/${scanned.id}`);
  };

  const handleCreateAduan = () => {
    navigate('/mobile/aduan', {
      state: { scannedInventarisId: scanned.id }
    });
  };

  const handleCloseModal = () => {
    setShowActionModal(false);
    resumeScanning();
  };

  const handleRetryCamera = () => {
    processingRef.current = false;
    setCamera((prev) => ({ ...prev, attempt: prev.attempt + 1 }));
  };

  const toggleFlash = async () => {
    const active = scannerRef.current;
    if (!active) return;
    try {
      await active.toggleFlash();
      setIsFlashOn(active.isFlashOn());
    } catch {
      showToast('Lampu kilat tidak dapat dinyalakan', 'error');
    }
  };

  const switchCamera = () => {
    processingRef.current = false;
    setCamera((prev) => ({
      mode: prev.mode === 'environment' ? 'user' : 'environment',
      attempt: prev.attempt + 1,
    }));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 h-[calc(100vh-160px)] flex flex-col">
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 h-full flex flex-col relative overflow-hidden">

        {/* Header inside card */}
        <div className="flex justify-between items-center mb-4 z-10 relative">
          <div>
            <h2 className="text-lg font-bold text-text-dark">Scan QR Code</h2>
            <p className="text-xs text-gray-500">Scan QR Code pada alat</p>
          </div>
        </div>

        {/* Camera View Container */}
        <div className="flex-1 relative rounded-[20px] overflow-hidden bg-black isolation-isolate w-full shadow-inner">
          <video
            ref={videoRef}
            className="w-full h-full object-cover absolute inset-0"
            playsInline
          />

          {/* Pesan izin kamera / kamera tidak tersedia */}
          {cameraError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-gray-900 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <CameraOff size={28} className="text-white/80" />
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={handleRetryCamera}
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Floating Controls */}
          {/* Flash - Top Right */}
          <button
            onClick={toggleFlash}
            disabled={!hasFlash}
            className={`absolute top-4 right-4 z-30 p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${isFlashOn
              ? 'bg-yellow-400 text-white shadow-yellow-400/50'
              : 'bg-white/20 text-white hover:bg-white/30'
              } ${!hasFlash ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <Flashlight size={20} />
          </button>

          {/* Switch Camera - Bottom Right */}
          <button
            onClick={switchCamera}
            className="absolute bottom-4 right-4 z-30 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all shadow-lg active:scale-95 active:rotate-180"
          >
            <RefreshCw size={20} />
          </button>

          {/* Overlay Graphics */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-56 h-56 border-2 border-white/40 rounded-3xl overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-primary rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-primary rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-primary rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-primary rounded-br-xl"></div>

              {/* Scanning Animation */}
              <div className="absolute inset-x-0 w-full h-[2px] bg-brand-primary shadow-[0_0_15px_var(--color-brand-primary)] animate-scan-line"></div>
            </div>
          </div>

          <div className="absolute bottom-6 inset-x-0 text-center z-10">
            <p className="text-white/90 text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full inline-block backdrop-blur-sm shadow-sm">
              Arahkan kamera ke QR Code
            </p>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-slide-up">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Scan Berhasil!</h3>
                <p className="text-white/90 text-sm font-medium">No. Inventaris: {scanned?.noInventaris}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 space-y-3">
              <p className="text-center text-gray-600 text-sm font-medium mb-4">
                Pilih tindakan yang ingin dilakukan:
              </p>

              {/* View Detail Button */}
              <button
                onClick={handleViewDetail}
                className="w-full bg-gradient-to-r from-brand-primary to-brand-primary-light text-white p-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/40 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <Eye size={20} />
                </div>
                <span>Lihat Detail Alat</span>
              </button>

              {/* Laporkan kerusakan: hanya User Ruangan (Teknisi tidak membuat aduan di mobile) */}
              {isUserRuangan && (
                <button
                  onClick={handleCreateAduan}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                    <AlertCircle size={20} />
                  </div>
                  <span>Laporkan Kerusakan</span>
                </button>
              )}

              {/* Cancel Button */}
              <button
                onClick={handleCloseModal}
                className="w-full bg-gray-100 text-gray-700 p-3 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                Scan Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2.5s linear infinite;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
