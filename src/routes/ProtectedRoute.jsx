import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/utils/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { isMobileRole, getRoleId } from '../features/auth/constants';

const homePathFor = (user) =>
  isMobileRole(user?.kategori_user_id) ? '/mobile/dashboard' : '/dashboard';

/**
 * Protected Route wrapper - requires authentication.
 * `allowedRoles` membatasi peran yang boleh membuka halaman; peran lain dialihkan
 * ke beranda masing-masing. Peran mobile hanya boleh di /mobile/*, peran desktop
 * tidak boleh masuk ke /mobile/*.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user) {
    const isMobile = isMobileRole(user.kategori_user_id);
    const isOnMobilePath = location.pathname.startsWith('/mobile');

    if (isMobile !== isOnMobilePath) {
      return <Navigate to={homePathFor(user)} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(getRoleId(user))) {
      console.warn(`Access denied for role ${getRoleId(user)} to ${location.pathname}`);
      return <Navigate to={homePathFor(user)} replace />;
    }
  }

  return children;
}

/**
 * Halaman yang hanya untuk tamu (login, daftar, lupa password): pengguna yang
 * sudah login dialihkan ke beranda.
 */
export function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={homePathFor(user)} replace />;
  }

  return children;
}
