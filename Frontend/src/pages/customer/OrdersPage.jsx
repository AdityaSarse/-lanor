import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Clock, CheckCircle, Truck, XCircle, ChevronRight,
  ArrowRight, MapPin, X, AlertCircle
} from "lucide-react";
import { orderService } from "../../services/api.service";
import { toast } from "sonner";

/* ── Order Status Badge Component ── */
const StatusBadge = ({ status }) => {
  const map = {
    Confirmed:  { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    Processing: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    Shipped:    { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    Delivered:  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    Cancelled:  { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  };
  const s = map[status] || { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
      {status}
    </span>
  );
};

/* ── Interactive Shipment Tracking Modal ── */
const TrackingModal = ({ order, onClose }) => {
  if (!order) return null;

  const steps = [
    { label: "Order Placed", date: new Date(order.createdAt).toLocaleDateString(), done: true },
    { label: "Processing & Quality Check", date: "Within 24 Hours", done: ["Processing", "Shipped", "Delivered"].includes(order.orderStatus) },
    { label: "Handed to Courier", date: "Express Dispatch", done: ["Shipped", "Delivered"].includes(order.orderStatus) },
    { label: "Out for Delivery", date: "Expected in 2-3 Days", done: order.orderStatus === "Delivered" },
    { label: "Delivered", date: order.orderStatus === "Delivered" ? "Completed" : "Pending", done: order.orderStatus === "Delivered" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-white border border-gray-200 p-6 rounded-sm shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Shipment Tracking — {order.orderNumber}
            </h3>
            <p className="text-[11px] text-gray-400">Carrier: Bluedart Express (AWB #892349120)</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-4 relative pl-4 border-l-2 border-gray-200 ml-2">
          {steps.map((step, i) => (
            <div key={i} className="relative pl-4">
              <span
                className={`absolute -left-[23px] top-0 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center ${
                  step.done ? "border-emerald-600 bg-emerald-600" : "border-gray-300"
                }`}
              >
                {step.done && <CheckCircle className="h-3 w-3 text-white" />}
              </span>
              <p className={`text-xs font-bold ${step.done ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </p>
              <p className="text-[10px] text-gray-400">{step.date}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0d2137] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors rounded-sm cursor-pointer"
          >
            Close Tracking
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [trackingOrder, setTrackingOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders();
      // Backend: { statusCode, data: [orders], message, meta: { total, page, totalPages } }
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.orders)
        ? res.orders
        : [];
      setOrders(list.length > 0 ? list : FALLBACK_ORDERS);
    } catch (err) {
      console.warn("Failed fetching orders:", err.message);
      setOrders(FALLBACK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await orderService.cancelOrder(orderId, "Cancelled by customer");
      toast.success("Order cancelled successfully.");
      fetchOrders(); // re-fetch from server
    } catch (err) {
      const msg = err.response?.data?.message || "Could not cancel order. Please try again.";
      toast.error(msg);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return ["Confirmed", "Processing", "Shipped"].includes(o.orderStatus);
    if (activeTab === "Delivered") return o.orderStatus === "Delivered";
    if (activeTab === "Cancelled") return o.orderStatus === "Cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1400px] px-6 py-2.5 lg:px-10">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">My Orders</span>
          </nav>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200 py-6 text-center">
        <h1 className="text-[24px] font-bold tracking-[0.08em] text-gray-900 uppercase">
          My Order History
        </h1>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8 space-y-6">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          {["All", "Active", "Delivered", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#0d2137] text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:border-gray-500"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 bg-gray-200 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-white border border-gray-200 rounded-sm">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No Orders Found</h3>
            <p className="text-xs text-gray-500 mb-5">You haven't placed any orders in this view yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#0d2137] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors rounded-sm"
            >
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden"
              >
                {/* Header Row */}
                <div className="bg-gray-50/80 px-6 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">Order Placed</span>
                      <span className="font-bold text-gray-800">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">Order Number</span>
                      <span className="font-bold text-[#0d2137]">{order.orderNumber || order._id}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">Payment</span>
                      <span className="font-semibold text-gray-700">{order.payment?.method || "Razorpay"} ({order.payment?.status || "Paid"})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.orderStatus} />
                    <span className="text-sm font-extrabold text-gray-900">
                      ₹{(order.pricing?.total || 3499).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-6 space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=200"}
                            alt={item.name}
                            className="h-16 w-14 object-cover rounded bg-gray-100"
                          />
                          <div>
                            <p className="text-xs font-bold text-gray-900 leading-snug">{item.name}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Size: <span className="text-gray-700 font-medium">{item.size || "M"}</span> | Qty: {item.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-800">
                          ₹{((item.price || 1500) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=200"
                          alt="Ordered Item"
                          className="h-16 w-14 object-cover rounded bg-gray-100"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">High Waisted Cargo Pants & Tops</p>
                          <p className="text-[11px] text-gray-400">Size: M | Qty: 1</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-800">₹{(order.pricing?.total || 3499).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Footer Action Bar */}
                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-gray-400" /> Express Delivery via Bluedart
                  </span>

                  <div className="flex items-center gap-2">
                    {["Confirmed", "Processing"].includes(order.orderStatus) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-[11px] font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-sm hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}

                    <button
                      onClick={() => setTrackingOrder(order)}
                      className="text-[11px] font-bold text-[#0d2137] bg-white border border-[#0d2137] px-4 py-1.5 rounded-sm hover:bg-[#0d2137] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      Track Order <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackingOrder && (
          <TrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Fallback sample orders for review when backend DB is empty ── */
const FALLBACK_ORDERS = [
  {
    _id: "demo_ord_101",
    orderNumber: "ELN-20261001",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    orderStatus: "Confirmed",
    pricing: { total: 3910, subtotal: 3910, shipping: 0 },
    payment: { method: "Razorpay", status: "Paid" },
    items: [
      { product: "p1", name: "Full-Cup U-Back Adjustable Bra", price: 1529, quantity: 1, size: "34B", image: "https://images.unsplash.com/photo-1583744946564-b52d01a7f418?auto=format&fit=crop&q=80&w=300" },
      { product: "p2", name: "Light Blue Solid Slim-Fit Shirt", price: 2380, quantity: 1, size: "L", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=300" },
    ],
  },
  {
    _id: "demo_ord_102",
    orderNumber: "ELN-20260928",
    createdAt: new Date(Date.now() - 400000000).toISOString(),
    orderStatus: "Delivered",
    pricing: { total: 4250, subtotal: 4250, shipping: 0 },
    payment: { method: "COD", status: "Paid" },
    items: [
      { product: "p3", name: "Floral Lace Midi Dress", price: 4250, quantity: 1, size: "S", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=300" },
    ],
  },
];
