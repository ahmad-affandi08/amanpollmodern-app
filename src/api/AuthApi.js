
import axiosClient from './axiosClient';

/**
 * Bentuk error yang dilempar modul ini: isi body respons server (message, errors, dst)
 * ditambah `status` HTTP, sehingga `error.message`, `error.errors`, dan `error.status`
 * bisa dibaca langsung oleh pemanggil.
 */
const toError = (err) => {
  const data = err.response?.data;
  if (data && typeof data === 'object') {
    return Object.assign(data, { status: err.response.status });
  }
  return err;
};

/**
 * Register new user
 * @param {Object} payload - { nama_lengkap, username, email, wa, password, password_confirmation, kategori_user_id, ruangan_id?, divisi_id? }
 */
export async function register(payload) {
  try {
    const res = await axiosClient.post('/register', payload);
    return res.data;
  } catch (err) {
    throw toError(err);
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


    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }


    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }

    return data;
  } catch (err) {
    throw toError(err);
  }
}

/**
 * Logout user and revoke token
 */
export async function logout() {
  try {
    const res = await axiosClient.post('/logout');


    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    return res.data;
  } catch (err) {

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    throw toError(err);
  }
}

/**
 * Get current authenticated user
 */
export async function getUser() {
  try {
    const res = await axiosClient.get('/user');


    if (res.data.user) {
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
    }

    return res.data;
  } catch (err) {
    throw toError(err);
  }
}

/**
 * Get kategori user list for registration
 */
export async function getKategoriUser() {
  try {
    const res = await axiosClient.get('/kategori-user');
    return res.data.data || res.data;
  } catch (err) {
    throw toError(err);
  }
}

/**
 * Get ruangan list for registration
 */
export async function getRuangan() {
  try {
    const res = await axiosClient.get('/ruangan?all=true');
    return res.data.data || res.data;
  } catch (err) {
    throw toError(err);
  }
}

/**
 * Get divisi list for registration
 */
export async function getDivisi() {
  try {
    const res = await axiosClient.get('/divisi?all=true');
    return res.data.data || res.data;
  } catch (err) {
    throw toError(err);
  }
}

export async function forgotPassword(payload) {
  try {
    const res = await axiosClient.post('/forgot-password', payload);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
}

export default {
  register,
  login,
  logout,
  getUser,
  forgotPassword,
  getKategoriUser,
  getRuangan,
  getDivisi
};

