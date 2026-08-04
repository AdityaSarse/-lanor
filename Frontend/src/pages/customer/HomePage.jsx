import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductCard } from "../../components/customer/ProductCard";
import { productService } from "../../services/api.service";
import heroImg from "../../assets/HEROIMAGE.png";
import img1st from "../../assets/1st.png";
import img2nd from "../../assets/2nd.png";
import bgHero2 from "../../assets/BackgroundHero2.png";
import img3rd from "../../assets/3rd.png";
import img4th from "../../assets/4th.png";
import bgB2 from "../../assets/B2.png";
import group5Img from "../../assets/Group 5.png";

/* ─── Fallback product datasets (8 items each for 2 rows of 4 columns) ───── */
const FALLBACK_WOMEN = [
  { _id: "w1", name: "Full-Cup U-Back Adjustable Bra", gender: "Women", price: 1529, discount: 40, images: [{ url: "https://images.unsplash.com/photo-1583744946564-b52d01a7f418?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "w2", name: "Detachable-Strap Adjustable Plus Bra", gender: "Women", price: 1579, discount: 38, images: [{ url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4d4f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "w3", name: "Leaf Embroidered Shaping Bra", gender: "Women", price: 1879, discount: 42, images: [{ url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "w4", name: "Dream Lace Fantasy Push-Up Bra", gender: "Women", price: 1920, discount: 37, images: [{ url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "w5", name: "Silk Satin Nightdress & Robe Set", gender: "Women", price: 2490, discount: 25, images: [{ url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "w6", name: "Contour Shaping Seamless Bodysuit", gender: "Women", price: 2100, discount: 30, images: [{ url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "w7", name: "Wireless Soft Comfort Bralette", gender: "Women", price: 1350, discount: 20, images: [{ url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "w8", name: "Floral Lace Premium Bustier Corset", gender: "Women", price: 2799, discount: 35, images: [{ url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600" }] },
];

const FALLBACK_WOMEN_SALE = [
  { _id: "ws1", name: "Floral Lace Supportive Bra", gender: "Women", price: 1879, discount: 27, images: [{ url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "ws2", name: "Non-Padded Full-Coverage Lace Bra", gender: "Women", price: 1550, discount: 30, images: [{ url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "ws3", name: "Seamless Adjustable Plus-Size Bra", gender: "Women", price: 1690, discount: 48, images: [{ url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "ws4", name: "Full-Cup Lace Trimmed Bra", gender: "Women", price: 1590, discount: 35, images: [{ url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "ws5", name: "Satin Cami & Shorts Loungewear Set", gender: "Women", price: 1999, discount: 40, images: [{ url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "ws6", name: "High-Waist Tummy Control Shapewear", gender: "Women", price: 1450, discount: 45, images: [{ url: "https://images.unsplash.com/photo-1583744946564-b52d01a7f418?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "ws7", name: "Velvet Plush Robe & Chemise Set", gender: "Women", price: 3200, discount: 50, images: [{ url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "ws8", name: "Deep V Plunge Lace Teddy", gender: "Women", price: 1750, discount: 38, images: [{ url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4d4f?auto=format&fit=crop&q=80&w=600" }] },
];

const FALLBACK_MEN = [
  { _id: "m1", name: "Men's Athletic Performance Grey Waistband", gender: "Men", price: 1799, discount: 27, images: [{ url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "m2", name: "Men's Athletic Performance Textured", gender: "Men", price: 1830, discount: 28, images: [{ url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "m3", name: "Men's Athletic Performance Solid", gender: "Men", price: 1640, discount: 38, images: [{ url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "m4", name: "Men's Colorblock Geometric Waistband", gender: "Men", price: 1590, discount: 20, images: [{ url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "m5", name: "Men's Microfiber Seamless Briefs (3-Pack)", gender: "Men", price: 1499, discount: 30, images: [{ url: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "m6", name: "Men's Premium Modal Boxers (2-Pack)", gender: "Men", price: 1699, discount: 25, images: [{ url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "m7", name: "Men's Moisture-Wicking Sport Trunks", gender: "Men", price: 1390, discount: 35, images: [{ url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "m8", name: "Men's Luxury Cotton Stretch Lounge Pants", gender: "Men", price: 2199, discount: 40, images: [{ url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600" }] },
];

const FALLBACK_MEN_NEW = [
  { _id: "mn1", name: "Light Blue Solid Slim-Fit Shirt", gender: "Men", price: 2380, discount: 18, images: [{ url: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "mn2", name: "Light Grey Solid Skinny Man's Shirt", gender: "Men", price: 2599, discount: 16, images: [{ url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "mn3", name: "Dusty Pink Slim-Fit Cotton Man's Shirt", gender: "Men", price: 2200, discount: 10, images: [{ url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "mn4", name: "Light Teal Ultra Skinny Cotton Shirt", gender: "Men", price: 2550, discount: 24, images: [{ url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "mn5", name: "Men's Charcoal Ribbed Tank (2-Pack)", gender: "Men", price: 1290, discount: 15, images: [{ url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "mn6", name: "Men's Soft Bamboo Sleep Shorts", gender: "Men", price: 1450, discount: 20, images: [{ url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "mn7", name: "Men's Seamless Thermal Innerwear Top", gender: "Men", price: 1890, discount: 22, images: [{ url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "mn8", name: "Men's Classic Oxford Cotton Pajama Set", gender: "Men", price: 2899, discount: 30, images: [{ url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=600" }] },
];

/* ─── Reusable Product Section (2 Grids / 8 Products) ───────────────────── */
const ProductSection = ({ title, products, viewAllHref }) => (
  <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-12">
    <div className="flex items-baseline justify-between mb-7">
      <h2 className="text-[22px] font-bold tracking-[0.1em] text-gray-900 uppercase">
        {title}
      </h2>
      <Link
        to={viewAllHref}
        className="text-[11px] font-semibold tracking-[0.1em] text-gray-500 hover:text-gray-900 transition-colors uppercase underline underline-offset-4"
      >
        View All
      </Link>
    </div>
    {/* 2 Rows Grid: 4 columns x 2 rows = 8 items */}
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.slice(0, 8).map((product, i) => (
        <motion.div
          key={product._id || i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: (i % 4) * 0.07 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  </section>
);

/* ─── Skeleton loader for 8 products ────────────────────────────────────── */
const ProductSkeleton = () => (
  <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-12">
    <div className="h-6 w-48 bg-gray-200 rounded mb-7 animate-pulse" />
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <div key={n} className="space-y-2">
          <div className="aspect-[3/4] bg-gray-100 rounded animate-pulse" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
        </div>
      ))}
    </div>
  </section>
);

/* ════════════════════════════════════════════════════════════════════════
   HOME PAGE
════════════════════════════════════════════════════════════════════════ */
export const HomePage = () => {
  const [womenNew, setWomenNew] = useState([]);
  const [womenSale, setWomenSale] = useState([]);
  const [menSale, setMenSale] = useState([]);
  const [menNew, setMenNew] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Helper to prioritize DB products and pad with fallbacks only to reach target count */
  const fillProducts = (dbList, fallbackList, count = 8) => {
    if (!Array.isArray(dbList)) return fallbackList.slice(0, count);
    if (dbList.length >= count) return dbList.slice(0, count);
    if (dbList.length > 0) {
      const remaining = count - dbList.length;
      return [...dbList, ...fallbackList.slice(0, remaining)];
    }
    return fallbackList.slice(0, count);
  };

  /* Fetch products */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await productService.getAll({ limit: 50 });
        const allList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : (res.products || []);

        const women = allList.filter((p) => p.gender === "Women" || !p.gender);
        const men = allList.filter((p) => p.gender === "Men" || p.gender === "Unisex");

        setWomenNew(fillProducts(women.slice(0, 8), FALLBACK_WOMEN));
        setWomenSale(fillProducts(women.filter(p => p.discount > 0).slice(0, 8), FALLBACK_WOMEN_SALE));
        setMenSale(fillProducts(men.filter(p => p.discount > 0).slice(0, 8), FALLBACK_MEN));
        setMenNew(fillProducts(men.slice(0, 8), FALLBACK_MEN_NEW));
      } catch (err) {
        console.warn("Using product fallbacks due to API connection state:", err);
        setWomenNew(FALLBACK_WOMEN);
        setWomenSale(FALLBACK_WOMEN_SALE);
        setMenSale(FALLBACK_MEN);
        setMenNew(FALLBACK_MEN_NEW);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="bg-white">
      {/* ══════════════════════════════════════════════════════════════
          1. HERO IMAGE — Full-width editorial (Vionellae style)
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative h-[80vh] min-h-[520px] overflow-hidden select-none"
        style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
        }}
      >
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2, delay: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
          }}
        />

        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.04) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.04) 100%)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
          className="absolute top-[56%] left-[63%] -translate-x-1/2 z-20"
        >
          <Link
            to="/products?gender=Women"
            className="group inline-block bg-[#0d2137] px-12 py-3 text-[14px] sm:text-[15px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#1a3a5c] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(13,33,55,0.4)]"
          >
            WOMEN
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. SALE ANNOUNCEMENT TICKER
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border border-[#c9a84c] bg-[#0d2137] py-4">
        <div className="ticker-track flex whitespace-nowrap">
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="mx-10 text-sm font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
              20% OFF EVERYTHING &nbsp;[USE CODE: SALE20]&nbsp; ✦
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          3. TRENDING DENIM DESTINATION (Single unified background banner)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#f7f7f7] py-8 lg:py-12 overflow-hidden select-none">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full overflow-hidden bg-cover bg-center shadow-xl rounded-sm min-h-[300px] sm:min-h-[340px] lg:min-h-[380px] flex flex-col md:flex-row items-stretch"
            style={{ backgroundImage: `url(${bgHero2})` }}
          >
            <div className="w-full md:w-[49%] relative flex items-end justify-start p-0 overflow-hidden min-h-[300px] lg:min-h-[380px]">
              <img
                src={img1st}
                alt="Standing Model — Denim Dress"
                className="w-full h-full object-cover object-bottom ml-2 sm:ml-4 lg:ml-6 select-none transition-transform duration-500"
              />
            </div>

            <div className="w-full md:w-[49%] relative flex flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div className="relative z-10 text-left pt-2">
                <span className="block text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#0d2137]">
                  TRENDING • TIMELESS
                </span>
                <div className="relative mt-1">
                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black uppercase tracking-tight text-[#0d2137] leading-[0.95]">
                    DENIM DESTINATION
                  </h2>
                  <div className="flex justify-end -mt-1 sm:-mt-2 mr-4 lg:mr-8">
                    <span className="font-serif italic text-2xl sm:text-3xl text-[#0d2137] font-semibold tracking-wide">
                      STYLE
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 font-light tracking-wide italic">
                  Crafted for the modern wardrobe.
                </p>
              </div>

              <div className="relative flex-1 flex items-end justify-center mt-2 overflow-hidden">
                <img
                  src={img2nd}
                  alt="Sitting Model — Denim Skirt"
                  className="w-auto h-[88%] sm:h-[92%] max-h-none scale-105 sm:scale-110 lg:scale-110 object-contain object-bottom mr-8 sm:mr-12 lg:mr-16 mb-4 sm:mb-6 lg:mb-8 select-none transition-transform duration-500"
                />
              </div>

              <div className="mt-4 pt-2 z-10 flex justify-center md:justify-start">
                <Link
                  to="/products?category=denim"
                  className="inline-block bg-[#0d2137] px-8 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#1a3a5c] transition-colors shadow-md"
                >
                  WOMEN
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. WOMEN'S NEW (2 Rows Grid = 8 Items)
      ══════════════════════════════════════════════════════════════ */}
      {loading ? (
        <ProductSkeleton />
      ) : (
        <ProductSection
          title="WOMEN'S NEW"
          products={womenNew}
          viewAllHref="/products?gender=Women&sort=newest"
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          5. FEATURED EDITORIAL SECTION (WOMEN'S & VINTAGE DENIM)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#f7f7f7] py-8 lg:py-12 overflow-hidden select-none">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <h2 className="mb-7 text-center text-[22px] font-bold tracking-[0.1em] text-gray-900 uppercase">
            SHOP THE EDITS
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full overflow-hidden bg-cover bg-center shadow-xl rounded-sm p-0"
            style={{ backgroundImage: `url(${bgB2})` }}
          >
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 md:gap-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full md:w-[49%] group relative overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl flex items-center justify-center"
              >
                <Link to="/products?gender=Women" className="block w-full h-full relative overflow-hidden">
                  <img
                    src={img3rd}
                    alt="Women's Collection"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-full md:w-[49%] group relative overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl flex items-center justify-center"
              >
                <Link to="/products?category=denim" className="block w-full h-full relative overflow-hidden">
                  <img
                    src={img4th}
                    alt="Vintage Blue Denim"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. WOMEN'S HOT SALE (2 Rows Grid = 8 Items)
      ══════════════════════════════════════════════════════════════ */}
      {loading ? (
        <ProductSkeleton />
      ) : (
        <div className="bg-[#fafaf9]">
          <ProductSection
            title="WOMEN'S HOT SALE"
            products={womenSale}
            viewAllHref="/products?gender=Women&sale=true"
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          7. MEN'S DENIM FOREVER EDITORIAL (Group 5)
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden select-none my-8 lg:my-12"
        style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative w-full overflow-hidden bg-white"
        >
          <div className="relative w-full">
            <img
              src={group5Img}
              alt="Men's Denim Forever Collection"
              className="w-full h-auto object-cover select-none block"
            />
            <div className="absolute top-[87%] left-[73%] -translate-x-1/2 -translate-y-1/2 z-10">
              <Link
                to="/products?gender=Men"
                className="inline-block bg-[#0d2137] px-6 sm:px-10 py-2 sm:py-3 text-[11px] sm:text-[14px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#1a3a5c] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(13,33,55,0.4)]"
              >
                MEN
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          8. MEN'S HOT SALE (2 Rows Grid = 8 Items)
      ══════════════════════════════════════════════════════════════ */}
      {loading ? (
        <ProductSkeleton />
      ) : (
        <div className="bg-[#fafaf9]">
          <ProductSection
            title="MEN'S HOT SALE"
            products={menSale}
            viewAllHref="/products?gender=Men&sale=true"
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          9. MEN'S NEW (2 Rows Grid = 8 Items)
      ══════════════════════════════════════════════════════════════ */}
      {loading ? (
        <ProductSkeleton />
      ) : (
        <ProductSection
          title="MEN'S NEW"
          products={menNew}
          viewAllHref="/products?gender=Men&sort=newest"
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          10. THANKS SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[320px]">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920"
          alt="Thanks"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0d2137]/75" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex flex-col items-center justify-center min-h-[320px] px-6 py-20 text-center"
        >
          <div className="mb-8 inline-block border-2 border-white/60 px-6 py-3">
            <span className="text-3xl font-black tracking-[0.2em] text-white uppercase">
              THANKS
            </span>
          </div>
          <div className="max-w-lg space-y-1.5">
            <p className="text-sm text-white/90 leading-relaxed">
              This fabric has seen sunsets, storms, and long highways.
            </p>
            <p className="text-sm text-white/90 leading-relaxed">
              It's faded where you've leaned.
            </p>
            <p className="text-sm text-white/90 leading-relaxed">
              Worn where you've worked.
            </p>
            <p className="text-sm text-white/90 leading-relaxed">
              Soft where you've lived.
            </p>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              So here's our thanks — not for the easy days,
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              but for the ones that left a mark.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
