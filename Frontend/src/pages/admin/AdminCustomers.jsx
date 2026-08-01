import React from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { Users, Search, Mail } from "lucide-react";

const FALLBACK_CUSTOMERS = [
  { _id: "1", name: "Priya Sharma",  email: "priya.sharma@email.com",  phone: "+91 98765 43210", orders: 8,  totalSpent: 24599, joinedAt: "2026-01-15", status: "Active" },
  { _id: "2", name: "Rahul Mehta",   email: "rahul.mehta@email.com",   phone: "+91 87654 32109", orders: 3,  totalSpent: 8799,  joinedAt: "2026-02-20", status: "Active" },
  { _id: "3", name: "Sneha Patel",   email: "sneha.patel@email.com",   phone: "+91 76543 21098", orders: 14, totalSpent: 51200, joinedAt: "2025-11-05", status: "Active" },
  { _id: "4", name: "Arjun Nair",    email: "arjun.nair@email.com",    phone: "+91 65432 10987", orders: 1,  totalSpent: 1599,  joinedAt: "2026-07-01", status: "Active" },
  { _id: "5", name: "Kavita Reddy",  email: "kavita.reddy@email.com",  phone: "+91 54321 09876", orders: 0,  totalSpent: 0,     joinedAt: "2026-07-20", status: "Inactive" },
];

export const AdminCustomers = () => {
  const [search, setSearch] = React.useState("");
  const filtered = FALLBACK_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Customers" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm"
            />
          </div>
          <p className="text-[12px] text-gray-500">
            <span className="font-bold text-gray-900">{FALLBACK_CUSTOMERS.length}</span> registered customers
          </p>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">
              All Customers ({filtered.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Orders</th>
                  <th className="px-6 py-3">Total Spent</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cust) => (
                  <tr key={cust._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#0d2137] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 select-none">
                          {cust.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-[13px]">{cust.name}</p>
                          <p className="text-[11px] text-gray-400">{cust.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[12px] text-gray-600">{cust.phone}</td>
                    <td className="px-6 py-3.5 font-semibold text-gray-900 text-[13px]">{cust.orders}</td>
                    <td className="px-6 py-3.5 font-bold text-gray-900 text-[13px]">
                      {cust.totalSpent > 0 ? `₹${cust.totalSpent.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-[12px] text-gray-500">{cust.joinedAt}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                        cust.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-[#0d2137] transition-colors cursor-pointer rounded-sm hover:bg-gray-100" title="Send email">
                        <Mail className="h-4 w-4" />
                      </button>
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
