import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { Camera, Flashlight, RefreshCw } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { ToastContext } from '../../../components/Alert/ToastProvider';
import { useAuthContext } from '../../../context/AuthContext';

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
        showToast('error', 'Gagal mengakses kamera. Pastikan izin diberikan.');
      });

      return () => {
        qrScanner.destroy();
      };
    }
  }, []);

  const handleScan = (result) => {
    if (result && result.data) {
      if (scanner) {
        scanner.stop();
      }
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      const scannedId = result.data;

      // Show success toast
      showToast('success', `✅ QR Scan Berhasil: ${scannedId}`);

      // Redirect after brief delay
      setTimeout(() => {
        // Check if user is User Ruangan (kategori_user_id === 2)
        if (user?.kategori_user_id === 2) {
          navigate('/mobile/aduan', {
            state: { scannedInventarisId: scannedId }
          });
        } else {
          navigate(`/mobile/inventaris/${scannedId}`);
        }
      }, 1000); // Show toast for 1 second before redirect
    }
  };

  const toggleFlash = () => {
    if (scanner) {
      scanner.toggleFlash().then(() => setIsFlashOn(!isFlashOn));
    }
  };

  const switchCamera = () => {
    if (scanner) {
      const newMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
      setCameraFacingMode(newMode);
      scanner.setCamera(newMode);
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
      `}</style>
    </div>
  );
}
