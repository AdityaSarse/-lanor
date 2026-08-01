import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Tag, Award,
  ShoppingBag, Ticket, CreditCard,
  Users, Star, BarChart2, Settings,
  LogOut, Store, X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/* ─── Nav Structure ─────────────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: null,
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalog",
    items: [
      { name: "Products",   path: "/admin/products",   icon: Package },
      { name: "Categories", path: "/admin/categories", icon: Tag },
      { name: "Brands",     path: "/admin/brands",     icon: Award },
    ],
  },
  {
    label: "Sales",
    items: [
      { name: "Orders",   path: "/admin/orders",   icon: ShoppingBag },
      { name: "Coupons",  path: "/admin/coupons",  icon: Ticket },
      { name: "Payments", path: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    label: "Users",
    items: [
      { name: "Customers", path: "/admin/customers", icon: Users },
      { name: "Reviews",   path: "/admin/reviews",   icon: Star },
    ],
  },
  {
    label: "Other",
    items: [
      { name: "Analytics", path: "/admin/analytics", icon: BarChart2 },
      { name: "Settings",  path: "/admin/settings",  icon: Settings },
    ],
  },
];

/* ─── Nav Item ──────────────────────────────────────────────────────────── */
const NavItem = ({ item, isActive, onClose }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClose}
      className={`flex items-center gap-3 px-3 py-2 rounded-sm text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? "bg-[#0d2137] text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
      {item.name}
    </Link>
  );
};

/* ─── Sidebar Inner Content ─────────────────────────────────────────────── */
const SidebarContent = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200 flex-shrink-0">
        <Link to="/admin/dashboard" onClick={onClose} className="flex items-center gap-2">
          <span className="font-logo text-[28px] italic font-medium text-[#0d2137] tracking-wide select-none">
            Élanor
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mt-1">
            Admin
          </span>
        </Link>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-4" : ""}>
            {group.label && (
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={
                    location.pathname === item.path ||
                    location.pathname.startsWith(item.path + "/")
                  }
                  onClose={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: User + Actions */}
      <div className="flex-shrink-0 border-t border-gray-200 px-3 py-4 space-y-1">
        {/* Admin info */}
        <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-[#0d2137] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {user?.firstName?.[0] ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-gray-800 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Administrator</p>
          </div>
        </div>

        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-[13px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Store className="h-4 w-4 text-gray-400" />
          Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-[13px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

/* ─── Sidebar ───────────────────────────────────────────────────────────── */
export const AdminSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex w-[260px] flex-shrink-0 flex-col bg-white border-r border-gray-200 min-h-screen sticky top-0 h-screen overflow-y-auto">
        <SidebarContent onClose={null} />
      </aside>

      {/* Mobile drawer — slides in from left */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-[260px] flex-col bg-white border-r border-gray-200 flex transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  );
};
