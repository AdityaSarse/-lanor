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
  { _id: "f1", name: "Ruched Off-The-Shoulder Bodysuit", gender: "Women", price: 2049, discount: 21, images: [{ url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f2", name: "Tied Short Sleeve Bodysuit", gender: "Women", price: 2080, discount: 23, images: [{ url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4d4f?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f3", name: "Casual Frayed Wide-Leg Jeans", gender: "Women", price: 3320, discount: 16, images: [{ url: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f4", name: "Vintage Wide Leg Denim Pants", gender: "Women", price: 3980, discount: 0, images: [{ url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f5", name: "Floral Lace Midi Dress", gender: "Women", price: 4250, discount: 30, images: [{ url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f6", name: "High Waisted Cargo Trousers", gender: "Women", price: 2890, discount: 18, images: [{ url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f7", name: "Light Blue Slim-Fit Shirt", gender: "Men", price: 2380, discount: 27, images: [{ url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "f8", name: "Slim Chino Stretch Trousers", gender: "Men", price: 2799, discount: 15, images: [{ url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=600" }] },
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
  const sortParam  = searchParams.get("sort")   || "featured";
  const searchParam = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState(SORT_OPTIONS.find(s => s.value === sortParam) || SORT_OPTIONS[0]);
  const [activeGender, setActiveGender] = useState(genderParam || "All");
  const [search, setSearch] = useState(searchParam);
  const [searchInput, setSearchInput] = useState(searchParam);

  /* page title derived from URL */
  const pageTitle = (() => {
    if (searchParam) return `Search: "${searchParam}"`;
    if (genderParam === "Women") return "WOMEN";
    if (genderParam === "Men") return "MEN";
    const s = searchParams.get("sale");
    if (s) return "SALE";
    const sort = searchParams.get("sort");
    if (sort === "newest") return "NEW ARRIVALS";
    return "ALL PRODUCTS";
  })();

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (activeGender !== "All") params.gender = activeGender;

    productService.getAll(params)
      .then(res => {
        let data = res.data?.products || res.products || FALLBACK_PRODUCTS;
        // client-side sort
        if (activeSort.value === "price_asc") data = [...data].sort((a, b) => a.price - b.price);
        if (activeSort.value === "price_desc") data = [...data].sort((a, b) => b.price - a.price);
        if (activeSort.value === "newest") data = [...data].reverse();
        setProducts(data);
      })
      .catch(() => setProducts(FALLBACK_PRODUCTS))
      .finally(() => setLoading(false));
  }, [search, activeGender, activeSort]);

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
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          {/* Gender tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {GENDER_TABS.map(g => (
              <motion.button
                key={g}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGenderTab(g)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wider border transition-all cursor-pointer ${
                  activeGender === g
                    ? "bg-[#0d2137] text-white border-[#0d2137]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                }`}
              >
                {g.toUpperCase()}
              </motion.button>
            ))}
          </div>

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
