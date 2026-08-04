import { create } from "zustand";
import { authService } from "../services/auth.service";

export const useAuthStore = create((set, get) => ({
  /* ─── State ─────────────────────────────────────────── */
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,   // true until initFromStorage() resolves

  /* ─── Actions ───────────────────────────────────────── */

  /**
   * Called once on app boot to rehydrate state from localStorage
   * and verify the stored token is still valid with /auth/me.
   */
  initFromStorage: async () => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      set({ isLoading: false });
      return;
    }

    // Optimistic restore from storage first (instant UI)
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        set({ user: parsed, token, isAuthenticated: true });
      } catch {
        // ignore parse error
      }
    }

    // Validate with backend
    try {
      const res = await authService.getCurrentUser();
      const user = res?.user ?? null;
      if (user) {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (err) {
      // Only log out if backend explicitly rejected auth (401/403). Otherwise preserve saved session.
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        get().logout();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Called after a successful login or register API response.
   */
  login: (user, accessToken) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    set({
      user,
      token: accessToken,
      isAuthenticated: true,
    });
  },

  /**
   * Clears all auth state and localStorage.
   */
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  /**
   * Update user fields (e.g. after profile edit).
   */
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
}));
