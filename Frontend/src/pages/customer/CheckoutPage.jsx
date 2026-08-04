import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Check, ArrowRight, Tag, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { orderService, addressService, paymentService } from "../../services/api.service";
import { couponService } from "../../services/api.service";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export const CheckoutPage = () => {
  const { cart, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");

  /* Coupon state */
  const [promoCode, setPromoCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState(null); // { discountAmount, discountPercent, coupon }
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoErr, setPromoErr] = useState("");

  /* Shipping address form — pre-fill from user profile */
  const [shipping, setShipping] = useState({
    fullName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    phone: user?.phone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    notes: "",
  });

  const handleChange = (e) => setShipping({ ...shipping, [e.target.name]: e.target.value });

  /* Pricing calculations */
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 2000 || subtotal === 0 ? 0 : 199;
  const discountAmount = couponResult?.discountAmount || 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  /* Apply coupon via real backend API */
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setPromoErr("");
    setCouponLoading(true);
    try {
      const res = await couponService.validateCoupon({ code, subtotal });
      // Backend returns { data: { discountAmount, discountPercent, coupon, finalAmount } }
      const result = res?.data ?? res;
      setCouponResult(result);
      setPromoApplied(true);
      toast.success(`Coupon "${code}" applied! You saved ₹${result.discountAmount?.toLocaleString() || 0}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired coupon code.";
      setPromoErr(msg);
      setCouponResult(null);
      setPromoApplied(false);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponResult(null);
    setPromoApplied(false);
    setPromoCode("");
    setPromoErr("");
  };

  /* Razorpay payment handler */
  const openRazorpay = (paymentData, backendOrderId) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: paymentData.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentData.amount,
        currency: paymentData.currency || "INR",
        name: "Élanor",
        description: `Order #${paymentData.orderNumber}`,
        order_id: paymentData.razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              orderId: backendOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve(true);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment dismissed by user")),
        },
        prefill: {
          name: shipping.fullName,
          contact: shipping.phone,
        },
        theme: { color: "#0d2137" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  /* Place order */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Validate required fields
    if (!shipping.fullName.trim()) return toast.error("Full name is required");
    if (!shipping.phone.trim()) return toast.error("Phone number is required");
    if (!shipping.addressLine1.trim()) return toast.error("Address Line 1 is required");
    if (!shipping.city.trim()) return toast.error("City is required");
    if (!shipping.state.trim()) return toast.error("State is required");
    if (!shipping.postalCode.trim()) return toast.error("Postal code is required");

    setLoading(true);
    try {
      // Step 1: Create shipping address in backend
      const addressRes = await addressService.create({
        fullName: shipping.fullName.trim(),
        phone: shipping.phone.replace(/\D/g, "").slice(-10),
        addressLine1: shipping.addressLine1.trim(),
        addressLine2: shipping.addressLine2.trim() || undefined,
        city: shipping.city.trim(),
        state: shipping.state.trim(),
        postalCode: shipping.postalCode.trim(),
        country: shipping.country || "India",
        type: "Home",
        isDefault: false,
      });
      const addressPayload = addressRes?.data ?? addressRes;
      const addressId = addressPayload?._id || addressPayload?.data?._id;
      if (!addressId) throw new Error("Could not create shipping address. Check your details.");

      // Step 2: Place order
      const orderPayload = {
        addressId,
        paymentMethod,
        customerNote: shipping.notes?.trim() || undefined,
      };
      if (promoApplied && promoCode) orderPayload.couponCode = promoCode.trim().toUpperCase();

      const orderRes = await orderService.placeOrder(orderPayload);
      const orderPayloadData = orderRes?.data ?? orderRes;
      const placedOrder = orderPayloadData?.order || orderPayloadData?.data || orderPayloadData;
      const backendOrderId = placedOrder?._id;
      if (!backendOrderId) throw new Error("Order placement failed. Please try again.");

      // Step 3: If Razorpay — open payment modal
      if (paymentMethod === "Razorpay") {
        try {
          const payRes = await paymentService.createPayment(backendOrderId);
          const payData = payRes?.data ?? payRes;
          await openRazorpay(payData, backendOrderId);
          toast.success("Payment successful! Order confirmed.");
        } catch (payErr) {
          if (payErr?.message === "Payment dismissed by user") {
            toast.error("Payment was cancelled. Your order is saved — complete payment from your orders page.");
          } else {
            toast.error("Payment failed. You can retry from your orders page.");
          }
        }
      } else {
        toast.success(`Order placed successfully! Estimated delivery in 5–7 days.`);
      }

      await clearCart();
      navigate("/orders");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Order placement failed. Please try again.";
      toast.error(msg);
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Items to Checkout</h2>
        <p className="text-sm text-gray-500 mb-6">Your shopping bag is empty.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[#0d2137] text-white px-8 py-3 text-[13px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors"
        >
          Explore Catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1400px] px-6 py-2.5 lg:px-10">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-gray-700 transition-colors">Cart</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200 py-6 text-center">
        <h1 className="text-[24px] font-bold tracking-[0.08em] text-gray-900 uppercase">
          Express Checkout
        </h1>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Shipping & Payment (7 cols) ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Shipping Address Box */}
            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">
                  1. Shipping Information
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Secure Delivery
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shipping.fullName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#4a6d98] focus:outline-none rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shipping.phone}
                    onChange={handleChange}
                    required
                    placeholder="10-digit mobile number"
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#4a6d98] focus:outline-none rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={shipping.addressLine1}
                  onChange={handleChange}
                  required
                  placeholder="Flat / House No., Building, Street"
                  className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#4a6d98] focus:outline-none rounded-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={shipping.addressLine2}
                  onChange={handleChange}
                  placeholder="Landmark, Area (optional)"
                  className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#4a6d98] focus:outline-none rounded-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shipping.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#4a6d98] focus:outline-none rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shipping.state}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#4a6d98] focus:outline-none rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shipping.postalCode}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    placeholder="6-digit PIN"
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#4a6d98] focus:outline-none rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Delivery Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={shipping.notes}
                  onChange={handleChange}
                  placeholder="E.g. Leave at front door or call upon arrival"
                  className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#4a6d98] focus:outline-none rounded-sm"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">
                  2. Payment Method
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { id: "Razorpay", label: "Razorpay Secure Gateway", desc: "UPI, Credit/Debit Cards, NetBanking, Wallets", tag: "RECOMMENDED" },
                  { id: "COD", label: "Cash on Delivery (COD)", desc: "Pay with cash or UPI upon home delivery", tag: null },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-start justify-between p-4 border rounded-sm cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? "border-[#0d2137] bg-[#0d2137]/5 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="text-[#0d2137] focus:ring-[#0d2137]"
                      />
                      <div>
                        <span className="text-[13px] font-bold text-gray-900 block">
                          {pm.label}
                        </span>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          {pm.desc}
                        </span>
                      </div>
                    </div>
                    {pm.tag && (
                      <span className="text-[9px] font-bold tracking-wider text-[#c9a84c] bg-[#0d2137] px-2 py-0.5 rounded-sm">
                        {pm.tag}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 rounded-sm">
                <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                <span>256-Bit SSL Encryption guarantees safe transaction handling.</span>
              </div>
            </div>

          </div>

          {/* ── Right Column: Order Summary (5 cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm space-y-5 sticky top-24">
              <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900 border-b border-gray-100 pb-3">
                Order Summary ({cart.length} {cart.length === 1 ? "item" : "items"})
              </h3>

              {/* Items List Preview */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=200"}
                        alt={item.name}
                        className="h-12 w-10 object-cover rounded bg-gray-100"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 line-clamp-1 max-w-[160px]">{item.name}</p>
                        <p className="text-[10px] text-gray-400">Qty: {item.quantity} | Size: {item.size}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="border-t border-b border-gray-100 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Promo Code
                  </span>
                  {promoApplied && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      REMOVE
                    </button>
                  )}
                </div>

                {promoApplied ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-sm px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-emerald-700">{promoCode.toUpperCase()} — APPLIED!</p>
                      <p className="text-[10px] text-emerald-600">
                        You save ₹{discountAmount.toLocaleString()}
                        {couponResult?.coupon?.discountType === "percentage" && ` (${couponResult.coupon.discountValue}% off)`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 border border-gray-300 px-3 py-1.5 text-xs text-gray-800 focus:border-[#4a6d98] focus:outline-none rounded-sm uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={couponLoading || !promoCode.trim()}
                      className="bg-[#0d2137] px-4 py-1.5 text-[11px] font-bold tracking-wider text-white hover:bg-[#1a3a5c] transition-colors rounded-sm cursor-pointer disabled:opacity-50"
                    >
                      {couponLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "APPLY"}
                    </button>
                  </div>
                )}

                {promoErr && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {promoErr}
                  </p>
                )}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({promoCode})</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-semibold text-gray-900">₹{shippingFee}</span>
                  )}
                </div>

                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-3">
                  <span>Total Payable</span>
                  <span className="text-[#0d2137] text-base">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 bg-[#0d2137] py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#1a3a5c] transition-all duration-300 shadow-md cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing Order...</>
                ) : (
                  <><Lock className="h-4 w-4" /> PLACE ORDER (₹{totalAmount.toLocaleString()})</>
                )}
              </motion.button>

              <div className="pt-2 text-center text-[10px] text-gray-400 space-y-1">
                <p>✓ 30-Day Money Back Guarantee</p>
                <p>✓ Fast Express Delivery Across India</p>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
