import React from 'react'
import ReactDOM from 'react-dom'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'


const DIALOG_OVERLAY = "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
const DIALOG_CARD = "bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"
const ICON_CONTAINER = "w-12 h-12 rounded-full flex items-center justify-center mb-4"

/**
 * Confirmation Dialog
 */
export default function ConfirmDialog({
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

  const typeConfig = {
    danger: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', btn: 'bg-orange-500 hover:bg-orange-600' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', btn: 'bg-blue-600 hover:bg-blue-700' },
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', btn: 'bg-green-600 hover:bg-green-700' },
  }

  const config = typeConfig[type === 'error' ? 'danger' : type] || typeConfig.warning
  const Icon = config.icon

  const dialogContent = (
    <div className={DIALOG_OVERLAY}>
      <div className={DIALOG_CARD}>
        <div className="flex flex-col items-center text-center">
          <div className={`${ICON_CONTAINER} ${config.bg}`}>
            <Icon size={24} className={config.color} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition-colors ${config.btn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )


  return ReactDOM.createPortal(dialogContent, document.body)
}

/**
 * Toast Dialog - Now styled exactly like ConfirmDialog
 * Acts as an Auto-closing Success/Info Modal
 */
export function ToastDialog({
  isOpen,
  type = 'info',
  title,
  message,
  duration = 3000,
  onClose,
}) {
  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const typeConfig = {
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', defaultTitle: 'Berhasil' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', defaultTitle: 'Gagal' },
    warning: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', defaultTitle: 'Peringatan' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', defaultTitle: 'Informasi' },
  }

  const config = typeConfig[type] || typeConfig.info
  const Icon = config.icon
  const displayTitle = title || config.defaultTitle

  const dialogContent = (
    <div className={DIALOG_OVERLAY}>
      <div className={`${DIALOG_CARD} transform transition-all`}>
        <div className="flex flex-col items-center text-center">
          {/* Centered Icon */}
          <div className={`${ICON_CONTAINER} ${config.bg}`}>
            <Icon size={24} className={config.color} />
          </div>

          {/* Centered Text */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{displayTitle}</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            {message}
          </p>

          {/* Optional: Close Button for manual dismissal (and nice look) */}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )


  return ReactDOM.createPortal(dialogContent, document.body)
}
