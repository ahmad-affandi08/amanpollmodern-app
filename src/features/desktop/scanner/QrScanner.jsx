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
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-dark flex items-center justify-center gap-2">
          <Camera size={28} />
          QR Code Scanner
        </h1>
        <p className="text-text-gray text-sm mt-2">
          Arahkan kamera ke QR Code inventaris untuk melihat detail
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera size={32} className="text-red-600" />
              </div>
              <h3 className="font-bold text-red-900 mb-2">Gagal Mengakses Kamera</h3>
              <p className="text-red-700 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!error && (
            <div className="relative">
              {/* Video Element - Always rendered */}
              <div className="relative w-full aspect-square max-h-[70vh] mx-auto">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-2xl"
                  autoPlay
                  playsInline
                  muted
                />

                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mb-4"></div>
                    <p className="text-gray-600 font-medium">Memuat kamera...</p>
                  </div>
                )}

                {/* Scanner Frame Overlay */}
                {!loading && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-brand-primary rounded-tl-2xl"></div>
                    <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-brand-primary rounded-tr-2xl"></div>
                    <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-brand-primary rounded-bl-2xl"></div>
                    <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-brand-primary rounded-br-2xl"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-dashed border-white/50 rounded-2xl"></div>
                    </div>
                  </div>
                )}

                {/* Scanning Indicator */}
                {!loading && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    Scanning...
                  </div>
                )}
              </div>

              {/* Controls */}
              {!loading && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={toggleCamera}
                    className="flex items-center gap-2 px-6 py-3 bg-bg-light hover:bg-gray-200 text-text-dark font-semibold rounded-xl transition-all shadow-sm"
                  >
                    <SwitchCamera size={20} />
                    Switch Camera
                  </button>
                </div>
              )}

              {/* Instructions */}
              {!loading && (
                <div className="mt-6 p-4 bg-bg-light rounded-xl">
                  <h3 className="font-bold text-text-dark mb-2 flex items-center gap-2">
                    <CheckCircle size={18} className="text-brand-primary" />
                    Cara Menggunakan:
                  </h3>
                  <ol className="text-sm text-text-gray space-y-1 list-decimal list-inside">
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
