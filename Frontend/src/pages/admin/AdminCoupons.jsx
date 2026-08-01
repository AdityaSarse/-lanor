import React from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { Ticket, Plus, Search, Copy } from "lucide-react";

const FALLBACK_COUPONS = [
  { _id: "1", code: "WELCOME20",  discount: 20, type: "Percentage", minOrder: 999,  uses: 142, maxUses: 500, status: "Active",   expiresAt: "2026-12-31" },
  { _id: "2", code: "FLAT200",    discount: 200,type: "Flat",       minOrder: 1499, uses: 67,  maxUses: 200, status: "Active",   expiresAt: "2026-09-30" },
  { _id: "3", code: "SUMMER15",   discount: 15, type: "Percentage", minOrder: 799,  uses: 200, maxUses: 200, status: "Expired",  expiresAt: "2026-06-30" },
  { _id: "4", code: "VIP500",     discount: 500,type: "Flat",       minOrder: 2999, uses: 8,   maxUses: 50,  status: "Active",   expiresAt: "2026-11-30" },
];

export const AdminCoupons = () => {
  const [search, setSearch] = React.useState("");
  const filtered = FALLBACK_COUPONS.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Coupons" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupon codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#0d2137] text-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors rounded-sm cursor-pointer">
            <Plus className="h-4 w-4" /> Create Coupon
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">
              All Coupons ({filtered.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Discount</th>
                  <th className="px-6 py-3">Min Order</th>
                  <th className="px-6 py-3">Usage</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[13px] text-[#0d2137] bg-[#0d2137]/5 px-2 py-0.5 rounded-sm tracking-wider">
                          {coupon.code}
                        </span>
                        <button className="p-1 text-gray-300 hover:text-gray-600 transition-colors cursor-pointer">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-gray-900 text-[13px]">
                      {coupon.type === "Percentage" ? `${coupon.discount}%` : `₹${coupon.discount}`}
                      <span className="ml-1 text-[10px] text-gray-400 font-normal">{coupon.type}</span>
                    </td>
                    <td className="px-6 py-3.5 text-[12px] text-gray-600">₹{coupon.minOrder}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0d2137] rounded-full"
                            style={{ width: `${Math.min((coupon.uses / coupon.maxUses) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500">{coupon.uses}/{coupon.maxUses}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[12px] text-gray-500">{coupon.expiresAt}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                        coupon.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="px-3 py-1 text-[11px] font-semibold text-gray-600 hover:text-[#0d2137] hover:bg-gray-100 rounded-sm transition-colors cursor-pointer">Edit</button>
                        <button className="px-3 py-1 text-[11px] font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer">Delete</button>
                      </div>
                    </td>
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
