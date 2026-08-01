import React from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { BarChart2, TrendingUp, ShoppingBag, Users, Package } from "lucide-react";

/* ─── Mini bar chart ─────────────────────────────────────────────────────── */
const MONTHLY = [
  { month: "Jan", revenue: 38, orders: 22 },
  { month: "Feb", revenue: 45, orders: 28 },
  { month: "Mar", revenue: 62, orders: 35 },
  { month: "Apr", revenue: 55, orders: 30 },
  { month: "May", revenue: 78, orders: 44 },
  { month: "Jun", revenue: 90, orders: 52 },
  { month: "Jul", revenue: 100, orders: 60 },
];

const BarChart = ({ data, field, color }) => {
  const max = Math.max(...data.map(d => d[field]));
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className={`w-full rounded-sm ${color} opacity-80 hover:opacity-100 transition-opacity cursor-default`}
            style={{ height: `${(d[field] / max) * 100}%` }}
            title={`${d.month}: ${d[field]}`}
          />
          <span className="text-[10px] text-gray-400 font-medium">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Top Products (placeholder) ────────────────────────────────────────── */
const TOP_PRODUCTS = [
  { name: "Full-Cup U-Back Adjustable Bra", revenue: 48200, units: 32 },
  { name: "Men's Athletic Performance Tee", revenue: 32100, units: 18 },
  { name: "Leaf Embroidered Shaping Bra",   revenue: 26500, units: 14 },
  { name: "Men's Colorblock Geometric",     revenue: 19800, units: 12 },
  { name: "High-Waist Seamless Brief",      revenue: 15200, units: 10 },
];

export const AdminAnalytics = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Analytics" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue",    value: "₹5,38,400", change: "+18%", icon: TrendingUp, color: "text-blue-600",    bg: "bg-blue-50" },
            { label: "Total Orders",     value: "271",        change: "+12%", icon: ShoppingBag,color: "text-amber-600",   bg: "bg-amber-50" },
            { label: "New Customers",    value: "89",         change: "+24%", icon: Users,      color: "text-purple-600",  bg: "bg-purple-50" },
            { label: "Products Listed",  value: "42",         change: "+4",   icon: Package,    color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(({ label, value, change, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-sm p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                  <p className="text-[11px] font-semibold text-emerald-600 mt-1">{change} this month</p>
                </div>
                <div className={`h-10 w-10 rounded-sm flex items-center justify-center ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">Revenue Trend</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Monthly revenue (×₹1k)</p>
            </div>
            <BarChart data={MONTHLY} field="revenue" color="bg-[#0d2137]" />
          </div>
          <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">Order Volume</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Orders placed per month</p>
            </div>
            <BarChart data={MONTHLY} field="orders" color="bg-[#4a6d98]" />
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">Top Products by Revenue</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {TOP_PRODUCTS.map((p, i) => {
              const maxRev = TOP_PRODUCTS[0].revenue;
              return (
                <div key={p.name} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="text-[11px] font-bold text-gray-400 w-5 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{p.name}</p>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0d2137] rounded-full"
                        style={{ width: `${(p.revenue / maxRev) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-bold text-gray-900">₹{p.revenue.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-gray-400">{p.units} units</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
