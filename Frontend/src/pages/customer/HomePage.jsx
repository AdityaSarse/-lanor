import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "../../components/customer/ProductCard";
import { productService } from "../../services/api.service";
import linenSectionImg from "../../assets/LinenSection.png";

/* ─── Hero slides data ──────────────────────────────────────────────── */
const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&q=85&w=1920",
    tag: "WOMEN'S COLLECTION",
    headline1: "Forever in Style",
    headline2: "ÉLANOR.",
    sub: "The New Classic",
    cta: "WOMEN",
    ctaHref: "/products?gender=Women",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=85&w=1920",
    tag: "MEN'S COLLECTION",
    headline1: "Crafted With Heritage",
    headline2: "DENIM.",
    sub: "Designed for the Modern World",
    cta: "MEN",
    ctaHref: "/products?gender=Men",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=85&w=1920",
    tag: "NEW ARRIVALS 2026",
    headline1: "Everyday Elegance",
    headline2: "STYLE.",
    sub: "Shop the Latest Edits",
    cta: "SHOP NOW",
    ctaHref: "/products",
  },
];

/* ─── Editorial "Shop the Edits" image pairs ──────────────────────── */
const EDITS = [
  {
    label: "WOMEN'S EDIT",
    href: "/products?gender=Women",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900",
  },
  {
    label: "MEN'S EDIT",
    href: "/products?gender=Men",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=900",
  },
];

/* ─── Fallback product datasets ──────────────────────────────────────── */
const FALLBACK_WOMEN = [
  { _id: "w1", name: "Full-Cup U-Back Adjustable Bra", gender: "Women", price: 1529, discount: 40, images: [{ url: "https://images.unsplash.com/photo-1583744946564-b52d01a7f418?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "w2", name: "Detachable-Strap Adjustable Plus Bra", gender: "Women", price: 1579, discount: 38, images: [{ url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4d4f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "w3", name: "Leaf Embroidered Shaping Bra", gender: "Women", price: 1879, discount: 42, images: [{ url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "w4", name: "Dream Lace Fantasy Push-Up Bra", gender: "Women", price: 1920, discount: 37, images: [{ url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600" }] },
];

const FALLBACK_WOMEN_SALE = [
  { _id: "ws1", name: "Floral Lace Supportive Bra", gender: "Women", price: 1879, discount: 27, images: [{ url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "ws2", name: "Non-Padded Full-Coverage Lace Bra", gender: "Women", price: 1550, discount: 30, images: [{ url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "ws3", name: "Seamless Adjustable Plus-Size Bra", gender: "Women", price: 1690, discount: 48, images: [{ url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "ws4", name: "Full-Cup Lace Bra", gender: "Women", price: 1590, discount: 35, images: [{ url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600" }] },
];

const FALLBACK_MEN = [
  { _id: "m1", name: "Men's Athletic Performance Grey Waistband", gender: "Men", price: 1799, discount: 27, images: [{ url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "m2", name: "Men's Athletic Performance Textured", gender: "Men", price: 1830, discount: 28, images: [{ url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "m3", name: "Men's Athletic Performance Solid", gender: "Men", price: 1640, discount: 38, images: [{ url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "m4", name: "Men's Colorblock Geometric Waistband", gender: "Men", price: 1590, discount: 20, images: [{ url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=600" }] },
];

const FALLBACK_MEN_NEW = [
  { _id: "mn1", name: "Light Blue Solid Slim-Fit Shirt", gender: "Men", price: 2380, discount: 18, images: [{ url: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "mn2", name: "Light Grey Solid Skinny Man's Shirt", gender: "Men", price: 2599, discount: 16, images: [{ url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "mn3", name: "Dusty Pink Slim-Fit Cotton Man's Shirt", gender: "Men", price: 2200, discount: 10, images: [{ url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=600" }] },
  { _id: "mn4", name: "Light Teal Ultra Skinny Cotton Shirt", gender: "Men", price: 2550, discount: 24, images: [{ url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600" }] },
];

/* ─── Reusable Product Section ──────────────────────────────────────── */
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
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.07 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  </section>
);

/* ─── Skeleton loader ────────────────────────────────────────────────── */
const ProductSkeleton = () => (
  <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-12">
    <div className="h-6 w-48 bg-gray-200 rounded mb-7 animate-pulse" />
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4].map((n) => (
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
  const [heroIdx, setHeroIdx] = useState(0);
  const [womenNew, setWomenNew] = useState([]);
  const [womenSale, setWomenSale] = useState([]);
  const [menSale, setMenSale] = useState([]);
  const [menNew, setMenNew] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  /* Auto-advance hero */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setHeroIdx((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const goHero = (dir) => {
    clearInterval(intervalRef.current);
    setHeroIdx((i) => (i + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  /* Fetch products */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await productService.getAll({ limit: 8 });
        const all = res.data?.products || res.products || [];
        const women = all.filter((p) => p.gender === "Women");
        const men = all.filter((p) => p.gender === "Men");
        setWomenNew(women.slice(0, 4).length ? women.slice(0, 4) : FALLBACK_WOMEN);
        setWomenSale(women.slice(4, 8).length ? women.slice(4, 8) : FALLBACK_WOMEN_SALE);
        setMenSale(men.slice(0, 4).length ? men.slice(0, 4) : FALLBACK_MEN);
        setMenNew(men.slice(4, 8).length ? men.slice(4, 8) : FALLBACK_MEN_NEW);
      } catch {
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

  const slide = HERO_SLIDES[heroIdx];

  return (
    <div className="bg-white">
      {/* ══════════════════════════════════════════════════════════════
          1. HERO SLIDER
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative h-[82vh] min-h-[560px] w-full overflow-hidden bg-gray-200 select-none">
        <AnimatePresence mode="sync">
          <motion.img
            key={slide.id}
            src={slide.image}
            alt={slide.headline2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </AnimatePresence>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />

        {/* Text content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${slide.id}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute inset-0 flex flex-col items-start justify-center pl-10 sm:pl-16 lg:pl-24 pb-10"
          >
            <span className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
              {slide.tag}
            </span>
            <p className="font-logo text-4xl italic font-medium text-white leading-tight sm:text-5xl">
              {slide.headline1}
            </p>
            <h1 className="text-6xl font-black tracking-tight text-white sm:text-8xl leading-none uppercase">
              {slide.headline2}
            </h1>
            <p className="mt-2 text-sm font-light text-white/80 tracking-wider">
              {slide.sub}
            </p>
            <Link
              to={slide.ctaHref}
              className="mt-7 inline-block bg-[#0d2137] px-8 py-2.5 text-[12px] font-bold uppercase tracking-[0.15em] text-white hover:bg-[#1a3a5c] transition-colors"
            >
              {slide.cta}
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <button
          onClick={() => goHero(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => goHero(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 transition-colors cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === heroIdx ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
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
          3. WOMEN'S NEW
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
          4. SHOP THE EDITS
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-10">
        <h2 className="mb-7 text-center text-[22px] font-bold tracking-[0.1em] text-gray-900 uppercase">
          SHOP THE EDITS
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {EDITS.map((edit, i) => (
            <motion.div
              key={edit.label}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to={edit.href} className="group relative block aspect-[4/5] overflow-hidden bg-gray-100">
                <img
                  src={edit.image}
                  alt={edit.label}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/25 transition-opacity duration-300 group-hover:bg-black/35" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                  <span className="inline-block bg-white px-8 py-2.5 text-[12px] font-bold uppercase tracking-[0.15em] text-[#0d2137] hover:bg-gray-100 transition-colors">
                    {edit.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. WOMEN'S HOT SALE
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
          6. EFFORTLESS ELEGANCE EDITORIAL (Matching Vionellae exact layout)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-white py-12 lg:py-16 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {/* Main composite image section with vertical running text overlay */}
          <div className="relative w-full overflow-hidden">
            <img
              src={linenSectionImg}
              alt="Effortless Elegance Linen Collection"
              className="w-full h-auto object-cover select-none"
            />

            {/* Vertical running text placed inside the image height in the center white gap */}
            <div className="absolute inset-y-0 left-[41.2%] w-[4%] hidden md:flex items-center justify-center pointer-events-none z-10 py-6">
              <span
                className="font-serif text-sm sm:text-base md:text-lg lg:text-[21px] font-extrabold uppercase tracking-[0.16em] text-[#0d2137] whitespace-nowrap leading-none"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                EFFORTLESS ELEGANCE
              </span>
            </div>
          </div>

          {/* Editorial summary & CTA button below */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-10 flex flex-col items-center text-center max-w-2xl mx-auto px-4"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#4a6d98] mb-2">
              MEN'S COLLECTION
            </span>
            <h3 className="font-logo text-4xl sm:text-5xl italic font-medium text-gray-900 mb-3">
              Effortless Elegance
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed font-light tracking-wide max-w-lg">
              Crafted from 100% pure European linen, designed for modern sophistication — where relaxed luxury meets everyday comfort.
            </p>
            <Link
              to="/products?gender=Men"
              className="mt-6 inline-block bg-[#0d2137] px-10 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#1a3a5c] transition-colors shadow-sm"
            >
              MEN
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          7. MEN'S HOT SALE
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
          8. MEN'S NEW
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
          9. THANKS SECTION
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
          {/* "THANKS" block text */}
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
