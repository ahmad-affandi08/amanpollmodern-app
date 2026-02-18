import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Trash, } from 'lucide-react';

const SignaturePad = forwardRef(({ label, onClear }, ref) => {
  const sigCanvas = useRef(null);
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      sigCanvas.current?.clear();
      if (onClear) onClear();
    },
    isEmpty: () => {
      return sigCanvas.current?.isEmpty() ?? true;
    },
    toDataURL: () => {
      return sigCanvas.current?.toDataURL('image/png') ?? '';
    },
  }));


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e) => {
      e.preventDefault();
    };


    container.addEventListener('touchstart', preventScroll, { passive: false });
    container.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      container.removeEventListener('touchstart', preventScroll);
      container.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  const handleClear = () => {
    sigCanvas.current?.clear();
    if (onClear) onClear();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-medium text-gray-700">{label}</label>
      )}
      <div ref={containerRef} className="relative border-2 border-gray-200 rounded-xl bg-white overflow-hidden" style={{ touchAction: 'none' }}>
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48',
            style: {
              touchAction: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              userSelect: 'none'
            }
          }}
          backgroundColor="white"
          penColor="black"
          minWidth={0.5}
          maxWidth={2.5}
          velocityFilterWeight={0.7}
          dotSize={1}
          clearOnResize={false}
        />
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="flex items-center gap-2 px-4 py-2 bg-danger-500 text-white rounded-full text-sm font-bold hover:bg-danger-600 transition-colors"
      >
        <Trash size={16} />
        Clear
      </button>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
