import { useSyncExternalStore } from 'react';

const subscribe = (callback) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

/** true bila perangkat tersambung ke jaringan. */
export default function useOnlineStatus() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
