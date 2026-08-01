import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Bell, LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * AdminTopNavbar — top bar inside AdminLayout.
 * Receives `title` from each admin page.
 * Gets `onMenuClick` from Outlet context (set in AdminLayout).
 */
export const AdminHeader = ({ title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // onMenuClick is injected by AdminLayout via Outlet context
  let onMenuClick;
  try {
    const ctx = useOutletContext();
    onMenuClick = ctx?.onMenuClick;
  } catch {
    onMenuClick = undefined;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 flex-shrink-0">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-[18px] font-bold tracking-tight text-gray-900">
          {title}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-sm hover:bg-gray-100">
          <Bell className="h-4.5 w-4.5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Admin avatar + info */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#0d2137] flex items-center justify-center text-[11px] font-bold text-white select-none">
            {user?.firstName?.[0] ?? "A"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[12px] font-semibold text-gray-800 leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Administrator
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded-sm border border-transparent hover:border-red-100"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
};
