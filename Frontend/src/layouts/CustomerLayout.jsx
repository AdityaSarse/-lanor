import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/common/Navbar";
import { Footer } from "../components/common/Footer";

export const CustomerLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-100 selection:text-gray-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
