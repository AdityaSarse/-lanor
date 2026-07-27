import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../utils/axios";
import { ENDPOINTS } from "../constants/api.constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await apiClient.get(ENDPOINTS.AUTH.ME);
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.error("Auth check failed:", err);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);
  };

  const logout = async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      console.warn("Logout endpoint call failed:", e);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, isAdmin: user?.role === "admin" }}>
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
