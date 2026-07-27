import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const PAYMENT_ICONS = [
  { name: "Visa", bg: "#1a1f71", text: "VISA" },
  { name: "Mastercard", bg: "#eb001b", text: "MC" },
  { name: "PayPal", bg: "#003087", text: "PP" },
  { name: "Amex", bg: "#007bc1", text: "AMEX" },
  { name: "JCB", bg: "#003087", text: "JCB" },
  { name: "Discover", bg: "#e65c00", text: "DISC" },
];

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="mt-auto bg-white text-gray-700 border-t border-gray-200">
      {/* Main Footer Grid */}
      <div className="mx-auto max-w-[1400px] px-6 py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1 space-y-3">
            <Link to="/" className="block">
              <span className="font-logo text-3xl italic font-medium text-gray-900">Élanor</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[220px]">
              Premium fashion crafted for the modern individual — where timeless quality meets everyday comfort.
            </p>
          </div>

          {/* INFORMATION */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-900 mb-4">
              INFORMATION
            </h5>
            <ul className="space-y-2.5">
              {["About Us", "Contact Us", "Terms of Service", "Careers"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* POLICY */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-900 mb-4">
              POLICY
            </h5>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Return Policy", "Shipping Policy", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-900 mb-4">
              NEWSLETTER
            </h5>
            <p className="text-xs text-gray-500 mb-3">
              For sales, exclusive content, and more!
            </p>
            {subscribed ? (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold text-[#4a6d98]"
              >
                ✓ Thanks for subscribing!
              </motion.p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 min-w-0 rounded-l-md border border-gray-300 border-r-0 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-r-md bg-[#0d2137] px-3 py-2 text-white hover:bg-[#1a3a5c] transition-colors cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Payment Icons + Copyright */}
      <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-10">
        {/* Payment Icons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          {PAYMENT_ICONS.map((icon) => (
            <div
              key={icon.name}
              className="flex h-7 w-12 items-center justify-center rounded border border-gray-200 bg-white shadow-sm"
              title={icon.name}
            >
              <span className="text-[9px] font-bold tracking-tight" style={{ color: icon.bg }}>
                {icon.text}
              </span>
            </div>
          ))}
          {/* RazorPay */}
          <div className="flex h-7 w-16 items-center justify-center rounded border border-gray-200 bg-white shadow-sm">
            <span className="text-[9px] font-bold text-[#2d81f7]">Razorpay</span>
          </div>
          {/* GPay */}
          <div className="flex h-7 w-12 items-center justify-center rounded border border-gray-200 bg-white shadow-sm">
            <span className="text-[9px] font-bold text-gray-700">GPay</span>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-[11px] text-gray-400">
          © 2026 Élanor. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
