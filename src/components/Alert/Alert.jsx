import React from 'react'
import ReactDOM from 'react-dom'
import { useBodyScrollLock, useEscapeKey } from '../../hooks/utils/useOverlay'
import AlertArt from './AlertArt'


const DIALOG_OVERLAY = "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
const DIALOG_CARD = "bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"

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
  // Selama onConfirm (boleh async) berjalan, tombol dikunci agar klik ganda
  // tidak mengirim permintaan hapus/simpan dua kali.
  const [busy, setBusy] = React.useState(false)

  useBodyScrollLock(isOpen)
  useEscapeKey(isOpen && !busy, onCancel)

  const handleConfirm = async () => {
    if (busy) return
    setBusy(true)
    try {
      await onConfirm?.()
    } finally {
      setBusy(false)
    }
  }

  if (!isOpen) return null

  const typeConfig = {
    danger: { btn: 'bg-red-600 hover:bg-red-700' },
    warning: { btn: 'bg-orange-500 hover:bg-orange-600' },
    info: { btn: 'bg-blue-600 hover:bg-blue-700' },
    success: { btn: 'bg-green-600 hover:bg-green-700' },
  }

  const artType = type === 'error' ? 'danger' : type in typeConfig ? type : 'warning'
  const config = typeConfig[artType]

  const dialogContent = (
    <div className={DIALOG_OVERLAY}>
      <div className={DIALOG_CARD} role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="flex flex-col items-center text-center">
          <AlertArt type={artType} className="w-28 h-28 -mt-2 mb-1" />

          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${config.btn}`}
            >
              {busy ? 'Memproses...' : confirmText}
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

  const defaultTitle = { success: 'Berhasil', error: 'Gagal', warning: 'Peringatan', info: 'Informasi' }
  const artType = type in defaultTitle ? type : 'info'
  const displayTitle = title || defaultTitle[artType]

  const dialogContent = (
    <div className={DIALOG_OVERLAY}>
      <div className={`${DIALOG_CARD} transform transition-all`}>
        <div className="flex flex-col items-center text-center">
          <AlertArt type={artType} className="w-28 h-28 -mt-2 mb-1" />

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
