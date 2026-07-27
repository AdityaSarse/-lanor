import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/common/AdminSidebar";

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-600 selection:text-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
