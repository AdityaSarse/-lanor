/**
 * useAuth — clean hook re-export for auth state.
 *
 * Usage:
 *   import { useAuth } from "../hooks/useAuth";
 *   const { user, login, logout, isAdmin, isAuthenticated, isLoading } = useAuth();
 *
 * Internally delegates to useAuthStore (Zustand) via AuthContext,
 * so both import paths work seamlessly.
 */
export { useAuth } from "../context/AuthContext";
