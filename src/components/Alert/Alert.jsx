import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

/**
 * Alert Component - Modern Theme
 * Types: success, error, warning, info
 */
export default function Alert({ type = 'info', message, onClose, className = '' }) {
  const typeStyles = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    warning: 'bg-yellow-50 text-orange-700 border border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  }

  const IconComponent = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }[type]

  const Icon = IconComponent

  return (
    <div
      className={`${typeStyles[type]} rounded-xl p-4 flex items-start justify-between gap-3 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3 flex-1">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/**
 * Confirmation Dialog Component - Modern Theme
 */
export function ConfirmDialog({
  isOpen,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  type = 'warning',
}) {
  if (!isOpen) return null

  // Overlay
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 animate-scale-in"
      >
        <div className="text-center mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'error' ? 'bg-red-100 text-red-500' :
            type === 'warning' ? 'bg-orange-100 text-orange-500' :
              'bg-blue-100 text-blue-500'
            }`}>
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 text-sm ${type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' :
              type === 'warning' ? 'bg-[#FF754C] hover:bg-[#e86a45] shadow-[#FF754C]/30' :
                'bg-brand-primary hover:bg-brand-primary-light shadow-brand-primary/30'
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Toast Notification Component - Modern Theme
 */
export function Toast({ type = 'info', message, duration = 3000, onClose }) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const typeStyles = {
    success: 'bg-white border-l-4 border-green-500 text-gray-800',
    error: 'bg-white border-l-4 border-red-500 text-gray-800',
    warning: 'bg-white border-l-4 border-orange-500 text-gray-800',
    info: 'bg-white border-l-4 border-blue-500 text-gray-800',
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-orange-500',
    info: 'text-blue-500'
  }

  const IconComponent = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }[type]

  const Icon = IconComponent

  return (
    <div
      className={`${typeStyles[type]} shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-lg p-4 flex items-center gap-3 min-w-[320px] animate-slide-in mb-4`}
    >
      <Icon className={`w-6 h-6 ${iconColors[type]}`} />
      <p className="flex-1 text-sm font-semibold">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-transform"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
