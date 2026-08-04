/**
 * GuestRoute — redirects authenticated users away from auth pages.
 * If already logged in, visiting /auth/login or /auth/register
 * redirects to home (or /admin/dashboard for admins).
 */
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const GuestRoute = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="font-logo text-3xl italic text-[#0d2137] select-none">Élanor</span>
          <div className="h-0.5 w-16 bg-[#c9a84c] animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/"} replace />;
  }

  return <Outlet />;
};
