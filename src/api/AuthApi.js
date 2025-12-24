// API wrapper for authentication with Laravel Sanctum
import axiosClient from './axiosClient';

/**
 * Register new user
 * @param {Object} payload - { nama_lengkap, username, email, wa, password, password_confirmation, kategori_user_id, ruangan_id?, divisi_id? }
 */
export async function register(payload) {
  try {
    const res = await axiosClient.post('/register', payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Login user and get Sanctum token
 * @param {Object} credentials - { username, password } or { email, password }
 */
export async function login(credentials) {
  try {
    const res = await axiosClient.post('/login', credentials);
    const data = res.data;

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }

    // Store user data
    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }

    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Logout user and revoke token
 */
export async function logout() {
  try {
    const res = await axiosClient.post('/logout');

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    return res.data;
  } catch (err) {
    // Clear localStorage even if request fails
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    throw err.response?.data || err;
  }
}

/**
 * Get current authenticated user
 */
export async function getUser() {
  try {
    const res = await axiosClient.get('/user');

    // Update user data in localStorage
    if (res.data.user) {
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
    }

    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Get kategori user list for registration
 */
export async function getKategoriUser() {
  try {
    const res = await axiosClient.get('/kategori-user');
    return res.data.data || res.data; // Handle both formats
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Get ruangan list for registration
 */
export async function getRuangan() {
  try {
    const res = await axiosClient.get('/ruangan?all=true'); // Get all data without pagination
    return res.data.data || res.data; // Handle both formats
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Get divisi list for registration
 */
export async function getDivisi() {
  try {
    const res = await axiosClient.get('/divisi?all=true'); // Get all data without pagination
    return res.data.data || res.data; // Handle both formats
  } catch (err) {
    throw err.response?.data || err;
  }
}

export default {
  register,
  login,
  logout,
  getUser,
  getKategoriUser,
  getRuangan,
  getDivisi
};

