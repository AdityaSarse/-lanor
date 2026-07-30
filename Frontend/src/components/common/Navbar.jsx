import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, User, Search, X, Menu,
  LogOut, ShieldCheck, ChevronDown, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCartStore } from "../../store/useCartStore";

/* ─────────────────────────────────────────
   NAVIGATION MENU DATA  (from SectionImages)
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   NAVIGATION MENU DATA  (from SectionImages)
───────────────────────────────────────── */
const NAV_MENUS = [
  {
    label: "NEW",
    href: "/products?sort=newest",
    columns: [
      {
        title: "NEW WOMEN'S",
        href: "/products?gender=Women&sort=newest",
        items: [
          { label: "TOPS",          href: "/products?gender=Women&category=tops&sort=newest" },
          { label: "DRESSES",       href: "/products?gender=Women&category=dresses&sort=newest" },
          { label: "BOTTOMS",       href: "/products?gender=Women&category=bottoms&sort=newest" },
          { label: "BODYSUITS",     href: "/products?gender=Women&category=bodysuits&sort=newest" },
          { label: "JUMPSUITS",     href: "/products?gender=Women&category=jumpsuits&sort=newest" },
          { label: "LINGERIE SETS", href: "/products?gender=Women&category=lingerie&sort=newest" },
          { label: "BRAS",          href: "/products?gender=Women&category=bras&sort=newest" },
          { label: "PANTIES",       href: "/products?gender=Women&category=panties&sort=newest" },
        ],
      },
      {
        title: "NEW MEN'S",
        href: "/products?gender=Men&sort=newest",
        items: [
          { label: "SWIM TRUNK", href: "/products?gender=Men&category=swimwear&sort=newest" },
          { label: "T-SHIRTS",   href: "/products?gender=Men&category=tshirts&sort=newest" },
          { label: "SHORTS",     href: "/products?gender=Men&category=shorts&sort=newest" },
          { label: "SHIRTS",     href: "/products?gender=Men&category=shirts&sort=newest" },
          { label: "JEANS",      href: "/products?gender=Men&category=jeans&sort=newest" },
          { label: "PANTS",      href: "/products?gender=Men&category=pants&sort=newest" },
        ],
      },
    ],
  },
  {
    label: "WOMEN",
    href: "/products?gender=Women",
    columns: [
      {
        title: "ALL CLOTHING",
        href: "/products?gender=Women",
        items: [
          { label: "VESTS",        href: "/products?gender=Women&category=vests" },
          { label: "TEES",         href: "/products?gender=Women&category=tees" },
          { label: "SHIRTS",       href: "/products?gender=Women&category=shirts" },
          { label: "MINI DRESSES", href: "/products?gender=Women&category=mini-dresses" },
          { label: "MIDI DRESSES", href: "/products?gender=Women&category=midi-dresses" },
          { label: "MAXI DRESSES", href: "/products?gender=Women&category=maxi-dresses" },
          { label: "BODYSUITS",    href: "/products?gender=Women&category=bodysuits" },
          { label: "SWEATERS",     href: "/products?gender=Women&category=sweaters" },
          { label: "SKIRTS",       href: "/products?gender=Women&category=skirts" },
          { label: "PANTS",        href: "/products?gender=Women&category=pants" },
          { label: "JEANS",        href: "/products?gender=Women&category=jeans" },
          { label: "OUTERWEAR",    href: "/products?gender=Women&category=outerwear" },
        ],
      },
      {
        title: "TOPS SHOP",
        href: "/products?gender=Women&category=tops",
        items: [
          { label: "ALL TOPS",  href: "/products?gender=Women&category=tops" },
          { label: "VESTS",     href: "/products?gender=Women&category=vests" },
          { label: "TEES",      href: "/products?gender=Women&category=tees" },
          { label: "SHIRTS",    href: "/products?gender=Women&category=shirts" },
          { label: "SWEATERS",  href: "/products?gender=Women&category=sweaters" },
        ],
      },
      {
        title: "DRESSES SHOP",
        href: "/products?gender=Women&category=dresses",
        items: [
          { label: "ALL DRESSES",  href: "/products?gender=Women&category=dresses" },
          { label: "MINI DRESSES", href: "/products?gender=Women&category=mini-dresses" },
          { label: "MIDI DRESSES", href: "/products?gender=Women&category=midi-dresses" },
          { label: "MAXI DRESSES", href: "/products?gender=Women&category=maxi-dresses" },
        ],
      },
      {
        title: "BOTTOMS SHOP",
        href: "/products?gender=Women&category=bottoms",
        items: [
          { label: "ALL BOTTOMS", href: "/products?gender=Women&category=bottoms" },
          { label: "SKIRTS",      href: "/products?gender=Women&category=skirts" },
          { label: "SHORTS",      href: "/products?gender=Women&category=shorts" },
          { label: "PANTS",       href: "/products?gender=Women&category=pants" },
          { label: "JEANS",       href: "/products?gender=Women&category=jeans" },
        ],
      },
    ],
  },
  {
    label: "MEN",
    href: "/products?gender=Men",
    columns: [
      {
        title: "SWIM TRUNK",
        href: "/products?gender=Men&category=swimwear",
        items: [],
      },
      {
        title: "ALL SHIRTS",
        href: "/products?gender=Men&category=shirts",
        items: [
          { label: "T-SHIRTS", href: "/products?gender=Men&category=tshirts" },
          { label: "SHIRTS",   href: "/products?gender=Men&category=shirts" },
        ],
      },
      {
        title: "ALL BOTTOMS",
        href: "/products?gender=Men&category=bottoms",
        items: [
          { label: "SHORTS", href: "/products?gender=Men&category=shorts" },
          { label: "JEANS",  href: "/products?gender=Men&category=jeans" },
          { label: "PANTS",  href: "/products?gender=Men&category=pants" },
        ],
      },
      {
        title: "JACKETS",
        href: "/products?gender=Men&category=jackets",
        items: [],
      },
    ],
  },
  {
    label: "DENIM STYLE",
    href: "/products?category=denim",
    columns: [
      {
        title: null,
        href: null,
        items: [
          { label: "WOMEN", href: "/products?gender=Women&category=denim" },
          { label: "MEN",   href: "/products?gender=Men&category=denim" },
        ],
      },
    ],
  },
  {
    label: "WHAT TO WEAR",
    href: "/products",
    columns: [
      {
        title: "WOMEN'S OCCASIONS",
        href: "/products?gender=Women&occasion=all",
        items: [
          { label: "CASUAL",            href: "/products?gender=Women&occasion=casual" },
          { label: "VACATION",          href: "/products?gender=Women&occasion=vacation" },
          { label: "DATE NIGHT OUTFITS",href: "/products?gender=Women&occasion=date-night" },
        ],
      },
      {
        title: "MEN'S OCCASIONS",
        href: "/products?gender=Men&occasion=all",
        items: [
          { label: "BEACH",            href: "/products?gender=Men&occasion=beach" },
          { label: "BUSINESS CASUAL",  href: "/products?gender=Men&occasion=business" },
        ],
      },
    ],
  },
  {
    label: "SALE",
    href: "/products?sale=true",
    columns: [
      {
        title: null,
        href: null,
        items: [
          { label: "WOMEN'S CLEARANCE", href: "/products?gender=Women&sale=true" },
          { label: "MEN'S CLEARANCE",   href: "/products?gender=Men&sale=true" },
        ],
      },
    ],
  },
  { label: "LUGGAGE", href: "/products?category=luggage" },
  { label: "SHOES",   href: "/products?category=shoes" },
  {
    label: "ACCS",
    href: "/products?category=accessories",
    columns: [
      {
        title: null,
        href: null,
        items: [
          { label: "WOMEN'S ACCS", href: "/products?gender=Women&category=accessories" },
          { label: "MEN'S ACCS",   href: "/products?gender=Men&category=accessories" },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────
   MULTI-LEVEL FLYOUT MENU (Vionellae 2-level flyout style)
───────────────────────────────────────── */
const FlyoutMenu = ({ menu, onClose, onKeep }) => {
  const [activeCol, setActiveCol] = useState(0);

  if (!menu.columns?.length) return null;

  const currentColumn = menu.columns[activeCol] || menu.columns[0];
  const hasSubItems = currentColumn?.items && currentColumn.items.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="absolute left-0 top-full z-50 flex bg-white shadow-xl border border-gray-200/80 rounded-sm text-gray-800 select-none min-w-[190px]"
      onMouseEnter={onKeep}
      onMouseLeave={onClose}
      role="menu"
    >
      {/* ── Left Level 1 Categories ── */}
      <div className="w-[195px] border-r border-gray-100 py-2 shrink-0 bg-white">
        {menu.columns.map((col, i) => {
          if (!col.title) {
            // Flat list item if no section title
            return col.items.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={onClose}
                className="block px-4 py-2.5 text-[12px] font-normal tracking-wider uppercase text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                {item.label}
              </Link>
            ));
          }

          const isActive = activeCol === i;
          return (
            <div key={i} onMouseEnter={() => setActiveCol(i)}>
              <Link
                to={col.href || "#"}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-2.5 text-[12px] font-medium tracking-wider uppercase transition-colors cursor-pointer ${
                  isActive
                    ? "text-gray-900 font-semibold bg-gray-50/90"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
                role="menuitem"
              >
                <span>{col.title}</span>
                {col.items?.length > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Right Level 2 Subcategories Flyout ── */}
      <AnimatePresence mode="wait">
        {hasSubItems && (
          <motion.div
            key={activeCol}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="w-[215px] py-2 bg-white shrink-0"
          >
            {currentColumn.items.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={onClose}
                className="block px-4 py-2.5 text-[12px] font-normal tracking-wider uppercase text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors whitespace-nowrap"
                role="menuitem"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   MOBILE: collapsible nav accordion
───────────────────────────────────────── */
const MobileNavItem = ({ menu, onClose }) => {
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(null);

  if (!menu.columns?.length) {
    return (
      <Link
        to={menu.href}
        onClick={onClose}
        className="block py-3 text-[13px] font-semibold tracking-[0.1em] text-gray-700 border-b border-gray-100"
      >
        {menu.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between py-3 text-[13px] font-semibold tracking-[0.1em] text-gray-700 cursor-pointer"
      >
        {menu.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-3"
          >
            {menu.columns.map((col, i) => (
              <div key={i}>
                {col.title ? (
                  <div>
                    <button
                      onClick={() => setSubOpen(subOpen === i ? null : i)}
                      className="flex w-full items-center justify-between py-2 text-[12px] font-semibold text-gray-600 cursor-pointer"
                    >
                      {col.title}
                      {col.items.length > 0 && (
                        <ChevronRight className={`h-3.5 w-3.5 text-gray-400 transition-transform ${subOpen === i ? "rotate-90" : ""}`} />
                      )}
                    </button>
                    <AnimatePresence>
                      {subOpen === i && col.items.length > 0 && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden pl-3"
                        >
                          {col.items.map(item => (
                            <Link
                              key={item.label}
                              to={item.href}
                              onClick={onClose}
                              className="block py-1.5 text-[11px] text-gray-500 hover:text-gray-900 transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  col.items.map(item => (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={onClose}
                      className="block py-1.5 text-[12px] text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN NAVBAR
───────────────────────────────────────── */
export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const cart = useCartStore((state) => state.cart);
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuTimerRef = useRef(null);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  /* Hover with small delay to prevent flicker */
  const openMenu = useCallback((label) => {
    clearTimeout(menuTimerRef.current);
    setActiveMenu(label);
  }, []);

  const closeMenu = useCallback(() => {
    menuTimerRef.current = setTimeout(() => setActiveMenu(null), 100);
  }, []);

  const keepMenu = useCallback(() => {
    clearTimeout(menuTimerRef.current);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}>
        {/* ── Promo Bar (Vionellae style — dark navy with gold accents) ── */}
        <div className="bg-[#0d2137] py-2.5 text-center">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-[#c9a84c] uppercase">
            10% OFF / USE CODE: NEW10
          </p>
        </div>

        {/* ── Main Header Row ── */}
        <div className="border-b border-gray-100">
          <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10">
            {/* Mobile menu trigger */}
            <button
              className="lg:hidden p-1.5 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Left: Currency / Language (Vionellae style) */}
            <div className="hidden lg:flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 cursor-pointer hover:text-gray-900 transition-colors">
                🇺🇸 <span className="tracking-wide">USD</span> <ChevronDown className="h-2.5 w-2.5" />
              </span>
              <span className="text-gray-200 text-xs">|</span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500 cursor-pointer hover:text-gray-900 transition-colors">
                English <ChevronDown className="h-2.5 w-2.5" />
              </span>
            </div>

            {/* Center: Logo (Vionellae script style) */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <span className="font-logo text-[32px] italic font-semibold tracking-wide text-[#0d2137] hover:text-gray-700 transition-colors select-none">
                Élanor
              </span>
            </Link>

            {/* Right: Icons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="hidden sm:flex items-center gap-1 p-1.5 text-[#4a6d98] hover:text-[#0d2137] transition-colors"
                      aria-label="Admin"
                    >
                      <ShieldCheck className="h-5 w-5" />
                    </Link>
                  )}
                  <Link to="/orders" className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors" aria-label="Account">
                    <User className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => { logout(); navigate("/auth/login"); }}
                    className="hidden sm:flex items-center gap-1 p-1.5 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    aria-label="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <Link to="/auth/login" className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors" aria-label="Sign In">
                  <User className="h-5 w-5" />
                </Link>
              )}

              <Link to="/cart" className="relative p-1.5 text-gray-600 hover:text-gray-900 transition-colors" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    key={cartItemCount}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0d2137] text-[10px] font-bold text-white"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* ── Desktop Navigation Row with Multi-level Flyout ── */}
        <div className="hidden lg:block border-b border-gray-100 bg-white">
          <nav className="mx-auto flex max-w-[1400px] items-center justify-center px-4 gap-0.5" role="navigation" aria-label="Main Navigation">
            {NAV_MENUS.map((menu) => (
              <div
                key={menu.label}
                className="relative"
                onMouseEnter={() => openMenu(menu.label)}
                onMouseLeave={closeMenu}
              >
                <Link
                  to={menu.href}
                  aria-expanded={activeMenu === menu.label}
                  aria-haspopup={menu.columns?.length > 0}
                  className={`relative flex items-center gap-1 px-4 py-3.5 text-[12px] font-medium tracking-[0.1em] transition-colors ${
                    activeMenu === menu.label
                      ? "text-[#0d2137] font-semibold"
                      : "text-gray-600 hover:text-[#0d2137]"
                  }`}
                >
                  {menu.label}
                  {menu.columns?.length > 0 && (
                    <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${activeMenu === menu.label ? "rotate-180" : ""}`} />
                  )}
                  {/* Animated underline indicator */}
                  <span className={`absolute bottom-0 left-4 right-4 h-[2px] bg-[#0d2137] transition-transform duration-300 origin-left ${
                    activeMenu === menu.label ? "scale-x-100" : "scale-x-0"
                  }`} />
                </Link>

                <AnimatePresence>
                  {activeMenu === menu.label && menu.columns?.length > 0 && (
                    <FlyoutMenu
                      menu={menu}
                      onClose={() => setActiveMenu(null)}
                      onKeep={keepMenu}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-0.5 px-3.5 py-3 text-[12px] font-semibold tracking-[0.08em] text-[#4a6d98] hover:text-[#0d2137] transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> ADMIN
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 backdrop-blur-sm pt-24 px-4"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-xl border border-gray-200 bg-white p-6 shadow-2xl rounded-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-logo text-xl italic text-gray-800">Search Élanor</h3>
                <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search products, styles, collections..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="flex-1 border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm"
                />
                <button
                  type="submit"
                  className="bg-[#0d2137] px-5 py-2.5 text-xs font-bold tracking-wider text-white hover:bg-[#1a3a5c] transition-colors cursor-pointer rounded-sm"
                >
                  SEARCH
                </button>
              </form>
              {/* Quick links */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["New Arrivals", "Women's Tops", "Denim Style", "Sale", "Dresses"].map(t => (
                  <button
                    key={t}
                    onClick={() => { navigate(`/products?search=${encodeURIComponent(t)}`); setSearchOpen(false); }}
                    className="rounded-full border border-gray-200 px-3 py-1 text-[11px] text-gray-500 hover:border-[#4a6d98] hover:text-[#4a6d98] transition-colors cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed inset-y-0 left-0 z-[70] w-80 bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  <span className="font-logo text-2xl italic text-gray-900">Élanor</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-gray-900 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 py-4">
                {NAV_MENUS.map((menu) => (
                  <MobileNavItem key={menu.label} menu={menu} onClose={() => setMobileOpen(false)} />
                ))}
              </nav>

              <div className="border-t border-gray-200 px-5 py-4 space-y-3">
                {user ? (
                  <>
                    <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="h-4 w-4" /> My Orders
                    </Link>
                    <button
                      onClick={() => { logout(); navigate("/auth/login"); setMobileOpen(false); }}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="h-4 w-4" /> Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
