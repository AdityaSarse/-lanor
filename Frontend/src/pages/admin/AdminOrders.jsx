import React, { useState, useEffect } from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { orderService } from "../../services/api.service";
import { Search, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

/* ─── Fallback data ───────────────────────────────────────────────────────── */
const FALLBACK_ORDERS = [
  { _id: "1", orderNumber: "ORD-2026-1001", createdAt: new Date().toISOString(), orderStatus: "Confirmed",  payment: { method: "Razorpay", status: "Paid" },  pricing: { total: 4599 } },
  { _id: "2", orderNumber: "ORD-2026-1002", createdAt: new Date().toISOString(), orderStatus: "Delivered",  payment: { method: "Razorpay", status: "Paid" },  pricing: { total: 2899 } },
  { _id: "3", orderNumber: "ORD-2026-1003", createdAt: new Date().toISOString(), orderStatus: "Pending",    payment: { method: "COD",      status: "Pending" }, pricing: { total: 7250 } },
  { _id: "4", orderNumber: "ORD-2026-1004", createdAt: new Date().toISOString(), orderStatus: "Cancelled",  payment: { method: "Razorpay", status: "Refunded" },pricing: { total: 1999 } },
  { _id: "5", orderNumber: "ORD-2026-1005", createdAt: new Date().toISOString(), orderStatus: "Processing", payment: { method: "Razorpay", status: "Paid" },  pricing: { total: 5499 } },
];

/* ─── Status Badge ────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    Confirmed:  { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-100" },
    Delivered:  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
    Cancelled:  { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-100" },
    Pending:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100" },
    Processing: { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-100" },
  };
  const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
      {status}
    </span>
  );
};

/* ─── Payment Badge ───────────────────────────────────────────────────────── */
const PaymentBadge = ({ status }) => {
  const map = {
    Paid:     "bg-emerald-50 text-emerald-700 border-emerald-100",
    Pending:  "bg-amber-50 text-amber-700 border-amber-100",
    Refunded: "bg-gray-100 text-gray-600 border-gray-200",
    Failed:   "bg-red-50 text-red-600 border-red-100",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {status}
    </span>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   ADMIN ORDERS
════════════════════════════════════════════════════════════════════════════ */
export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    orderService
      .getMyOrders({ limit: 200 })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : (res?.data?.orders ?? res?.orders ?? []);
        setOrders(list.length ? list : FALLBACK_ORDERS);
      })
      .catch(() => setOrders(FALLBACK_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, orderNumber, newStatus) => {
    try {
      await orderService.updateStatus(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success(`Order ${orderNumber} → ${newStatus}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Status update failed";
      toast.error(msg);
    }
  };

  const filtered = orders.filter((o) =>
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.orderStatus?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Orders" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm"
            />
          </div>
          {/* Quick stats */}
          <div className="flex items-center gap-3 text-[12px] text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              {orders.filter(o => o.orderStatus === "Pending").length} Pending
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              {orders.filter(o => o.orderStatus === "Delivered").length} Delivered
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5 text-red-400" />
              {orders.filter(o => o.orderStatus === "Cancelled").length} Cancelled
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">
              All Orders ({filtered.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Gateway</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-gray-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filtered.map((ord) => (
                    <tr key={ord._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-gray-900 text-[13px]">
                        {ord.orderNumber}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 text-[12px]">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-[12px] text-gray-600 font-medium">
                        {ord.payment?.method ?? "—"}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-gray-900 text-[13px]">
                        ₹{ord.pricing?.total?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-3.5">
                        <PaymentBadge status={ord.payment?.status ?? "Pending"} />
                      </td>
                      <td className="px-6 py-3.5">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleStatusChange(ord._id, ord.orderNumber, e.target.value)}
                          className="border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800 rounded focus:outline-none cursor-pointer"
                        >
                          {["Pending", "Confirmed", "Packed", "Shipped", "Out For Delivery", "Delivered", "Cancelled"].map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => toast.info(`Viewing details for ${ord.orderNumber}`)}
                          className="p-1.5 text-gray-400 hover:text-[#0d2137] transition-colors cursor-pointer rounded-sm hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
