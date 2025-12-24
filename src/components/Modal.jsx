import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modern Modal Component
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full ${sizes[size]} z-10 animate-scale-in`}>
        <div className={`bg-white rounded-[24px] shadow-2xl overflow-hidden ${className}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#11142D]">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-8 py-6 bg-[#F8F9FB] border-t border-gray-100 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
