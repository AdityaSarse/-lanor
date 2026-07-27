import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, ArrowLeft } from "lucide-react";

export const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-4 min-h-screen flex flex-col justify-between">
      <div>
        <div className="mb-8 px-2">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-xl font-bold text-transparent tracking-wide">
            ÉLANOR ADMIN
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-purple-600/15 text-purple-400 font-semibold border border-purple-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-zinc-900">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
        </Link>
      </div>
    </aside>
  );
};
