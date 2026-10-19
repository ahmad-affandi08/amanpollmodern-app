import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initInstallPrompt } from './pwa/installStore'

// Harus dipasang sebelum render: `beforeinstallprompt` bisa terpicu sangat awal.
initInstallPrompt()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
