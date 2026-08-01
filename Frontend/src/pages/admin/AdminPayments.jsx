import React from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { CreditCard, Search, Download } from "lucide-react";

const FALLBACK_PAYMENTS = [
  { _id: "1", txnId: "pay_Oz9X1mKa2bL3cD", orderNumber: "ORD-2026-1001", method: "Razorpay", amount: 4599, status: "Captured", date: "2026-07-28" },
  { _id: "2", txnId: "pay_Pq8W2nLb3cM4dE", orderNumber: "ORD-2026-1002", method: "Razorpay", amount: 2899, status: "Captured", date: "2026-07-27" },
  { _id: "3", txnId: "—",                   orderNumber: "ORD-2026-1003", method: "COD",      amount: 7250, status: "Pending",  date: "2026-07-26" },
  { _id: "4", txnId: "pay_Rr7V3oMc4dN5eF", orderNumber: "ORD-2026-1004", method: "Razorpay", amount: 1999, status: "Refunded", date: "2026-07-25" },
  { _id: "5", txnId: "pay_Ss6U4pNd5eO6fG", orderNumber: "ORD-2026-1005", method: "Razorpay", amount: 5499, status: "Captured", date: "2026-07-24" },
];

const StatusBadge = ({ status }) => {
  const map = {
    Captured: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Pending:  "bg-amber-50 text-amber-700 border-amber-100",
    Refunded: "bg-gray-100 text-gray-600 border-gray-200",
    Failed:   "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${map[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
};

export const AdminPayments = () => {
  const [search, setSearch] = React.useState("");
  const filtered = FALLBACK_PAYMENTS.filter((p) =>
    p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.txnId.toLowerCase().includes(search.toLowerCase())
  );

  const totalCaptured = FALLBACK_PAYMENTS
    .filter(p => p.status === "Captured")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Payments" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Captured", value: `₹${totalCaptured.toLocaleString("en-IN")}`, color: "text-emerald-600" },
            { label: "Pending",        value: FALLBACK_PAYMENTS.filter(p => p.status === "Pending").length,  color: "text-amber-600" },
            { label: "Refunded",       value: FALLBACK_PAYMENTS.filter(p => p.status === "Refunded").length, color: "text-gray-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
              <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order or transaction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm"
            />
          </div>
          <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 text-[12px] font-semibold hover:bg-gray-50 transition-colors rounded-sm cursor-pointer">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">
              Payment Ledger ({filtered.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Transaction ID</th>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((pay) => (
                  <tr key={pay._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-[12px] text-gray-600">{pay.txnId}</td>
                    <td className="px-6 py-3.5 font-semibold text-gray-900 text-[13px]">{pay.orderNumber}</td>
                    <td className="px-6 py-3.5 text-[12px]">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                        {pay.method}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-gray-900 text-[13px]">
                      ₹{pay.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3.5 text-[12px] text-gray-500">{pay.date}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={pay.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
