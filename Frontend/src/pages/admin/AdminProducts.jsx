import React, { useState, useEffect, useRef } from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { productService, categoryService, brandService, uploadService } from "../../services/api.service";
import { Plus, Trash2, Edit, Search, X, Loader2, AlertCircle, Package, Upload, Image as ImageIcon, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const FALLBACK_PRODUCTS = [
  { _id: "1", name: "Full-Cup U-Back Adjustable Bra", gender: "Women", price: 1529, discount: 40, status: "active" },
  { _id: "2", name: "Men's Athletic Performance Grey", gender: "Men",   price: 1799, discount: 27, status: "active" },
  { _id: "3", name: "Leaf Embroidered Shaping Bra",   gender: "Women", price: 1879, discount: 42, status: "active" },
  { _id: "4", name: "Men's Colorblock Geometric",     gender: "Men",   price: 1590, discount: 20, status: "inactive" },
];

const DEFAULT_CATEGORIES = [
  { _id: "tops", name: "Tops & Tees" },
  { _id: "dresses", name: "Dresses" },
  { _id: "bottoms", name: "Bottoms" },
  { _id: "bodysuits", name: "Bodysuits" },
  { _id: "jumpsuits", name: "Jumpsuits" },
  { _id: "lingerie", name: "Lingerie Sets" },
  { _id: "bras", name: "Bras" },
  { _id: "panties", name: "Panties" },
  { _id: "denim", name: "Denim" },
  { _id: "shirts", name: "Shirts" },
  { _id: "swimwear", name: "Swimwear" },
  { _id: "tshirts", name: "T-Shirts" },
  { _id: "shorts", name: "Shorts" },
  { _id: "jeans", name: "Jeans" },
  { _id: "pants", name: "Pants" },
  { _id: "accessories", name: "Accessories" },
];

const DEFAULT_BRANDS = [
  { _id: "brand_elanor", name: "Élanor Essentials" },
  { _id: "brand_luna", name: "Luna Luxe" },
  { _id: "brand_veloura", name: "Veloura" },
  { _id: "brand_silk", name: "Silk & Sage" },
  { _id: "brand_noir", name: "Noir Belle" },
];

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [brands, setBrands] = useState(DEFAULT_BRANDS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    gender: "Women",
    category: "",
    brand: "",
    price: "",
    discount: "0",
    stock: "10",
    imageUrl: "",
    material: "",
    fit: "Regular",
    status: "active",
    isPublished: true,
    isFeatured: false,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ limit: 100 });
      const list = res?.data?.products ?? res?.products ?? res?.data ?? [];
      setProducts(Array.isArray(list) && list.length > 0 ? list : FALLBACK_PRODUCTS);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [catRes, brandRes] = await Promise.allSettled([
        categoryService.getAll(),
        brandService.getAll(),
      ]);
      if (catRes.status === "fulfilled") {
        const catList = catRes.value?.data?.categories ?? catRes.value?.categories ?? catRes.value?.data ?? [];
        setCategories(catList.length ? catList : DEFAULT_CATEGORIES);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
      if (brandRes.status === "fulfilled") {
        const brandList = brandRes.value?.data?.brands ?? brandRes.value?.brands ?? brandRes.value?.data ?? [];
        setBrands(brandList.length ? brandList : DEFAULT_BRANDS);
      } else {
        setBrands(DEFAULT_BRANDS);
      }
    } catch (e) {
      console.error("Failed loading category/brand options:", e);
      setCategories(DEFAULT_CATEGORIES);
      setBrands(DEFAULT_BRANDS);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
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

  // Direct Image File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setFormError("");

    try {
      const response = await uploadService.uploadSingle(file, "/products");
      const uploadedUrl = response?.data?.url || response?.url || response?.data?.result?.url || "";

      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("No URL returned from image upload server");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      const msg = err.response?.data?.message || err.message || "Image upload failed";
      toast.error(msg);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Product name must be at least 3 characters";
    }

    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      errors.slug = "Invalid slug format";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    if (!formData.category) {
      errors.category = "Category selection is required";
    }

    if (!formData.brand) {
      errors.brand = "Brand selection is required";
    }

    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.price = "Price must be greater than 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      gender: "Women",
      category: categories[0]?._id || "",
      brand: brands[0]?._id || "",
      price: "",
      discount: "0",
      stock: "10",
      imageUrl: "",
      material: "",
      fit: "Regular",
      status: "active",
      isPublished: true,
      isFeatured: false,
    });
    setValidationErrors({});
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting || uploadingImage) return;
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
      const stockNum = parseInt(formData.stock, 10) || 10;
      const imgUrl = formData.imageUrl.trim() || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500";

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        gender: formData.gender,
        category: formData.category,
        brand: formData.brand,
        price: Number(formData.price),
        discount: Number(formData.discount) || 0,
        currency: "INR",
        material: formData.material.trim(),
        fit: formData.fit,
        status: formData.status,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        images: [{ url: imgUrl, alt: formData.name.trim() }],
        variants: [
          {
            color: { name: "Standard", hex: "#000000" },
            sizes: [{ size: "M", stock: stockNum }],
          },
        ],
      };

      await productService.create(payload);

      toast.success("Product created successfully!");
      handleCloseModal();
      await fetchProducts();
    } catch (err) {
      console.error("Error creating product:", err);
      const apiMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create product";
      setFormError(apiMsg);
      toast.error(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await productService.delete(id);
      toast.success(`Product "${name}" deleted`);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Products" />
      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm"
            />
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-[#0d2137] text-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors rounded-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">
              All Products ({filtered.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Gender</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Discount</th>
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
                      No products found
                    </td>
                  </tr>
                ) : (
                  filtered.map((prod) => (
                    <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-sm bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                            {prod.images?.[0]?.url ? (
                              <img src={prod.images[0].url} alt={prod.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="max-w-[240px]">
                            <p className="font-semibold text-gray-900 text-[13px] truncate">{prod.name}</p>
                            <p className="text-[11px] text-gray-400 font-mono truncate">{prod.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-[12px] text-gray-600">{prod.gender}</td>
                      <td className="px-6 py-3.5 font-bold text-gray-900 text-[13px]">
                        ₹{prod.price?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-3.5 text-[12px] text-gray-500">
                        {prod.discount ? `${prod.discount}%` : "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                          prod.status === "active" || prod.status === "Active" || !prod.status
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}>
                          {prod.status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDelete(prod._id, prod.name)}
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

      {/* ── Add Product Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-sm shadow-xl max-w-xl w-full my-8 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[#0d2137]" />
                <h3 className="text-[14px] font-bold uppercase tracking-[0.1em] text-gray-900">
                  Add New Product
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting || uploadingImage}
                className="p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-sm disabled:opacity-50"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-[12px]">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Full-Cup U-Back Adjustable Bra"
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
                  placeholder="e.g. full-cup-u-back-bra"
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

              {/* Category & Brand row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full border bg-white px-3 py-2 text-[13px] text-gray-800 rounded-sm focus:outline-none ${
                      validationErrors.category ? "border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                    }`}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  {validationErrors.category && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full border bg-white px-3 py-2 text-[13px] text-gray-800 rounded-sm focus:outline-none ${
                      validationErrors.brand ? "border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                    }`}
                  >
                    <option value="">Select Brand...</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                  {validationErrors.brand && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.brand}</p>
                  )}
                </div>
              </div>

              {/* Gender & Fit row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Fit Type
                  </label>
                  <select
                    name="fit"
                    value={formData.fit}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Slim">Slim</option>
                    <option value="Relaxed">Relaxed</option>
                    <option value="Oversized">Oversized</option>
                  </select>
                </div>
              </div>

              {/* Price, Discount & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="1999"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full border px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none ${
                      validationErrors.price ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                    }`}
                  />
                  {validationErrors.price && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.price}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    placeholder="20"
                    value={formData.discount}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    placeholder="10"
                    value={formData.stock}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Detailed description of the product material, design, comfort, and luxury features..."
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full border px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 rounded-sm focus:outline-none ${
                    validationErrors.description ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#4a6d98]"
                  }`}
                />
                {validationErrors.description && (
                  <p className="text-[11px] text-red-500 mt-1">{validationErrors.description}</p>
                )}
              </div>

              {/* ── Product Image: Direct Upload & Thumbnail Preview ── */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Product Image
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                />

                {/* Upload Box or Image Preview */}
                {formData.imageUrl ? (
                  <div className="relative border border-gray-200 rounded-sm p-3 bg-gray-50 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-sm bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={formData.imageUrl} alt="Uploaded product preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                        <CheckCircle className="h-4 w-4" /> Image Ready
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">{formData.imageUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-sm p-5 text-center cursor-pointer transition-colors ${
                      uploadingImage
                        ? "border-[#4a6d98] bg-[#4a6d98]/5 cursor-wait"
                        : "border-gray-300 hover:border-[#0d2137] bg-gray-50 hover:bg-gray-100/60"
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center space-y-2 py-2">
                        <Loader2 className="h-6 w-6 text-[#0d2137] animate-spin" />
                        <p className="text-[12px] font-semibold text-gray-700">Uploading image to server...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <p className="text-[13px] font-semibold text-gray-800">
                          Click to select image file from computer
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Supports PNG, JPG, WEBP, AVIF (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional manual URL input fallback */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Or enter URL:</span>
                  <input
                    type="text"
                    name="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    disabled={submitting || uploadingImage}
                    className="flex-1 border border-gray-300 px-2.5 py-1 text-[12px] text-gray-800 placeholder-gray-400 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                  />
                </div>
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
                  className="w-full border border-gray-300 bg-[#ffffff] px-3 py-2 text-[13px] text-gray-800 rounded-sm focus:border-[#4a6d98] focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive / Draft</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting || uploadingImage}
                  className="px-4 py-2 text-[12px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors rounded-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
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
                      Create Product
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
