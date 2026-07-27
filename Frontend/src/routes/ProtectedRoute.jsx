import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">Verifying session...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
