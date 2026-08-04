import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, ChevronLeft, ChevronRight, Check,
  Truck, RotateCcw, Share2, Minus, Plus, ChevronDown, Ruler
} from "lucide-react";
import { productService } from "../../services/api.service";
import { useCartStore } from "../../store/useCartStore";
import { ProductCard } from "../../components/customer/ProductCard";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const FALLBACK = {
  _id: "demo",
  name: "High Waisted Wide Leg Cargo Pants",
  gender: "Women",
  description:
    "Crafted from premium stretch-cotton blend with functional cargo pockets. Features a wide leg silhouette, elasticated waistband, and a relaxed contemporary fit perfect for everyday styling.",
  price: 3910,
  discount: 15,
  images: [
    { url: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&q=80&w=900" },
    { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900" },
    { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=900" },
    { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900" },
  ],
  variants: [
    { color: { name: "Heather Beige", hex: "#c9b99a" }, sizes: SIZES.map(s => ({ size: s })) },
    { color: { name: "Slate Grey", hex: "#7a8a99" }, sizes: SIZES.map(s => ({ size: s })) },
    { color: { name: "Midnight Navy", hex: "#0d2137" }, sizes: SIZES.map(s => ({ size: s })) },
  ],
};

const RELATED = [
  { _id: "r1", name: "Vintage Wide Leg Denim", gender: "Women", price: 3980, discount: 20, images: [{ url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "r2", name: "Ruched Off-Shoulder Bodysuit", gender: "Women", price: 2049, discount: 21, images: [{ url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "r3", name: "Floral Lace Midi Dress", gender: "Women", price: 4250, discount: 30, images: [{ url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "r4", name: "Tied Short Sleeve Bodysuit", gender: "Women", price: 2080, discount: 23, images: [{ url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4d4f?auto=format&fit=crop&q=80&w=600" }, { url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=600" }] },
];

/* ── Collapsible accordion row ── */
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between py-3.5 text-[13px] font-semibold text-gray-800 cursor-pointer"
      >
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-[12px] text-gray-500 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore(s => s.addToCart);

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeImg, setActiveImg]   = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize]   = useState("");
  const [qty, setQty]               = useState(1);
  const [added, setAdded]           = useState(false);
  const [sizeErr, setSizeErr]       = useState(false);
  const [sticky, setSticky]         = useState(false);
  const infoRef = useRef(null);

  /* Sticky bottom bar trigger */
  useEffect(() => {
    const onScroll = () => {
      if (infoRef.current) {
        const rect = infoRef.current.getBoundingClientRect();
        setSticky(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setLoading(true);
    productService.getById(id)
      .then(res => {
        const prod = res.data?.product || res.data?.data || (res.data?._id ? res.data : null) || res.product;
        setProduct(prod || FALLBACK);
      })
      .catch(() => setProduct(FALLBACK))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeErr(true); return; }
    setSizeErr(false);
    addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: product.variants?.[selectedColor]?.color || { name: "Default" },
      image: product.images?.[0]?.url,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeErr(true); return; }
    handleAddToCart();
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded" />
          <div className="space-y-4 pt-4">
            <div className="h-5 bg-gray-200 rounded w-2/3" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="py-24 text-center text-gray-400 font-logo italic text-xl">Product not found.</div>
  );

  const originalPrice = product.discount > 0
    ? Math.round(product.price * (100 / (100 - product.discount)))
    : null;

  const images = product.images || [];
  const variants = product.variants || [];
  const activeColor = variants[selectedColor]?.color;
  const availSizes = variants[selectedColor]?.sizes?.map(s => s.size) || SIZES;

  return (
    <div className="bg-white min-h-screen">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-[1400px] px-6 py-2.5 lg:px-10">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-gray-700 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium line-clamp-1 max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">

          {/* ── LEFT: Image Gallery ── */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
              {images.map((img, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-[3/4] w-full overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImg === i ? "border-[#0d2137]" : "border-gray-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover object-center" />
                </motion.button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative overflow-hidden bg-gray-100 aspect-[3/4] group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={images[activeImg]?.url}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full object-cover object-center"
                />
              </AnimatePresence>

              {/* Image nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center bg-white/80 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center bg-white/80 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-700" />
                  </button>
                </>
              )}

              {/* Mobile thumbnail dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${i === activeImg ? "w-5 bg-[#0d2137]" : "w-1.5 bg-gray-400"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div ref={infoRef} className="flex flex-col gap-4">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-[22px] sm:text-[26px] font-bold text-gray-900 leading-snug"
            >
              {product.name}
            </motion.h1>

            {/* Coupon Banner */}
            <div className="flex items-stretch rounded overflow-hidden border border-orange-200">
              <div className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5">
                <p className="text-[13px] font-bold text-white">{product.discount}% OFF</p>
                <p className="text-[11px] text-white/80">Code: SALE20</p>
              </div>
              <button className="bg-white px-5 text-[12px] font-bold text-orange-500 border-l-2 border-dashed border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer">
                GET
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-[22px] font-bold text-gray-900">
                ₹{product.price?.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-[15px] text-gray-400 line-through">
                  ₹{originalPrice?.toLocaleString()}
                </span>
              )}
              {product.discount > 0 && (
                <span className="save-badge">Save {product.discount}%</span>
              )}
            </div>

            {/* Color */}
            {variants.length > 0 && (
              <div>
                <p className="text-[12px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Color: <span className="font-normal normal-case">{activeColor?.name}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedColor(i); setSelectedSize(""); }}
                      className={`px-4 py-1.5 text-[12px] font-semibold border-2 transition-all cursor-pointer rounded-sm ${
                        selectedColor === i
                          ? "bg-[#0d2137] text-white border-[#0d2137]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {v.color?.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider">Size</p>
                <button className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                  <Ruler className="h-3.5 w-3.5" /> Size Chart
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(availSizes.length ? availSizes : SIZES).map(sz => (
                  <motion.button
                    key={sz}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => { setSelectedSize(sz); setSizeErr(false); }}
                    className={`h-9 min-w-[44px] px-3 text-[12px] font-semibold border-2 transition-all cursor-pointer rounded-sm ${
                      selectedSize === sz
                        ? "bg-[#0d2137] text-white border-[#0d2137]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {sz}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {sizeErr && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 text-[11px] text-red-500 font-medium"
                  >
                    Please select a size to continue.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider mb-2">Quantity</p>
              <div className="flex items-center border border-gray-300 w-fit rounded-sm overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-[13px] font-semibold text-gray-900 border-x border-gray-300 h-9 flex items-center justify-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className={`flex w-full items-center justify-center gap-2 border-2 py-3.5 text-[13px] font-bold uppercase tracking-[0.1em] transition-all cursor-pointer ${
                  added
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-[#0d2137] bg-white text-[#0d2137] hover:bg-gray-50"
                }`}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" /> Added to Cart!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      Add To Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="flex w-full items-center justify-center gap-2 bg-[#0d2137] py-3.5 text-[13px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#1a3a5c] transition-colors cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" /> BUY IT NOW
              </motion.button>
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
              <span className="text-[11px] text-gray-400 font-medium">share this:</span>
              {["Facebook", "Twitter", "Pinterest"].map(s => (
                <button key={s} className="text-[11px] text-gray-500 hover:text-[#0d2137] transition-colors cursor-pointer">
                  {s[0]}
                </button>
              ))}
            </div>

            {/* Delivery perks */}
            <div className="rounded bg-[#f7f7f7] px-4 py-3 space-y-2.5 border border-gray-200">
              <div className="flex items-center gap-3 text-[12px] text-gray-600">
                <Truck className="h-4 w-4 text-[#4a6d98] shrink-0" />
                <span>Free shipping on orders over ₹2,000</span>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-gray-600">
                <RotateCcw className="h-4 w-4 text-[#4a6d98] shrink-0" />
                <span>Easy 30-day returns & free exchanges</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="pt-1">
              <Accordion title="Product Details" defaultOpen>
                {product.description || "Premium quality fabric with exceptional comfort and fit. Designed for the modern lifestyle."}
              </Accordion>
              <Accordion title="Size & Fit">
                This item fits true to size. We recommend selecting your standard size. Model is 5'9&quot; and wearing size S.
              </Accordion>
              <Accordion title="Shipping & Returns">
                Orders ship within 1-3 business days. Free standard shipping on orders over ₹2,000. Returns accepted within 30 days of delivery.
              </Accordion>
              <Accordion title="Care Instructions">
                Machine wash cold on gentle cycle. Tumble dry low. Do not bleach. Iron on low heat if needed.
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <AnimatePresence>
        {sticky && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl"
          >
            <div className="mx-auto max-w-[1400px] px-6 py-3 flex items-center gap-4">
              <img
                src={images[0]?.url}
                alt={product.name}
                className="h-12 w-10 object-cover object-center shrink-0 rounded-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                <p className="text-[12px] text-gray-500">₹{product.price?.toLocaleString()}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="shrink-0 bg-[#0d2137] text-white px-8 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors cursor-pointer"
              >
                {added ? "✓ Added!" : "Add To Cart"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── You Might Also Like ── */}
      <section className="border-t border-gray-200 bg-[#f7f7f7] py-14">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <h2 className="text-center text-[22px] font-bold tracking-[0.1em] text-gray-900 uppercase mb-8">
            YOU MIGHT ALSO LIKE
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {RELATED.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
