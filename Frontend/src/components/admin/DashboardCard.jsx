import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * DashboardCard — reusable stat card for the admin dashboard.
 *
 * Props:
 *  title    — stat label e.g. "Total Revenue"
 *  value    — main number/text e.g. "₹2,45,000"
 *  change   — e.g. "+14%" (prefix with + for positive, - for negative)
 *  icon     — Lucide icon component
 *  iconBg   — tailwind class for icon bg color e.g. "bg-blue-50"
 *  iconColor — tailwind class for icon color e.g. "text-blue-600"
 */
export const DashboardCard = ({ title, value, change, icon: Icon, iconBg = "bg-gray-100", iconColor = "text-gray-600" }) => {
  const isPositive = !change?.startsWith("-");
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">
            {value}
          </p>
          {change && (
            <div className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
              <TrendIcon className="h-3 w-3" />
              <span>{change} vs last month</span>
            </div>
          )}
        </div>
        <div className={`h-11 w-11 rounded-sm flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
        </div>
      </div>
    </div>
  );
};
