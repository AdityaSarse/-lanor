import React, { useState } from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { Save, Store, Mail, Phone, Globe, MapPin, Shield } from "lucide-react";

export const AdminSettings = () => {
  const [form, setForm] = useState({
    storeName: "Élanor",
    storeEmail: "support@elanor.in",
    storePhone: "+91 98765 43210",
    storeUrl: "https://www.elanor.in",
    address: "Mumbai, Maharashtra, India",
    currency: "INR",
    timezone: "Asia/Kolkata",
    emailNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputCls = "w-full border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm";
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5";

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Settings" />

      <div className="flex-1 p-6 max-w-[800px] w-full mx-auto space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Store Info */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <Store className="h-4 w-4 text-gray-400" />
              <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">Store Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Store Name</label>
                <input name="storeName" value={form.storeName} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className={inputCls}>
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  <Mail className="inline h-3 w-3 mr-1" />Store Email
                </label>
                <input name="storeEmail" type="email" value={form.storeEmail} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>
                  <Phone className="inline h-3 w-3 mr-1" />Store Phone
                </label>
                <input name="storePhone" value={form.storePhone} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>
                  <Globe className="inline h-3 w-3 mr-1" />Website URL
                </label>
                <input name="storeUrl" value={form.storeUrl} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Timezone</label>
                <select name="timezone" value={form.timezone} onChange={handleChange} className={inputCls}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (ET)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>
                  <MapPin className="inline h-3 w-3 mr-1" />Address
                </label>
                <input name="address" value={form.address} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <Shield className="h-4 w-4 text-gray-400" />
              <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">Notifications</h3>
            </div>
            <div className="p-6 space-y-4">
              {[
                { name: "emailNotifications", label: "Email Notifications",  desc: "Receive email updates for important events" },
                { name: "orderAlerts",         label: "New Order Alerts",     desc: "Get notified when a new order is placed" },
                { name: "lowStockAlerts",      label: "Low Stock Alerts",     desc: "Alert when a product stock falls below 5 units" },
              ].map(({ name, label, desc }) => (
                <label key={name} className="flex items-start justify-between gap-4 cursor-pointer group">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 group-hover:text-gray-900">{label}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      name={name}
                      checked={form[name]}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-checked:bg-[#0d2137] rounded-full transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center justify-between">
            {saved && (
              <span className="text-[12px] font-semibold text-emerald-600">
                ✓ Settings saved successfully
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#0d2137] text-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors rounded-sm cursor-pointer"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
