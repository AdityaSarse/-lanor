import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X, Search } from "lucide-react";
import { ProductCard } from "../../components/customer/ProductCard";
import { productService } from "../../services/api.service";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Selling", value: "bestselling" },
];

const GENDER_TABS = ["All", "Women", "Men", "Unisex"];

const FALLBACK_PRODUCTS = [
  { _id: "f1", name: "Ruched Off-The-Shoulder Bodysuit Top", gender: "Women", price: 2049, discount: 21, images: [{ url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f2", name: "Women's Satin Cowl-Neck Sleeveless Cami Top", gender: "Women", price: 1890, discount: 25, images: [{ url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f3", name: "Women's Lace Trim Corset Bustier Crop Top", gender: "Women", price: 2150, discount: 30, images: [{ url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f4", name: "Women's Ribbed Square-Neck Knit Tank Top", gender: "Women", price: 1450, discount: 20, images: [{ url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f5", name: "Women's Draped One-Shoulder Asymmetric Top", gender: "Women", price: 2350, discount: 18, images: [{ url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f6", name: "Casual Frayed Wide-Leg Jeans", gender: "Women", price: 3320, discount: 16, images: [{ url: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f7", name: "Vintage Wide Leg Denim Pants", gender: "Women", price: 3980, discount: 0, images: [{ url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f8", name: "Floral Lace Midi Dress", gender: "Women", price: 4250, discount: 30, images: [{ url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f9", name: "Men's Light Blue Solid Slim-Fit Oxford Shirt", gender: "Men", price: 2380, discount: 18, images: [{ url: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f10", name: "Men's Classic Slim-Fit Crisp White Oxford Shirt", gender: "Men", price: 2499, discount: 20, images: [{ url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f11", name: "Women's Ivory Silk Satin Button-Down Shirt", gender: "Women", price: 3250, discount: 25, images: [{ url: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f12", name: "Women's Blue Pinstripe Oversized Poplin Shirt", gender: "Women", price: 2650, discount: 18, images: [{ url: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&q=80&w=600" }] },
];

/* ── grid stagger container ── */
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genderParam = searchParams.get("gender") || "";
  const categoryParam = searchParams.get("category") || "";
  const saleParam = searchParams.get("sale") || "";
  const sortParam  = searchParams.get("sort")   || "featured";
  const searchParam = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState(SORT_OPTIONS.find(s => s.value === sortParam) || SORT_OPTIONS[0]);
  const [activeGender, setActiveGender] = useState(genderParam || "All");
  const [search, setSearch] = useState(searchParam);
  const [searchInput, setSearchInput] = useState(searchParam);

  /* Sync local state when URL params change */
  useEffect(() => {
    setActiveGender(genderParam || "All");
    setSearch(searchParam);
    setSearchInput(searchParam);
    if (sortParam) {
      const match = SORT_OPTIONS.find(s => s.value === sortParam);
      if (match) setActiveSort(match);
    }
  }, [genderParam, searchParam, sortParam]);

  /* page title derived from URL */
  const pageTitle = (() => {
    if (searchParam) return `Search: "${searchParam}"`;
    if (categoryParam) return categoryParam.toUpperCase().replace("-", " ");
    if (saleParam) return "HOT SALE & CLEARANCE";
    if (genderParam === "Women") return "WOMEN'S COLLECTION";
    if (genderParam === "Men") return "MEN'S COLLECTION";
    const sort = searchParams.get("sort");
    if (sort === "newest") return "NEW ARRIVALS";
    return "ALL PRODUCTS";
  })();

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { limit: 100 };
    if (search) params.search = search;
    if (genderParam) params.gender = genderParam;
    if (categoryParam) params.category = categoryParam;

    // Map frontend sort value → backend sort field
    const sortMap = {
      featured:    "-isFeatured",
      newest:      "-createdAt",
      price_asc:   "price",
      price_desc:  "-price",
      bestselling: "-createdAt",
    };
    params.sort = sortMap[activeSort.value] || "-createdAt";

    productService.getAll(params)
      .then(res => {
        let data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.products)
          ? res.products
          : [];

        // Use fallback only when backend returned nothing
        if (data.length === 0) {
          data = [...FALLBACK_PRODUCTS];
          // Apply client-side filters on fallback data
          if (genderParam) data = data.filter(p => p.gender?.toLowerCase() === genderParam.toLowerCase());
          if (categoryParam) {
            const cat = categoryParam.toLowerCase().trim();
            const catSingular = cat.endsWith("s") ? cat.slice(0, -1) : cat;
            data = data.filter(p => {
              const catName = (p.category?.name || "").toLowerCase();
              const catSlug = (p.category?.slug || p.categorySlug || "").toLowerCase();
              const pName = (p.name || "").toLowerCase();
              return catName.includes(cat) || catName.includes(catSingular) ||
                catSlug.includes(cat) || catSlug.includes(catSingular) ||
                pName.includes(cat) || pName.includes(catSingular) ||
                (cat.includes("denim") && (pName.includes("denim") || pName.includes("jean"))) ||
                (cat.includes("swim") && (pName.includes("swim") || pName.includes("trunk"))) ||
                (cat.includes("shirt") && (pName.includes("shirt") || pName.includes("oxford")));
            });
          }
        }

        if (saleParam) data = data.filter(p => p.discount && p.discount > 0);
        if (search) {
          const q = search.toLowerCase();
          data = data.filter(p => p.name?.toLowerCase().includes(q));
        }

        setProducts(data);
      })
      .catch(() => {
        let data = [...FALLBACK_PRODUCTS];
        if (genderParam) data = data.filter(p => p.gender === genderParam);
        if (categoryParam) {
          const cat = categoryParam.toLowerCase().trim();
          const catSingular = cat.endsWith("s") ? cat.slice(0, -1) : cat;
          data = data.filter(p =>
            p.name?.toLowerCase().includes(cat) ||
            p.name?.toLowerCase().includes(catSingular) ||
            (cat.includes("shirt") && p.name?.toLowerCase().includes("shirt")) ||
            cat === "denim"
          );
        }
        if (saleParam) data = data.filter(p => p.discount > 0);
        setProducts(data);
      })
      .finally(() => setLoading(false));
  }, [search, genderParam, categoryParam, saleParam, activeSort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSortSelect = (opt) => {
    setActiveSort(opt);
    setSortOpen(false);
  };

  const handleGenderTab = (g) => {
    setActiveGender(g);
    const sp = new URLSearchParams(searchParams);
    if (g === "All") sp.delete("gender");
    else sp.set("gender", g);
    setSearchParams(sp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  /* breadcrumb segments */
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(genderParam ? [{ label: genderParam === "Women" ? "Women" : "Men", href: `/products?gender=${genderParam}` }] : []),
    ...(searchParam ? [{ label: `Search: "${searchParam}"` }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1400px] px-6 py-2.5 lg:px-10">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-400">
            {breadcrumbs.map((bc, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                {bc.href ? (
                  <Link to={bc.href} className="hover:text-gray-700 transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-gray-700 font-medium">{bc.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Page Title ── */}
      <div className="bg-white border-b border-gray-200 py-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[28px] font-bold tracking-[0.1em] text-gray-900 uppercase"
        >
          {pageTitle}
        </motion.h1>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8">
        {/* ── Controls Row ── */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-end">

          <div className="flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-44 pl-8 pr-3 py-1.5 text-xs border border-gray-300 bg-white rounded focus:outline-none focus:border-[#4a6d98] text-gray-700 placeholder-gray-400"
              />
            </form>

            {/* Sort */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setSortOpen(o => !o)}
                className="flex items-center gap-1.5 border border-gray-300 bg-white rounded px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
              >
                Sort by &nbsp;<span className="font-semibold">{activeSort.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </motion.button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-lg z-20 rounded"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleSortSelect(opt)}
                        className={`block w-full text-left px-4 py-2.5 text-[12px] transition-colors cursor-pointer ${
                          activeSort.value === opt.value
                            ? "bg-[#f0f0f0] font-semibold text-[#0d2137]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Product count */}
        {!loading && (
          <p className="text-[11px] text-gray-400 mb-5">
            {products.length} product{products.length !== 1 ? "s" : ""}
            {activeGender !== "All" ? ` in ${activeGender}` : ""}
          </p>
        )}

        {/* ── Product Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array(8).fill(null).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[3/4] bg-gray-200 animate-pulse rounded" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center"
          >
            <p className="text-2xl font-logo italic text-gray-400 mb-4">No products found</p>
            <button
              onClick={() => { setSearch(""); setSearchInput(""); setActiveGender("All"); }}
              className="text-sm text-[#4a6d98] underline underline-offset-4 cursor-pointer"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`${activeGender}-${activeSort.value}-${search}`}
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4"
          >
            {products.map(product => (
              <motion.div key={product._id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Click outside to close sort */}
      {sortOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
      )}
    </div>
  );
};
