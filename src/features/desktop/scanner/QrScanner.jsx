import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { Camera, SwitchCamera, CheckCircle } from 'lucide-react';
import { useToast, usePageTitle } from '../../../hooks';
import InventarisApi from '../../../api/InventarisApi';

// Jeda sebelum QR yang sama boleh diproses lagi (mencegah toast beruntun saat kamera masih mengarah ke QR tak valid).
const INVALID_QR_COOLDOWN_MS = 2000;
// Jeda singkat agar pengguna sempat melihat pesan berhasil sebelum pindah halaman.
const NAVIGATE_DELAY_MS = 500;

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

export default function Scanner() {
  usePageTitle('QR Scanner');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const handleScanRef = useRef(() => { });
  const processingRef = useRef(false);
  const navigateTimerRef = useRef(null);

  const [currentCamera, setCurrentCamera] = useState('environment');
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState(null);
  // Naik setiap kali pengguna menekan "Coba Lagi" agar scanner dibuat ulang.
  const [attempt, setAttempt] = useState(0);

  // Satu instance scanner untuk seluruh masa pakai halaman ini (dibuat ulang hanya saat "Coba Lagi").
  // Ganti kamera memakai setCamera, bukan membuat scanner baru.
  useEffect(() => {
    if (!videoRef.current) return undefined;

    const instance = new QrScanner(
      videoRef.current,
      (result) => handleScanRef.current(result),
      {
        onDecodeError: () => { },
        maxScansPerSecond: 2,
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );
    scannerRef.current = instance;
    processingRef.current = false;

    instance
      .start()
      .then(() => {
        if (scannerRef.current === instance) setLoading(false);
      })
      .catch((err) => {
        // Instance sudah diganti/dihancurkan (mis. pindah halaman): abaikan.
        if (scannerRef.current !== instance) return;
        console.error('Kamera tidak dapat dibuka:', err);
        setError(getCameraErrorMessage(err));
        setLoading(false);
      });

    return () => {
      if (scannerRef.current === instance) scannerRef.current = null;
      clearTimeout(navigateTimerRef.current);
      instance.destroy();
    };
  }, [attempt]);

  const handleScan = async (result) => {
    // Hanya satu hasil diproses sekaligus; hasil lain diabaikan sampai pemrosesan selesai.
    if (processingRef.current || typeof result?.data !== 'string') return;

    const code = result.data.trim();
    if (!code) return;

    processingRef.current = true;

    try {
      // Validasi dulu ke server: QR harus milik inventaris yang ada sebelum pindah halaman.
      const res = await InventarisApi.getById(encodeURIComponent(code));
      const item = res?.data || res;
      const itemId = item?.id;

      if (itemId === undefined || itemId === null) {
        throw Object.assign(new Error('QR tidak dikenali'), { notFound: true });
      }

      showToast('QR Code valid', 'success');
      scannerRef.current?.stop();

      navigateTimerRef.current = setTimeout(() => {
        navigate(`/inventaris/detail/${itemId}`);
      }, NAVIGATE_DELAY_MS);
    } catch (err) {
      const notFound = err.notFound || err.response?.status === 404;
      if (!notFound) console.error('Gagal memvalidasi QR Code:', err);

      showToast(notFound ? 'QR Code tidak dikenali' : 'Gagal memvalidasi QR Code. Periksa koneksi lalu coba lagi.', 'error');

      // Scanner tetap hidup; setelah jeda singkat QR berikutnya boleh diproses.
      setTimeout(() => {
        processingRef.current = false;
      }, INVALID_QR_COOLDOWN_MS);
    }
  };

  useEffect(() => {
    handleScanRef.current = handleScan;
  });

  const toggleCamera = async () => {
    const active = scannerRef.current;
    if (!active || switching) return;

    const nextMode = currentCamera === 'environment' ? 'user' : 'environment';
    setSwitching(true);
    try {
      await active.setCamera(nextMode);
      setCurrentCamera(nextMode);
    } catch (err) {
      console.error('Gagal mengganti kamera:', err);
      showToast('Gagal mengganti kamera', 'error');
    } finally {
      setSwitching(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setCurrentCamera('environment');
    setAttempt((value) => value + 1);
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
                onClick={handleRetry}
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
                    Memindai...
                  </div>
                )}
              </div>

              {!loading && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={toggleCamera}
                    disabled={switching}
                    className="flex items-center gap-1.5 px-5 py-2 bg-bg-light hover:bg-gray-200 text-text-dark font-semibold rounded-lg transition-all shadow-sm text-sm disabled:opacity-60"
                  >
                    <SwitchCamera size={16} />
                    Ganti Kamera
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
