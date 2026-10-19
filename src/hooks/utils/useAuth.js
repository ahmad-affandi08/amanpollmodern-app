import { useContext } from 'react';
import { AuthContext } from '../../context/authContext';

/**
 * Hook status autentikasi (user, isAuthenticated, loading, login, logout, ...).
 * Satu-satunya cara membaca AuthContext; gunakan ini, bukan context langsung.
 */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
