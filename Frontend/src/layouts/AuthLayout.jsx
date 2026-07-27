import React from "react";
import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      {/* Left: Fashion Image Panel (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=85&w=1200"
          alt="Élanor Fashion"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2137]/80 via-[#0d2137]/20 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <span className="font-logo text-5xl italic font-medium text-white block mb-3">Élanor</span>
          <p className="text-sm text-white/70 leading-relaxed max-w-xs">
            Premium fashion crafted for the modern individual — where timeless quality meets everyday style.
          </p>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden mb-8 block text-center">
          <span className="font-logo text-4xl italic font-medium text-gray-900">Élanor</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Desktop logo above form */}
          <div className="hidden lg:block text-center mb-8">
            <Link to="/">
              <span className="font-logo text-4xl italic font-medium text-gray-900 hover:text-[#0d2137] transition-colors">Élanor</span>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm p-8 rounded-sm">
            <Outlet />
          </div>

          <p className="mt-6 text-center text-[11px] text-gray-400">
            © 2026 Élanor. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
