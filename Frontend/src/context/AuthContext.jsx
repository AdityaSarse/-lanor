import React, { createContext, useContext, useEffect } from "react";
import apiClient from "../utils/axios";
import { ENDPOINTS } from "../constants/api.constants";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and initialises auth state from localStorage
 * on boot, delegating all state management to the Zustand useAuthStore.
 */
export const AuthProvider = ({ children }) => {
  const store = useAuthStore();
  const { fetchServerCart } = useCartStore();

  /* Rehydrate from localStorage + validate token on mount */
  useEffect(() => {
    store.initFromStorage().then(() => {
      // Once auth is resolved, sync cart from server if logged in
      const token = localStorage.getItem("accessToken");
      if (token) fetchServerCart();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * login() — stores user & token in Zustand + localStorage.
   */
  const login = (userData, accessToken) => {
    store.login(userData, accessToken);
  };

  /**
   * logout() — calls the backend endpoint (best effort) then clears state.
   */
  const logout = async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      console.warn("Logout endpoint call failed:", e);
    } finally {
      store.logout();
    }
  };

  const value = {
    /* State */
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    loading: store.isLoading,       // alias kept for ProtectedRoute compatibility
    isLoading: store.isLoading,
    isAdmin: store.user?.role === "admin",
    role: store.user?.role ?? null,

    /* Actions */
    login,
    logout,
    setUser: store.setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
