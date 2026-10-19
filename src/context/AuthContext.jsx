import { useState, useEffect, useCallback } from 'react';
import * as AuthApi from '../api/AuthApi';
import { UNAUTHORIZED_EVENT } from '../api/axiosClient';
import { clearAllData } from '../lib/queryClient';
import { AuthContext } from './authContext';

const clearStoredSession = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(async (callApi = true) => {
    try {
      if (callApi) {
        await AuthApi.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAllData();
      setUser(null);
      setIsAuthenticated(false);
      clearStoredSession();
    }
  }, []);

  const checkAuth = useCallback(async () => {
    let hasLocalData = false;

    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          hasLocalData = true;

          setLoading(false);
        } catch {
          localStorage.removeItem('user_data');
        }
      }

      try {
        const response = await AuthApi.getUser();

        if (response.user) {
          setUser(response.user);
          setIsAuthenticated(true);

          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
      } catch (error) {
        console.warn('Session verification failed:', error);

        if (error?.status === 401) {
          await logout(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      if (!hasLocalData) {
        setLoading(false);
      }
    }
  }, [logout]);

  // Server menolak token (401) di request mana pun: akhiri sesi di aplikasi juga,
  // sehingga ProtectedRoute mengarahkan pengguna ke halaman login.
  useEffect(() => {
    const handleUnauthorized = () => {
      clearAllData();
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const response = await AuthApi.login(credentials);
    // Pastikan tidak ada data pengguna sebelumnya yang tersisa di cache.
    clearAllData();
    if (response.user) {
      setUser(response.user);
      setIsAuthenticated(true);
    }
    return response;
  };

  const register = (data) => AuthApi.register(data);

  const forgotPassword = (data) => AuthApi.forgotPassword(data);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      register,
      forgotPassword,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}
