import { useAuthContext } from '../../context/AuthContext';

/**
 * Custom hook for authentication state and actions
 * Now acts as a wrapper around AuthContext
 */
export default function useAuth() {
  return useAuthContext();
}
