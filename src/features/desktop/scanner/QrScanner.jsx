import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { Camera, SwitchCamera, CheckCircle } from 'lucide-react';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';

export default function Scanner() {
  usePageTitle('QR Scanner');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  const [currentCamera, setCurrentCamera] = useState('environment');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoRef.current) {
        setError('Video element tidak ditemukan');
        setLoading(false);
        return;
      }

      let qrScanner = null;

      try {
        qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (typeof result?.data === 'string') {
              showToast('QR Code Valid!', 'success');

              if (qrScanner) {
                qrScanner.stop();
              }

              setTimeout(() => {
                navigate(`/inventaris/detail/${result.data}`);
              }, 500);
            }
          },
          {
            maxScansPerSecond: 1,
            preferredCamera: currentCamera,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        scannerRef.current = qrScanner;

        qrScanner.start()
          .then(() => {
            setLoading(false);
          })
          .catch((err) => {
            console.error('Scanner start error:', err);
            setError('Gagal memulai kamera: ' + err.message);
            setLoading(false);
          });

      } catch (err) {
        console.error('Scanner init error:', err);
        setError(err.message || 'Gagal menginisialisasi scanner');
        setLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
          scannerRef.current.destroy();
        } catch (e) {
          console.error('Cleanup error:', e);
        }
      }
    };
  }, [currentCamera, navigate, showToast]);

  const toggleCamera = async () => {
    if (scannerRef.current) {
      try {
        setLoading(true);

        await scannerRef.current.stop();
        scannerRef.current.destroy();

        const newMode = currentCamera === 'environment' ? 'user' : 'environment';
        setCurrentCamera(newMode);

        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (typeof result?.data === 'string') {
              showToast('QR Code Valid!', 'success');

              if (qrScanner) {
                qrScanner.stop();
              }

              setTimeout(() => {
                navigate(`/inventaris/detail/${result.data}`);
              }, 500);
            }
          },
          {
            maxScansPerSecond: 1,
            preferredCamera: newMode,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        scannerRef.current = qrScanner;

        await qrScanner.start();
        setLoading(false);
      } catch (err) {
        console.error('Failed to switch camera:', err);
        setError('Gagal mengganti kamera: ' + err.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center">
        <h1 className="text-lg font-bold text-text-dark flex items-center justify-center gap-2">
          <Camera size={22} />
          QR Code Scanner
        </h1>
        <p className="text-text-gray text-xs mt-1">
          Arahkan kamera ke QR Code inventaris untuk melihat detail
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera size={24} className="text-red-600" />
              </div>
              <h3 className="font-bold text-red-900 mb-1.5 text-sm">Gagal Mengakses Kamera</h3>
              <p className="text-red-700 text-xs mb-3">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!error && (
            <div className="relative">
              <div className="relative w-full aspect-square max-h-[70vh] mx-auto">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-xl"
                  autoPlay
                  playsInline
                  muted
                />

                {loading && (
                  <div className="absolute inset-0 bg-white rounded-xl flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-primary mb-3"></div>
                    <p className="text-gray-600 font-medium text-sm">Memuat kamera...</p>
                  </div>
                )}

                {!loading && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-brand-primary rounded-tl-xl"></div>
                    <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-brand-primary rounded-tr-xl"></div>
                    <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-brand-primary rounded-bl-xl"></div>
                    <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-brand-primary rounded-br-xl"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-56 h-56 border-2 border-dashed border-white/50 rounded-xl"></div>
                    </div>
                  </div>
                )}

                {!loading && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    Scanning...
                  </div>
                )}
              </div>

              {!loading && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={toggleCamera}
                    className="flex items-center gap-1.5 px-5 py-2 bg-bg-light hover:bg-gray-200 text-text-dark font-semibold rounded-lg transition-all shadow-sm text-sm"
                  >
                    <SwitchCamera size={16} />
                    Switch Camera
                  </button>
                </div>
              )}

              {!loading && (
                <div className="mt-4 p-3 bg-bg-light rounded-lg">
                  <h3 className="font-bold text-text-dark mb-1.5 flex items-center gap-1.5 text-xs">
                    <CheckCircle size={14} className="text-brand-primary" />
                    Cara Menggunakan:
                  </h3>
                  <ol className="text-xs text-text-gray space-y-0.5 list-decimal list-inside">
                    <li>Izinkan akses kamera saat diminta</li>
                    <li>Arahkan kamera ke QR Code pada label inventaris</li>
                    <li>Tunggu hingga QR Code terdeteksi</li>
                    <li>Anda akan diarahkan ke halaman detail inventaris</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
