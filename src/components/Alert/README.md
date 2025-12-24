# Alert Component System

Alert system dengan tema neobrutalism yang lengkap untuk aplikasi.

## Components

### 1. Alert
Alert statis untuk menampilkan pesan.

```jsx
import Alert from './components/Alert/Alert'

<Alert 
  type="success"  // success, error, warning, info
  message="Operasi berhasil!"
  onClose={() => console.log('closed')}
/>
```

### 2. ConfirmDialog
Dialog konfirmasi dengan callback.

```jsx
import { ConfirmDialog } from './components/Alert/Alert'

const [isOpen, setIsOpen] = useState(false)

<ConfirmDialog
  isOpen={isOpen}
  title="Hapus Data"
  message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
  confirmText="Ya, Hapus"
  cancelText="Batal"
  type="error"
  onConfirm={() => {
    // Handle confirm
    setIsOpen(false)
  }}
  onCancel={() => setIsOpen(false)}
/>
```

### 3. Toast Notification
Notifikasi yang auto-dismiss dengan context provider.

```jsx
// Di App.jsx, wrap dengan ToastProvider
import ToastProvider from './components/Alert/ToastProvider'

<ToastProvider>
  <App />
</ToastProvider>

// Di komponen manapun
import { useToast } from './components/Alert/useToast'

function MyComponent() {
  const { showToast } = useToast()
  
  const handleClick = () => {
    showToast('success', 'Data berhasil disimpan!', 3000)
  }
}
```

## Props

### Alert Props
- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'info')
- `message`: string (required)
- `onClose`: function (optional)
- `className`: string (optional)

### ConfirmDialog Props
- `isOpen`: boolean (required)
- `title`: string (default: 'Konfirmasi')
- `message`: string (required)
- `confirmText`: string (default: 'Ya, Lanjutkan')
- `cancelText`: string (default: 'Batal')
- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'warning')
- `onConfirm`: function (required)
- `onCancel`: function (required)

### Toast Props
- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'info')
- `message`: string (required)
- `duration`: number in ms (default: 3000, set 0 for no auto-dismiss)
- `onClose`: function (optional)

## Styling
Semua komponen menggunakan tema neobrutalism dengan:
- Border tebal hitam (4px)
- Shadow offset yang bold
- Warna-warna cerah (green, red, yellow, blue)
- Typography bold dan uppercase
- Smooth transitions dan animations
