import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, RefreshCw } from 'lucide-react';

const CameraCapture = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Initialize Camera
  const startCamera = useCallback(async (deviceId = null) => {
    setLoading(true);
    setError('');

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'environment' } // Prefer back camera on mobile
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      setLoading(false);
    } catch (err) {
      console.error("Camera access error:", err);
      setError('Gagal mengakses kamera. Pastikan izin kamera diaktifkan.');
      setLoading(false);
    }
  }, [stream]);

  // 2. Get Available Devices (for switching)
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal transition doesn't glitch stream init
      const timer = setTimeout(() => {
        startCamera();

        // Enumerate devices
        navigator.mediaDevices.enumerateDevices()
          .then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
          })
          .catch(console.error);
      }, 300);

      return () => clearTimeout(timer);
    }

    return () => {
      // Cleanup: stop stream when closed
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cleanup on unmount/close
  useEffect(() => {
    if (!isOpen && stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCapturedImage(null);
    }
  }, [isOpen, stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      // Flip horizontal if not using back camera (selfie mode logic generally) - simplified here:
      // If we added scaling flip in CSS, we might need to handle it in canvas too, but for environment cam usually standard
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageUrl = canvas.toDataURL('image/jpeg', 0.85); // 85% quality
      setCapturedImage(imageUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      // Convert DataURL to File
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        });
    }
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      // Find current device index
      const currentIndex = devices.findIndex(d => d.deviceId === activeDeviceId);

      // If undefined/null, assume first device was active, so go to second (index 1)
      // If we have current index, go to next
      const nextIndex = currentIndex === -1 ? 1 : (currentIndex + 1) % devices.length;

      const nextDevice = devices[nextIndex];

      if (nextDevice) {
        setActiveDeviceId(nextDevice.deviceId);
        startCamera(nextDevice.deviceId);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 bg-white">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Camera className="text-brand-primary" size={24} />
            Ambil Foto
          </h3>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 text-white/50 animate-pulse">
              <Camera size={48} className="opacity-50" />
              <span className="text-sm font-medium">Menghubungkan Kamera...</span>
            </div>
          )}

          {error && (
            <div className="absolute z-20 text-red-400 px-6 py-4 bg-red-500/10 backdrop-blur rounded-xl border border-red-500/20 text-center max-w-xs">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Live Video */}
          {!capturedImage && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${devices.length > 1 && !activeDeviceId ? 'scale-x-[-1]' : ''}`}
            />
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Grid Overlay */}
          {!capturedImage && !loading && !error && (
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-white"></div>
                <div className="border-r border-white"></div>
                <div></div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="relative p-8 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between gap-8 h-32 md:h-auto">
          {!capturedImage ? (
            <>
              {/* Switch Camera */}
              <div className="w-12 h-12 flex items-center justify-center">
                {devices.length > 1 && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
                    title="Ganti Kamera"
                  >
                    <RefreshCw size={24} />
                  </button>
                )}
              </div>

              {/* Capture Button (Pro Shutter Look) */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={loading || !!error}
                className="group relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-200"
              >
                <div className="w-[90%] h-[90%] bg-white rounded-full group-active:scale-90 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
              </button>

              <div className="w-12 h-12" /> {/* Spacer */}
            </>
          ) : (
            <div className="flex w-full items-center justify-center gap-12">
              <button
                type="button"
                onClick={handleRetake}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="p-4 rounded-full bg-white/10 text-white group-hover:bg-white/20 transition-all group-active:scale-95"
                >
                  <RotateCcw size={24} />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors tracking-wide">Ulangi</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="p-4 rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/30 group-hover:bg-brand-primary-dark transition-all group-active:scale-95">
                  <Check size={28} />
                </div>
                <span className="text-xs font-medium text-brand-primary group-hover:text-white transition-colors tracking-wide">Gunakan</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
