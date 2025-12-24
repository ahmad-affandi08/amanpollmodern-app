import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X } from 'lucide-react';

const SignaturePad = forwardRef(({ label, onClear }, ref) => {
  const sigCanvas = useRef(null);

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

  const handleClear = () => {
    sigCanvas.current?.clear();
    if (onClear) onClear();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-medium text-gray-700">{label}</label>
      )}
      <div className="relative border-2 border-gray-200 rounded-xl bg-white overflow-hidden">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48 touch-none',
            style: { touchAction: 'none' }
          }}
          backgroundColor="white"
        />
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
      >
        <X size={14} />
        Clear
      </button>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
