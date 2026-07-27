import React from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { Card } from "../../components/ui/Card";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";

export const AdminDashboard = () => {
  const stats = [
    { title: "Total Revenue", value: "₹2,45,000", change: "+14%", icon: DollarSign },
    { title: "Total Orders", value: "128", change: "+8%", icon: ShoppingBag },
    { title: "Products", value: "45", change: "+4", icon: Package },
    { title: "Active Customers", value: "892", change: "+22%", icon: Users },
  ];

  return (
    <div className="space-y-6 text-left">
      <AdminHeader title="Overview Dashboard" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{stat.title}</p>
                <h3 className="mt-2 text-2xl font-extrabold text-white">{stat.value}</h3>
                <span className="mt-1 inline-block text-xs font-bold text-emerald-400">{stat.change} vs last month</span>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
                <Icon className="h-6 w-6" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity Logs</h3>
        <div className="space-y-3 text-xs text-zinc-400">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span>Order #ORD-20260726-1001 status updated to <strong className="text-purple-400">Confirmed</strong></span>
            <span>2 mins ago</span>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span>New product <strong className="text-white">Luxury Silk Evening Dress</strong> published</span>
            <span>1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
