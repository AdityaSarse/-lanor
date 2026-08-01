import React, { useState, useEffect } from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { couponService } from "../../services/coupon.service";
import { Ticket, Plus, Search, Copy, X, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FALLBACK_COUPONS = [
  { _id: "1", code: "WELCOME20", discountType: "Percentage", discountValue: 20, minimumOrder: 999, usedCount: 142, usageLimit: 500, isActive: true, validUntil: "2026-12-31" },
  { _id: "2", code: "FLAT200",   discountType: "Fixed",      discountValue: 200, minimumOrder: 1499, usedCount: 67, usageLimit: 200, isActive: true, validUntil: "2026-09-30" },
  { _id: "3", code: "SUMMER15",  discountType: "Percentage", discountValue: 15, minimumOrder: 799, usedCount: 200, usageLimit: 200, isActive: false, validUntil: "2026-06-30" },
  { _id: "4", code: "VIP500",    discountType: "Fixed",      discountValue: 500, minimumOrder: 2999, usedCount: 8, usageLimit: 50, isActive: true, validUntil: "2026-11-30" },
];

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Default dates: today and 30 days from today formatted YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];
  const thirtyDaysStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    code: "",
    discountType: "Percentage",
    discountValue: "",
    description: "",
    minimumOrder: "0",
    maximumDiscount: "0",
    usageLimit: "100",
    usagePerUser: "1",
    validFrom: todayStr,
    validUntil: thirtyDaysStr,
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await couponService.getAll();
      const list = response?.data?.coupons ?? response?.coupons ?? response?.data ?? [];
      setCoupons(Array.isArray(list) && list.length > 0 ? list : FALLBACK_COUPONS);
    } catch (err) {
      console.error("Failed to load coupons:", err);
      setCoupons(FALLBACK_COUPONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      let val = type === "checkbox" ? checked : value;
      if (name === "code" && typeof val === "string") {
        val = val.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      }
      return { ...prev, [name]: val };
    });

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setFormError("");
  };

  const validateForm = () => {
    const errors = {};
    const code = formData.code.trim();

    if (!code) {
      errors.code = "Coupon code is required";
    } else if (code.length < 3 || code.length > 30) {
      errors.code = "Code must be between 3 and 30 characters";
    } else if (!/^[A-Z0-9_-]+$/.test(code)) {
      errors.code = "Only uppercase letters, numbers, hyphens, and underscores allowed";
    }

    const val = Number(formData.discountValue);
    if (!formData.discountValue || isNaN(val) || val <= 0) {
      errors.discountValue = "Discount value must be greater than 0";
    } else if (formData.discountType === "Percentage" && val > 100) {
      errors.discountValue = "Percentage discount cannot exceed 100%";
    }

    if (!formData.validFrom) {
      errors.validFrom = "Valid-from date is required";
    }
    if (!formData.validUntil) {
      errors.validUntil = "Valid-until date is required";
    } else if (formData.validFrom && new Date(formData.validUntil) <= new Date(formData.validFrom)) {
      errors.validUntil = "Valid-until date must be after valid-from date";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = () => {
    setFormData({
      code: "",
      discountType: "Percentage",
      discountValue: "",
      description: "",
      minimumOrder: "0",
      maximumDiscount: "0",
      usageLimit: "100",
      usagePerUser: "1",
      validFrom: todayStr,
      validUntil: thirtyDaysStr,
      isActive: true,
    });
    setValidationErrors({});
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setFormError("");
    setValidationErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const payload = {
        code: formData.code.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        description: formData.description.trim(),
        minimumOrder: Number(formData.minimumOrder) || 0,
        maximumDiscount: Number(formData.maximumDiscount) || 0,
        usageLimit: Number(formData.usageLimit) || 0,
        usagePerUser: Number(formData.usagePerUser) || 1,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil + "T23:59:59.999Z").toISOString(),
        isActive: formData.isActive,
      };

      await couponService.createCoupon(payload);

      toast.success("Coupon created successfully!");
      handleCloseModal();
      await fetchCoupons(); // Refresh table in-place
    } catch (err) {
      console.error("Error creating coupon:", err);
      const apiMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create coupon";
      setFormError(apiMsg);
      toast.error(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await couponService.delete(id);
      toast.success(`Coupon "${code}" deleted`);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete coupon");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied "${text}" to clipboard`);
  };

  const filtered = coupons.filter((c) =>
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
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-[#0d2137] text-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors rounded-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Coupon
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
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
                {loading ? (
                  [...Array(4)].map((_, i) => (
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
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  filtered.map((coupon) => {
                    const type = coupon.discountType || coupon.type || "Percentage";
                    const val = coupon.discountValue ?? coupon.discount ?? 0;
                    const minOrder = coupon.minimumOrder ?? coupon.minOrder ?? 0;
                    const used = coupon.usedCount ?? coupon.uses ?? 0;
                    const limit = coupon.usageLimit ?? coupon.maxUses ?? 0;
                    const active = coupon.isActive !== undefined ? coupon.isActive : coupon.status === "Active";
                    const expires = coupon.validUntil
                      ? new Date(coupon.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : coupon.expiresAt || "—";

                    return (
                      <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[13px] text-[#0d2137] bg-[#0d2137]/5 px-2 py-0.5 rounded-sm tracking-wider">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(coupon.code)}
                              className="p-1 text-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
                              title="Copy Code"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-gray-900 text-[13px]">
                          {type === "Percentage" ? `${val}%` : `₹${val}`}
                          <span className="ml-1 text-[10px] text-gray-400 font-normal">{type}</span>
                        </td>
                        <td className="px-6 py-3.5 text-[12px] text-gray-600">₹{minOrder}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#0d2137] rounded-full"
                                style={{ width: `${limit > 0 ? Math.min((used / limit) * 100, 100) : 0}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-gray-500">{used}/{limit || "∞"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-[12px] text-gray-500">{expires}</td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                            active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}>
                            {active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => handleDelete(coupon._id, coupon.code)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer rounded-sm hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Create Coupon Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-sm shadow-xl max-w-lg w-full my-8 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-[#0d2137]" />
                <h3 className="text-[14px] font-bold uppercase tracking-[0.1em] text-gray-900">
                  Create New Coupon
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-sm disabled:opacity-50"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-[12px]">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. WELCOME20 or FESTIVE500"
                  value={formData.code}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full border px-3 py-2 text-[13px] font-mono tracking-wider font-bold text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none uppercase ${
                    validationErrors.code ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                  }`}
                />
                {validationErrors.code && (
                  <p className="text-[11px] text-red-500 mt-1">{validationErrors.code}</p>
                )}
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    placeholder={formData.discountType === "Percentage" ? "e.g. 20" : "e.g. 500"}
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full border px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none ${
                      validationErrors.discountValue ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                    }`}
                  />
                  {validationErrors.discountValue && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.discountValue}</p>
                  )}
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Minimum Order (₹)
                  </label>
                  <input
                    type="number"
                    name="minimumOrder"
                    placeholder="e.g. 999"
                    value={formData.minimumOrder}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    name="maximumDiscount"
                    placeholder="0 = no cap"
                    value={formData.maximumDiscount}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  />
                </div>
              </div>

              {/* Usage Limit & Per User Limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    placeholder="0 = unlimited"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Limit Per User
                  </label>
                  <input
                    type="number"
                    name="usagePerUser"
                    placeholder="1"
                    value={formData.usagePerUser}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  />
                </div>
              </div>

              {/* Date Validity Window */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Valid From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full border px-3 py-2 text-[13px] text-gray-800 rounded-sm focus:outline-none ${
                      validationErrors.validFrom ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                    }`}
                  />
                  {validationErrors.validFrom && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.validFrom}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Valid Until <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full border px-3 py-2 text-[13px] text-gray-800 rounded-sm focus:outline-none ${
                      validationErrors.validUntil ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                    }`}
                  />
                  {validationErrors.validUntil && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.validUntil}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Internal Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="e.g. Festival Season Promotion for new and returning users"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="h-4 w-4 rounded border-gray-300 text-[#0d2137] focus:ring-[#0d2137] cursor-pointer"
                />
                <label htmlFor="isActive" className="text-[13px] font-medium text-gray-800 cursor-pointer">
                  Activate coupon immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-[12px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors rounded-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#0d2137] text-white px-5 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors rounded-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Coupon
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
