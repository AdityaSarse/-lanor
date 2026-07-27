import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.login(form);
      const { user, accessToken } = res.data;
      login(user, accessToken);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-[12px] text-gray-500 mt-1">Sign in to your Élanor account</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-medium text-red-600"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="w-full border border-gray-300 bg-white px-3 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm transition-colors"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 bg-white px-3 py-2.5 pr-10 text-[13px] text-gray-900 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <button type="button" className="text-[11px] text-[#4a6d98] hover:underline cursor-pointer">
              Forgot password?
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 bg-[#0d2137] py-3 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-[#1a3a5c] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing In...</> : "Sign In"}
        </motion.button>
      </form>

      <div className="text-center text-[12px] text-gray-500 border-t border-gray-100 pt-5">
        Don't have an account?{" "}
        <Link to="/auth/register" className="font-semibold text-[#4a6d98] hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
};
