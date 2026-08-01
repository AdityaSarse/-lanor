import React, { useState, useEffect } from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { categoryService } from "../../services/category.service";
import { Tag, Plus, Search, X, Loader2, AlertCircle, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const FALLBACK_CATEGORIES = [
  { _id: "1", name: "Bras",             slug: "bras",             productCount: 24, status: "active" },
  { _id: "2", name: "Briefs",           slug: "briefs",           productCount: 18, status: "active" },
  { _id: "3", name: "Boxers",           slug: "boxers",           productCount: 12, status: "active" },
  { _id: "4", name: "Sports",           slug: "sports",           productCount: 9,  status: "active" },
  { _id: "5", name: "Shapewear",        slug: "shapewear",        productCount: 6,  status: "inactive" },
  { _id: "6", name: "Thermal Innerwear",slug: "thermal-innerwear",productCount: 3,  status: "inactive" },
];

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
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
    description: "",
    status: "active",
    imageUrl: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Helper: Slugify string
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Fetch Categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAll();
      const list = response?.data?.categories ?? response?.categories ?? response?.data ?? [];
      setCategories(Array.isArray(list) && list.length > 0 ? list : FALLBACK_CATEGORIES);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories(FALLBACK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Form change handler with auto-slug generation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto generate slug when name changes if user hasn't manually edited slug separately
      if (name === "name") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });

    // Clear validation error for field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setFormError("");
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Category name must be at least 2 characters";
    }

    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.imageUrl.trim() && !/^https?:\/\/.+/.test(formData.imageUrl.trim())) {
      errors.imageUrl = "Image URL must start with http:// or https://";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open & Close Modal handlers
  const handleOpenModal = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      status: "active",
      imageUrl: "",
    });
    setValidationErrors({});
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return; // Prevent closing while submitting
    setIsModalOpen(false);
    setFormError("");
    setValidationErrors({});
  };

  // Form Submit Handler (frontend ↔ backend integration)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      if (formData.imageUrl.trim()) {
        payload.image = { url: formData.imageUrl.trim(), alt: formData.name.trim() };
      }

      await categoryService.createCategory(payload);

      // Success flow
      toast.success("Category created successfully!");
      handleCloseModal();
      await fetchCategories(); // In-place refresh without page reload
    } catch (err) {
      console.error("Error creating category:", err);
      const apiMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create category";
      setFormError(apiMsg);
      toast.error(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await categoryService.delete(id);
      toast.success(`Category "${name}" deleted`);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Categories" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm"
            />
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-[#0d2137] text-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors rounded-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">
              All Categories ({filtered.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Category Name</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[13px] text-gray-400">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-sm bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {cat.image?.url ? (
                              <img src={cat.image.url} alt={cat.name} className="h-full w-full object-cover rounded-sm" />
                            ) : (
                              <Tag className="h-3.5 w-3.5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 text-[13px]">{cat.name}</span>
                            {cat.description && (
                              <p className="text-[11px] text-gray-400 max-w-xs truncate">{cat.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-[12px] text-gray-500 font-mono">{cat.slug}</td>
                      <td className="px-6 py-3.5 text-[13px] font-semibold text-gray-700">
                        {cat.productCount ?? cat.productsCount ?? 0}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                          cat.status === "active" || cat.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}>
                          {cat.status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDelete(cat._id, cat.name)}
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

      {/* ── Add Category Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-gray-200 rounded-sm shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#0d2137]" />
                <h3 className="text-[14px] font-bold uppercase tracking-[0.1em] text-gray-900">
                  Add New Category
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
              {/* Form level error banner */}
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-[12px]">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Lingerie & Innerwear"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full border px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none ${
                    validationErrors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-[#4a6d98]"
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
                  placeholder="e.g. lingerie-innerwear"
                  value={formData.slug}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full border px-3 py-2 text-[13px] font-mono text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none ${
                    validationErrors.slug
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-[#4a6d98]"
                  }`}
                />
                {validationErrors.slug && (
                  <p className="text-[11px] text-red-500 mt-1">{validationErrors.slug}</p>
                )}
              </div>

              {/* Description field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Brief description of category..."
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                />
              </div>

              {/* Image URL field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Image URL <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="https://example.com/category-image.jpg"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full border px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none ${
                    validationErrors.imageUrl
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-[#4a6d98]"
                  }`}
                />
                {validationErrors.imageUrl && (
                  <p className="text-[11px] text-red-500 mt-1">{validationErrors.imageUrl}</p>
                )}
              </div>

              {/* Status field */}
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
                      Create Category
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
