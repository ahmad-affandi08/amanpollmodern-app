import React, { createContext, useState, useCallback } from 'react'
import { ToastDialog } from './Alert'

export const ToastContext = createContext()

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'info', title = null, duration = 3000) => {
    const id = Date.now()
    setToast({ id, type, message, title, duration })
  }, [])

  const removeToast = useCallback(() => {
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Show ToastDialog as centered modal */}
      {toast && (
        <ToastDialog
          isOpen={true}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      )}
    </ToastContext.Provider>
  )
}
