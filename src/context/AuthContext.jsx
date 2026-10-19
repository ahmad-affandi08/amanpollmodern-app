import { createContext, useState, useEffect, useContext } from 'react';
import * as AuthApi from '../api/AuthApi';
import { UNAUTHORIZED_EVENT } from '../api/axiosClient';
import { clearAllData } from '../lib/queryClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


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
  }, []);

  const checkAuth = async () => {


    let hasLocalData = false;

    try {

      const userData = localStorage.getItem('user_data');
      if (userData) {

        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          hasLocalData = true;

          setLoading(false);
        } catch (e) {
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


        if (!hasLocalData) {
          setLoading(false);
        }

      } catch (error) {

        console.warn('Session verification failed:', error);

        if (error?.status === 401) {
          await logout(false);
        }


        if (!hasLocalData) {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (!hasLocalData) {
        setLoading(false);
      }
    }
  };

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

  const register = async (data) => {
    return await AuthApi.register(data);
  };

  const forgotPassword = async (data) => {
    return await AuthApi.forgotPassword(data);
  };

  const logout = async (callApi = true) => {
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  };

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

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
