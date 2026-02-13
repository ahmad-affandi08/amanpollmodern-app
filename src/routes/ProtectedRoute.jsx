import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/utils/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { isMobileRole } from '../features/auth/constants';

/**
 * Protected Route wrapper - requires authentication
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
    const userRole = parseInt(user.kategori_user_id);
    const isMobile = isMobileRole(userRole);
    const isOnMobilePath = location.pathname.startsWith('/mobile');


    if (isMobile && !isOnMobilePath && location.pathname !== '/dashboard') {

      return <Navigate to="/mobile/dashboard" replace />;
    }


    if (!isMobile && isOnMobilePath) {
      return <Navigate to="/dashboard" replace />;
    }
  }


  if (allowedRoles.length > 0 && user) {
    const userRole = parseInt(user.kategori_user_id);
    if (!allowedRoles.includes(userRole)) {
      console.warn(`Access denied for role ${userRole} to ${location.pathname}`);

      const isMobile = isMobileRole(userRole);
      return <Navigate to={isMobile ? "/mobile/dashboard" : "/dashboard"} replace />;
    }
  }

  return children;
}
