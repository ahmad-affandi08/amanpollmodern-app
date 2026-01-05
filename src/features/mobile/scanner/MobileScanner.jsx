import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { Camera, Flashlight, RefreshCw, AlertCircle, Eye, CheckCircle } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { ToastContext } from '../../../components/Alert/ToastProvider';
import { useAuthContext } from '../../../context/AuthContext';
import InventarisApi from '../../../api/InventarisApi';

export default function MobileScanner() {
  usePageTitle('Scan QR');
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const { user } = useAuthContext();
  const videoRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [showActionModal, setShowActionModal] = useState(false);
  const [scannedId, setScannedId] = useState(null);

  // Initialize Scanner
  useEffect(() => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => handleScan(result),
        {
          onDecodeError: (error) => {
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 2,
          preferredCamera: 'environment', // Default to back camera
        }
      );

      setScanner(qrScanner);

      qrScanner.start().then(() => {
        qrScanner.hasFlash().then((hasFlash) => {
          setHasFlash(hasFlash);
        });
      }).catch((err) => {
        console.error('Camera access denied:', err);
        showToast('Gagal mengakses kamera. Pastikan izin diberikan.', 'error');
        // setHasPermission(false); // Removed as it was undefined state
      });

      return () => {
        qrScanner.destroy();
      };
    }
  }, []);

  const handleScan = async (result) => {
    if (result && result.data) {
      // Pause scanner immediately to prevent multiple scans
      if (scanner) {
        // scanner.stop(); // Stop might be too aggressive if we want to resume fast, but safe.
        // QrScanner doesn't have pause() in all versions, stop() is fine.
        scanner.stop();
      }
      if (navigator.vibrate) {
        try {
          navigator.vibrate(200);
        } catch (e) {
          // Ignore vibration errors (likely due to lack of user interaction)
        }
      }

      const id = result.data;

      try {
        // Fetch item details to validate room
        const itemRes = await InventarisApi.getById(id);
        // Handle response structure (wrapped in data or direct)
        const item = itemRes.data || itemRes;

        // Validation for User Ruangan ONLY (Role ID 2)
        // Teknisi (3), Pimpinan (1), Admin Divisi (4), Super Admin (5) can scan all equipment
        if (user?.kategori_user_id == 2) {
          // Get item room ID (prefer direct ID, fallback to object id)
          const itemRuanganId = item.ruangan_id || item.ruangan?.id_ruangan;
          const userRuanganId = user.ruangan_id || user.ruangan?.id_ruangan;

          // If item has a room ID, enforce match
          if (itemRuanganId && String(itemRuanganId) !== String(userRuanganId)) {
            // Item usually has nested relation from API
            const itemRoomName = item.ruangan?.nama_ruangan || `ID ${itemRuanganId}`;
            // User object is flat based on debug screenshot (ruangan_nama)
            const userRoomName = user.ruangan_nama || user.ruangan?.nama_ruangan || `ID ${userRuanganId}`;

            showToast(`❌ Akses Ditolak: Alat di Ruang "${itemRoomName}", Anda di Ruang "${userRoomName}"`, 'error');

            setTimeout(() => {
              if (scanner) scanner.start();
            }, 1500);
            return;
          }
        }

        setScannedId(id);
        const itemName = item.nama_alat?.nama_nama_alat || item.nama_alat_id || id;
        showToast(`✅ QR Scan Berhasil: ${itemName}`, 'success');

        // Show action modal
        setTimeout(() => {
          setShowActionModal(true);
        }, 500);

      } catch (error) {
        console.error("Scan validation error:", error);

        let errorMsg = 'Gagal memvalidasi alat.';

        if (error.response) {
          // Server responded with error code
          if (error.response.status === 404) {
            errorMsg = `Alat dengan Kode '${id}' tidak ditemukan.`;
          } else {
            errorMsg += ` Server Error: ${error.response.status}`;
          }
        } else if (error.message) {
          errorMsg += ` ${error.message}`;
        }

        showToast(`❌ ${errorMsg}`, 'error');

        // Restart scanner
        setTimeout(() => {
          if (scanner) scanner.start();
        }, 1500);
      }
    }
  };

  const handleViewDetail = () => {
    navigate(`/mobile/inventaris/${scannedId}`);
  };

  const handleCreateAduan = () => {
    navigate('/mobile/aduan', {
      state: { scannedInventarisId: scannedId }
    });
  };

  const handleCloseModal = () => {
    setShowActionModal(false);
    // Restart scanner
    if (scanner) {
      scanner.start();
    }
  };

  const toggleFlash = () => {
    if (scanner) {
      scanner.toggleFlash().then(() => setIsFlashOn(!isFlashOn));
    }
  };

  const switchCamera = async () => {
    if (scanner) {
      try {
        // Stop and destroy current scanner
        await scanner.stop();
        scanner.destroy();

        // Toggle camera mode
        const newMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
        setCameraFacingMode(newMode);

        // Create new scanner with new camera
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => handleScan(result),
          {
            onDecodeError: (error) => { },
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 2,
            preferredCamera: newMode,
          }
        );

        setScanner(qrScanner);

        // Start new scanner
        await qrScanner.start();

        // Check flash availability
        const hasFlash = await qrScanner.hasFlash();
        setHasFlash(hasFlash);
        setIsFlashOn(false);
      } catch (err) {
        console.error('Failed to switch camera:', err);
        showToast('Gagal mengganti kamera', 'error');
      }
    }
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
                <p className="text-white/90 text-sm font-medium">No. Inventaris: {scannedId}</p>
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

              {/* Create Aduan Button */}
              <button
                onClick={handleCreateAduan}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <AlertCircle size={20} />
                </div>
                <span>Laporkan Kerusakan</span>
              </button>

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
