import React, { useState, useEffect } from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { brandService } from "../../services/brand.service";
import { Award, Plus, Search, X, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FALLBACK_BRANDS = [
  { _id: "1", name: "Élanor",      slug: "elanor",      productCount: 42, country: "India",  status: "active" },
  { _id: "2", name: "Vionellae",   slug: "vionellae",   productCount: 18, country: "France", status: "active" },
  { _id: "3", name: "Luxara",      slug: "luxara",      productCount: 11, country: "Italy",  status: "active" },
  { _id: "4", name: "PureForm",    slug: "pureform",    productCount: 7,  country: "India",  status: "inactive" },
  { _id: "5", name: "ActiveEdge",  slug: "activeedge",  productCount: 5,  country: "USA",    status: "active" },
];

export const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    country: "",
    website: "",
    description: "",
    logoUrl: "",
    status: "active",
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Auto slugify helper
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Fetch Brands from API
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await brandService.getAll();
      const list = response?.data?.brands ?? response?.brands ?? response?.data ?? [];
      setBrands(Array.isArray(list) && list.length > 0 ? list : FALLBACK_BRANDS);
    } catch (err) {
      console.error("Failed to load brands:", err);
      setBrands(FALLBACK_BRANDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "name") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setFormError("");
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Brand name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Brand name must be at least 2 characters";
    }

    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.logoUrl.trim() && !/^https?:\/\/.+/.test(formData.logoUrl.trim())) {
      errors.logoUrl = "Logo URL must start with http:// or https://";
    }

    if (formData.website.trim() && !/^https?:\/\/.+/.test(formData.website.trim())) {
      errors.website = "Website URL must start with http:// or https://";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = () => {
    setFormData({
      name: "",
      slug: "",
      country: "",
      website: "",
      description: "",
      logoUrl: "",
      status: "active",
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
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        country: formData.country.trim(),
        website: formData.website.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      if (formData.logoUrl.trim()) {
        payload.logo = { url: formData.logoUrl.trim(), alt: formData.name.trim() };
      }

      await brandService.createBrand(payload);

      toast.success("Brand created successfully!");
      handleCloseModal();
      await fetchBrands(); // In-place refresh
    } catch (err) {
      console.error("Error creating brand:", err);
      const apiMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create brand";
      setFormError(apiMsg);
      toast.error(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete brand "${name}"?`)) return;
    try {
      await brandService.delete(id);
      toast.success(`Brand "${name}" deleted`);
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete brand");
    }
  };

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Brands" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm"
            />
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-[#0d2137] text-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors rounded-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Brand
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">
              All Brands ({filtered.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Brand Name</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Country</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[13px] text-gray-400">
                      No brands found
                    </td>
                  </tr>
                ) : (
                  filtered.map((brand) => (
                    <tr key={brand._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-sm bg-[#0d2137]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {brand.logo?.url ? (
                              <img src={brand.logo.url} alt={brand.name} className="h-full w-full object-cover rounded-sm" />
                            ) : (
                              <Award className="h-3.5 w-3.5 text-[#0d2137]" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 text-[13px]">{brand.name}</span>
                            {brand.website && (
                              <a href={brand.website} target="_blank" rel="noreferrer" className="block text-[11px] text-[#4a6d98] hover:underline">
                                {brand.website.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-[12px] text-gray-500 font-mono">{brand.slug}</td>
                      <td className="px-6 py-3.5 text-[12px] text-gray-600">{brand.country || "—"}</td>
                      <td className="px-6 py-3.5 text-[13px] font-semibold text-gray-700">
                        {brand.productCount ?? brand.productsCount ?? 0}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                          brand.status === "active" || brand.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}>
                          {brand.status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDelete(brand._id, brand.name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer rounded-sm hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Add Brand Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-gray-200 rounded-sm shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[#0d2137]" />
                <h3 className="text-[14px] font-bold uppercase tracking-[0.1em] text-gray-900">
                  Add New Brand
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

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-[12px]">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Vionellae Paris"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full border px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none ${
                    validationErrors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-[11px] text-red-500 mt-1">{validationErrors.name}</p>
                )}
              </div>

              {/* Slug field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  placeholder="e.g. vionellae-paris"
                  value={formData.slug}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full border px-3 py-2 text-[13px] font-mono text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none ${
                    validationErrors.slug ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                  }`}
                />
                {validationErrors.slug && (
                  <p className="text-[11px] text-red-500 mt-1">{validationErrors.slug}</p>
                )}
              </div>

              {/* Country & Website row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="e.g. France"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    placeholder="https://vionellae.com"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full border px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none ${
                      validationErrors.website ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                    }`}
                  />
                  {validationErrors.website && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.website}</p>
                  )}
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Logo URL <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="logoUrl"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full border px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none ${
                    validationErrors.logoUrl ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                  }`}
                />
                {validationErrors.logoUrl && (
                  <p className="text-[11px] text-red-500 mt-1">{validationErrors.logoUrl}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Brief description of brand heritage..."
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Modal Actions */}
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
                      Create Brand
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
