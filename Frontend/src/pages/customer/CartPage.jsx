import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

export const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCartStore();
  const navigate = useNavigate();

  /* Safe qty update — Zustand store may or may not have updateQuantity */
  const handleQty = (idx, delta) => {
    if (typeof updateQuantity === "function") {
      const newQty = cart[idx].quantity + delta;
      if (newQty < 1) { removeFromCart(idx); return; }
      updateQuantity(idx, newQty);
    } else {
      if (delta < 0) removeFromCart(idx);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center bg-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-6"
        >
          <ShoppingBag className="h-9 w-9 text-gray-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          Looks like you haven't added anything yet. Explore our latest collection.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[#0d2137] text-white px-8 py-3 text-[13px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors"
        >
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 199;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1400px] px-6 py-2.5 lg:px-10">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Shopping Cart</span>
          </nav>
        </div>
      </div>

      {/* Page title */}
      <div className="bg-white border-b border-gray-200 py-6 text-center">
        <h1 className="text-[24px] font-bold tracking-[0.08em] text-gray-900 uppercase">
          Shopping Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
        </h1>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-0 bg-white border border-gray-200">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <span className="col-span-6">Product</span>
              <span className="col-span-2 text-center">Price</span>
              <span className="col-span-2 text-center">Quantity</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            <AnimatePresence initial={false}>
              {cart.map((item, idx) => (
                <motion.div
                  key={`${item.product}-${item.size}-${idx}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-12 gap-4 items-center px-5 py-4 border-b border-gray-100 last:border-0"
                >
                  {/* Image + info */}
                  <div className="col-span-12 sm:col-span-6 flex items-center gap-4">
                    <div className="relative shrink-0 group">
                      <Link to={`/products/${item.product}`}>
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=300"}
                          alt={item.name}
                          className="h-20 w-16 object-cover object-center bg-gray-100"
                        />
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product}`}>
                        <p className="text-[13px] font-semibold text-gray-900 line-clamp-2 hover:text-[#4a6d98] transition-colors leading-snug">
                          {item.name}
                        </p>
                      </Link>
                      <p className="mt-1 text-[11px] text-gray-400">
                        Size: <span className="text-gray-700 font-medium">{item.size}</span>
                        {item.color?.name && (
                          <> &nbsp;|&nbsp; Color: <span className="text-gray-700 font-medium">{item.color.name}</span></>
                        )}
                      </p>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="hidden sm:flex col-span-2 justify-center">
                    <span className="text-[13px] font-semibold text-gray-800">₹{item.price?.toLocaleString()}</span>
                  </div>

                  {/* Qty */}
                  <div className="col-span-6 sm:col-span-2 flex justify-start sm:justify-center">
                    <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
                      <button
                        onClick={() => handleQty(idx, -1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-[12px] font-semibold text-gray-900 border-x border-gray-300 h-8 flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQty(idx, 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-6 sm:col-span-2 text-right">
                    <span className="text-[13px] font-bold text-gray-900">
                      ₹{(item.price * item.quantity)?.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Coupon row */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4a6d98] rounded-sm bg-white"
                  />
                </div>
                <button className="px-5 py-2 bg-[#0d2137] text-white text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors cursor-pointer rounded-sm">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="bg-white border border-gray-200 p-6 space-y-4 sticky top-[130px]">
            <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})</span>
                <span className="font-semibold text-gray-900">₹{subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? "text-green-600" : "text-gray-900"}`}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[11px] text-gray-400">
                  Add ₹{(2000 - subtotal)?.toLocaleString()} more for free shipping!
                </p>
              )}
              <div className="flex justify-between text-[15px] font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total</span>
                <span>₹{total?.toLocaleString()}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/checkout")}
              className="flex w-full items-center justify-center gap-2 bg-[#0d2137] py-3.5 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-[#1a3a5c] transition-colors cursor-pointer"
            >
              Checkout <ArrowRight className="h-4 w-4" />
            </motion.button>

            <Link
              to="/products"
              className="block text-center text-[11px] text-gray-400 hover:text-gray-700 underline underline-offset-4 transition-colors"
            >
              Continue Shopping
            </Link>

            {/* Accepted payments */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] text-gray-400 text-center mb-2">We Accept</p>
              <div className="flex justify-center flex-wrap gap-1.5">
                {["VISA", "MC", "AMEX", "UPI", "GPay"].map(p => (
                  <span key={p} className="rounded border border-gray-200 px-2 py-0.5 text-[9px] font-bold text-gray-400">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
