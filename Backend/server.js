require("dotenv").config();

const app = require("./src/app");
const { connectDB } = require("./src/config/db");
const Product = require("./src/models/products.model");
const Category = require("./src/models/category.model");
const Brand = require("./src/models/brand.model");

const SEED_CATEGORIES = [
  { name: "Tops & Tees", slug: "tops", description: "Stylish tops, t-shirts, and camisoles", status: "active" },
  { name: "Dresses", slug: "dresses", description: "Elegant mini, midi, and maxi dresses", status: "active" },
  { name: "Bottoms", slug: "bottoms", description: "Skirts, trousers, and tailored bottoms", status: "active" },
  { name: "Bodysuits", slug: "bodysuits", description: "Contour shaping bodysuits and long-sleeve suits", status: "active" },
  { name: "Jumpsuits", slug: "jumpsuits", description: "One-piece jumpsuits and elegant rompers", status: "active" },
  { name: "Lingerie Sets", slug: "lingerie", description: "Luxury silk satin nightdresses and lace lingerie sets", status: "active" },
  { name: "Bras", slug: "bras", description: "Full-cup, push-up, and lace shaping bras", status: "active" },
  { name: "Panties", slug: "panties", description: "Seamless, high-waist, and lace trimmed briefs", status: "active" },
  { name: "Denim", slug: "denim", description: "Premium jeans, denim jackets, and skirts", status: "active" },
  { name: "Shirts", slug: "shirts", description: "Casual and formal shirts for men and women", status: "active" },
  { name: "Swimwear", slug: "swimwear", description: "Beachwear, bikinis, and athletic swim trunks", status: "active" },
  { name: "T-Shirts", slug: "tshirts", description: "Men's heavyweight tees and tank tops", status: "active" },
  { name: "Shorts", slug: "shorts", description: "Linen, chino, and athletic casual shorts", status: "active" },
  { name: "Jeans", slug: "jeans", description: "Slim, wide-leg, and straight denim jeans", status: "active" },
  { name: "Pants", slug: "pants", description: "Smart fit trousers and tailored pants", status: "active" },
  { name: "Shapewear", slug: "shapewear", description: "Body shaping undergarments and waist cinchers", status: "active" },
  { name: "Accessories", slug: "accessories", description: "Bags, scarves, and luxury lifestyle items", status: "active" },
];

const SEED_BRANDS = [
  { name: "Élanor Atelier", slug: "elanor-atelier", description: "Signature luxury collection", status: "active" },
  { name: "Luna Luxe", slug: "luna-luxe", description: "Modern minimalist fashion", status: "active" },
  { name: "Veloura", slug: "veloura", description: "High comfort loungewear and silk wear", status: "active" },
  { name: "Noir Denim", slug: "noir-denim", description: "Premium denim garments", status: "active" },
];

const SEED_PRODUCTS = [
  {
    name: "Full-Cup U-Back Adjustable Bra",
    slug: "full-cup-u-back-adjustable-bra",
    description: "Designed for ultimate support and all-day comfort. Features a soft U-back silhouette, adjustable padded shoulder straps, and full-coverage soft cups crafted from premium breathable microfiber.",
    gender: "Women",
    price: 1529,
    discount: 40,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "bras",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1583744946564-b52d01a7f418?auto=format&fit=crop&q=80&w=800", alt: "Front View" },
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4d4f?auto=format&fit=crop&q=80&w=800", alt: "Side View" },
    ],
    variants: [
      {
        color: { name: "Rose Nude", hex: "#e0b0a2" },
        sizes: [{ size: "32B", stock: 15 }, { size: "34B", stock: 20 }, { size: "36C", stock: 12 }],
      },
      {
        color: { name: "Midnight Black", hex: "#111111" },
        sizes: [{ size: "32B", stock: 10 }, { size: "34B", stock: 18 }, { size: "36C", stock: 14 }],
      },
    ],
  },
  {
    name: "Detachable-Strap Adjustable Plus Bra",
    slug: "detachable-strap-adjustable-plus-bra",
    description: "Versatile plus-size shaping bra with removable convertible straps. Crafted with supportive underwire support and side boning for an infallible non-slip silhouette.",
    gender: "Women",
    price: 1579,
    discount: 38,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "bras",
    brandSlug: "veloura",
    images: [
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4d4f?auto=format&fit=crop&q=80&w=800", alt: "Front View" },
      { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800", alt: "Detail View" },
    ],
    variants: [
      {
        color: { name: "Champagne Beige", hex: "#f3e5ab" },
        sizes: [{ size: "34C", stock: 15 }, { size: "36D", stock: 22 }, { size: "38D", stock: 10 }],
      },
    ],
  },
  {
    name: "Leaf Embroidered Shaping Bralette",
    slug: "leaf-embroidered-shaping-bralette",
    description: "Exquisite botanical lace bralette featuring delicate leaf embroidery motifs over semi-sheer mesh. Wireless comfort band provides natural elevation.",
    gender: "Women",
    price: 1879,
    discount: 42,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "bras",
    brandSlug: "luna-luxe",
    images: [
      { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800", alt: "Model View" },
      { url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800", alt: "Back View" },
    ],
    variants: [
      {
        color: { name: "Dusty Lavender", hex: "#967bb6" },
        sizes: [{ size: "S", stock: 12 }, { size: "M", stock: 25 }, { size: "L", stock: 18 }],
      },
    ],
  },
  {
    name: "Casual Frayed Wide-Leg Denim Jeans",
    slug: "casual-frayed-wide-leg-denim-jeans",
    description: "High-waisted wide-leg denim trousers with subtle raw frayed hem detailing. Cut from 100% heavyweight organic cotton denim with classic 5-pocket styling.",
    gender: "Women",
    price: 3320,
    discount: 16,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "denim",
    brandSlug: "noir-denim",
    images: [
      { url: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&q=80&w=800", alt: "Standing View" },
      { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800", alt: "Detail View" },
    ],
    variants: [
      {
        color: { name: "Vintage Light Blue", hex: "#add8e6" },
        sizes: [{ size: "S", stock: 10 }, { size: "M", stock: 20 }, { size: "L", stock: 15 }],
      },
    ],
  },
  {
    name: "Ruched Off-The-Shoulder Bodysuit",
    slug: "ruched-off-the-shoulder-bodysuit",
    description: "Sleek contouring bodysuit featuring elegant off-the-shoulder neckline and flattering side ruching. Snap-button gusset closure ensures effortless wearability.",
    gender: "Women",
    price: 2049,
    discount: 21,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "shapewear",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800", alt: "Front View" },
      { url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=800", alt: "Styling View" },
    ],
    variants: [
      {
        color: { name: "Emerald Olive", hex: "#556b2f" },
        sizes: [{ size: "XS", stock: 8 }, { size: "S", stock: 15 }, { size: "M", stock: 18 }],
      },
    ],
  },
  {
    name: "Floral Lace Satin Midi Slip Dress",
    slug: "floral-lace-satin-midi-slip-dress",
    description: "Luxurious bias-cut satin midi dress framed with delicate French lace at the neckline and hem. Features adjustable spaghetti straps and side leg slit.",
    gender: "Women",
    price: 4250,
    discount: 30,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "dresses",
    brandSlug: "luna-luxe",
    images: [
      { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800", alt: "Editorial View" },
      { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800", alt: "Full Length" },
    ],
    variants: [
      {
        color: { name: "Blush Rose", hex: "#ffe4e1" },
        sizes: [{ size: "S", stock: 10 }, { size: "M", stock: 14 }, { size: "L", stock: 8 }],
      },
    ],
  },
  {
    name: "Men's Light Blue Solid Slim-Fit Oxford Shirt",
    slug: "mens-light-blue-solid-slim-fit-oxford-shirt",
    description: "Classic slim-fit Oxford shirt woven from premium long-staple cotton yarn. Features button-down collar, adjustable barrel cuffs, and a subtle curved hem.",
    gender: "Men",
    price: 2380,
    discount: 18,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "shirts",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=800", alt: "Front View" },
      { url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800", alt: "Mannequin View" },
    ],
    variants: [
      {
        color: { name: "Sky Blue", hex: "#87ceeb" },
        sizes: [{ size: "S", stock: 12 }, { size: "M", stock: 25 }, { size: "L", stock: 20 }, { size: "XL", stock: 15 }],
      },
    ],
  },
  {
    name: "Men's Athletic Performance Grey Trunks (3-Pack)",
    slug: "mens-athletic-performance-grey-trunks-3pack",
    description: "Engineered for active lifestyle comfort. Features four-way stretch moisture-wicking microfiber fabric, non-roll jacquard waistband, and ergonomic pouch support.",
    gender: "Men",
    price: 1799,
    discount: 27,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "tops",
    brandSlug: "luna-luxe",
    images: [
      { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800", alt: "Pack View" },
      { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800", alt: "Model View" },
    ],
    variants: [
      {
        color: { name: "Heather Slate", hex: "#708090" },
        sizes: [{ size: "S", stock: 15 }, { size: "M", stock: 30 }, { size: "L", stock: 25 }],
      },
    ],
  },
  {
    name: "Men's Slim Chino Stretch Trousers",
    slug: "mens-slim-chino-stretch-trousers",
    description: "Modern tailored chinos constructed with 98% cotton twill and 2% elastane for unrestricted movement. Deep side pockets and secure buttoned welt rear pockets.",
    gender: "Men",
    price: 2799,
    discount: 15,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "denim",
    brandSlug: "noir-denim",
    images: [
      { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800", alt: "Full View" },
      { url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=800", alt: "Detail View" },
    ],
    variants: [
      {
        color: { name: "Charcoal Black", hex: "#222222" },
        sizes: [{ size: "M", stock: 18 }, { size: "L", stock: 22 }, { size: "XL", stock: 12 }],
      },
    ],
  },
  {
    name: "Men's Dusty Pink Slim-Fit Cotton Shirt",
    slug: "mens-dusty-pink-slim-fit-cotton-shirt",
    description: "Refined contemporary shirt garment-dyed in soft dusty pink hues. Features mother-of-pearl buttons and crisp spread collar.",
    gender: "Men",
    price: 2200,
    discount: 10,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "shirts",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=800", alt: "Front View" },
      { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800", alt: "Style View" },
    ],
    variants: [
      {
        color: { name: "Dusty Pink", hex: "#d8a7b1" },
        sizes: [{ size: "S", stock: 10 }, { size: "M", stock: 20 }, { size: "L", stock: 15 }],
      },
    ],
  },
  {
    name: "Men's Classic Slim-Fit Crisp White Oxford Shirt",
    slug: "mens-classic-slim-fit-crisp-white-oxford-shirt",
    description: "Essential crisp white button-down shirt tailored from 100% Egyptian cotton. Features split back yoke, barrel cuffs, and reinforced collar stay.",
    gender: "Men",
    price: 2499,
    discount: 20,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "shirts",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800", alt: "White Shirt Front" },
      { url: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=800", alt: "Cuff Detail" },
    ],
    variants: [
      {
        color: { name: "Crisp White", hex: "#ffffff" },
        sizes: [{ size: "S", stock: 15 }, { size: "M", stock: 30 }, { size: "L", stock: 25 }, { size: "XL", stock: 10 }],
      },
    ],
  },
  {
    name: "Men's Navy Blue Linen Casual Resort Shirt",
    slug: "mens-navy-blue-linen-casual-resort-shirt",
    description: "Breathable pure linen casual shirt styled with camp collar and lightweight airy feel. Ideal for summer vacations and date nights.",
    gender: "Men",
    price: 2790,
    discount: 15,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "shirts",
    brandSlug: "luna-luxe",
    images: [
      { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800", alt: "Navy Linen Front" },
      { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800", alt: "Model View" },
    ],
    variants: [
      {
        color: { name: "Navy Blue", hex: "#000080" },
        sizes: [{ size: "S", stock: 12 }, { size: "M", stock: 22 }, { size: "L", stock: 18 }],
      },
    ],
  },
  {
    name: "Women's Ivory Silk Satin Button-Down Shirt",
    slug: "womens-ivory-silk-satin-button-down-shirt",
    description: "Luxurious pure mulberry silk satin blouse with draped liquid sheen finish, covered button placket, and relaxed cuffs.",
    gender: "Women",
    price: 3250,
    discount: 25,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "shirts",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=800", alt: "Ivory Silk Front" },
      { url: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&q=80&w=800", alt: "Styling View" },
    ],
    variants: [
      {
        color: { name: "Ivory Cream", hex: "#fffff0" },
        sizes: [{ size: "XS", stock: 10 }, { size: "S", stock: 18 }, { size: "M", stock: 14 }],
      },
    ],
  },
  {
    name: "Women's Blue Pinstripe Oversized Poplin Shirt",
    slug: "womens-blue-pinstripe-oversized-poplin-shirt",
    description: "Tailored boyfriend-fit poplin shirt woven with fine pinstripes. Features dropped shoulders, chest pocket, and high-low hem.",
    gender: "Women",
    price: 2650,
    discount: 18,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "shirts",
    brandSlug: "veloura",
    images: [
      { url: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&q=80&w=800", alt: "Poplin Shirt View" },
      { url: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&q=80&w=800", alt: "Model View" },
    ],
    variants: [
      {
        color: { name: "Pinstripe Blue", hex: "#4682b4" },
        sizes: [{ size: "S", stock: 14 }, { size: "M", stock: 20 }, { size: "L", stock: 10 }],
      },
    ],
  },
  {
    name: "Women's Satin Cowl-Neck Sleeveless Cami Top",
    slug: "womens-satin-cowl-neck-sleeveless-cami-top",
    description: "Chic cowl-neck camisole tailored from fluid satin weave. Features adjustable thin shoulder straps and bias-cut drape body.",
    gender: "Women",
    price: 1890,
    discount: 25,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "tops",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800", alt: "Satin Cami Front" },
      { url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=800", alt: "Side Detail" },
    ],
    variants: [
      {
        color: { name: "Champagne Gold", hex: "#e6ca65" },
        sizes: [{ size: "XS", stock: 10 }, { size: "S", stock: 18 }, { size: "M", stock: 15 }],
      },
      {
        color: { name: "Emerald Green", hex: "#046307" },
        sizes: [{ size: "S", stock: 12 }, { size: "M", stock: 14 }],
      },
    ],
  },
  {
    name: "Women's Lace Trim Corset Bustier Crop Top",
    slug: "womens-lace-trim-corset-bustier-crop-top",
    description: "Structure-fitted bustier crop top crafted with scalloped French lace trim, boned bodices, and rear hook-and-eye closure.",
    gender: "Women",
    price: 2150,
    discount: 30,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "tops",
    brandSlug: "luna-luxe",
    images: [
      { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800", alt: "Corset Top Front" },
      { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800", alt: "Model View" },
    ],
    variants: [
      {
        color: { name: "Midnight Black", hex: "#111111" },
        sizes: [{ size: "XS", stock: 8 }, { size: "S", stock: 16 }, { size: "M", stock: 12 }],
      },
    ],
  },
  {
    name: "Women's Ribbed Square-Neck Knit Tank Top",
    slug: "womens-ribbed-square-neck-knit-tank-top",
    description: "Versatile square-neck tank top in fine ribbed cotton knit. Features wide shoulder straps and body-con snug fit.",
    gender: "Women",
    price: 1450,
    discount: 20,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "tops",
    brandSlug: "veloura",
    images: [
      { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800", alt: "Ribbed Tank Front" },
      { url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800", alt: "Back View" },
    ],
    variants: [
      {
        color: { name: "Off White", hex: "#f8f8ff" },
        sizes: [{ size: "S", stock: 20 }, { size: "M", stock: 25 }, { size: "L", stock: 15 }],
      },
    ],
  },
  {
    name: "Women's Draped One-Shoulder Asymmetric Top",
    slug: "womens-draped-one-shoulder-asymmetric-top",
    description: "Sophisticated one-shoulder evening top with gathered asymmetric draped side panel and soft jersey lining.",
    gender: "Women",
    price: 2350,
    discount: 18,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "tops",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800", alt: "Asymmetric Top" },
      { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800", alt: "Side Drape" },
    ],
    variants: [
      {
        color: { name: "Ruby Wine", hex: "#800020" },
        sizes: [{ size: "S", stock: 10 }, { size: "M", stock: 16 }, { size: "L", stock: 12 }],
      },
    ],
  },
  // ── BODYSUITS ──
  {
    name: "Women's Contour Shaping Seamless Bodysuit",
    slug: "womens-contour-shaping-seamless-bodysuit",
    description: "Ultra-smooth compression bodysuit designed for seamless sculpting under clothing with adjustable convertible straps.",
    gender: "Women",
    price: 2100,
    discount: 30,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "bodysuits",
    brandSlug: "veloura",
    images: [
      { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800", alt: "Bodysuit Front" },
      { url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=800", alt: "Side View" },
    ],
    variants: [
      {
        color: { name: "Nude Rose", hex: "#e0b0a2" },
        sizes: [{ size: "S", stock: 15 }, { size: "M", stock: 20 }, { size: "L", stock: 12 }],
      },
    ],
  },
  // ── JUMPSUITS ──
  {
    name: "Women's Satin Belted Wide-Leg Jumpsuit",
    slug: "womens-satin-belted-wide-leg-jumpsuit",
    description: "Elegantly tailored wide-leg jumpsuit in fluid satin fabric with removable tie waist belt and deep V-neckline.",
    gender: "Women",
    price: 3890,
    discount: 20,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "jumpsuits",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800", alt: "Jumpsuit Front" },
      { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800", alt: "Model View" },
    ],
    variants: [
      {
        color: { name: "Emerald Olive", hex: "#556b2f" },
        sizes: [{ size: "S", stock: 10 }, { size: "M", stock: 15 }, { size: "L", stock: 8 }],
      },
    ],
  },
  // ── LINGERIE ──
  {
    name: "Women's Silk Satin Chemise Nightdress & Robe Set",
    slug: "womens-silk-satin-chemise-nightdress-robe-set",
    description: "Luxurious 2-piece sleepwear set featuring bias-cut silk chemise and lace-trimmed kimono robe.",
    gender: "Women",
    price: 3490,
    discount: 25,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "lingerie",
    brandSlug: "luna-luxe",
    images: [
      { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800", alt: "Lingerie Front" },
      { url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800", alt: "Robe Detail" },
    ],
    variants: [
      {
        color: { name: "Blush Pink", hex: "#ffe4e1" },
        sizes: [{ size: "S", stock: 12 }, { size: "M", stock: 18 }, { size: "L", stock: 14 }],
      },
    ],
  },
  // ── PANTIES ──
  {
    name: "Women's Seamless Microfiber Mid-Rise Panties (3-Pack)",
    slug: "womens-seamless-microfiber-mid-rise-panties-3pack",
    description: "No-show laser-cut microfiber panties with ultra-soft stretch elastic band and 100% cotton gusset.",
    gender: "Women",
    price: 1290,
    discount: 20,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "panties",
    brandSlug: "veloura",
    images: [
      { url: "https://images.unsplash.com/photo-1583744946564-b52d01a7f418?auto=format&fit=crop&q=80&w=800", alt: "Panties Pack" },
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4d4f?auto=format&fit=crop&q=80&w=800", alt: "Detail View" },
    ],
    variants: [
      {
        color: { name: "Multi Pastels", hex: "#f0e68c" },
        sizes: [{ size: "S", stock: 25 }, { size: "M", stock: 35 }, { size: "L", stock: 20 }],
      },
    ],
  },
  // ── BOTTOMS ──
  {
    name: "Women's High-Waisted Pleated Tailored Trousers",
    slug: "womens-high-waisted-pleated-tailored-trousers",
    description: "Chic wide-leg pleated trousers with high waistband, slanted side pockets, and pressed creased leg.",
    gender: "Women",
    price: 2990,
    discount: 20,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "bottoms",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800", alt: "Trousers Front" },
      { url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=800", alt: "Model View" },
    ],
    variants: [
      {
        color: { name: "Taupe Beige", hex: "#d2b48c" },
        sizes: [{ size: "S", stock: 12 }, { size: "M", stock: 18 }, { size: "L", stock: 10 }],
      },
    ],
  },
  // ── MEN'S T-SHIRTS ──
  {
    name: "Men's Premium Heavyweight Cotton Crewneck Tee",
    slug: "mens-premium-heavyweight-cotton-crewneck-tee",
    description: "Crafted from 240 GSM organic combed cotton with dropped shoulder seams and relaxed boxy fit.",
    gender: "Men",
    price: 1290,
    discount: 15,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "tshirts",
    brandSlug: "luna-luxe",
    images: [
      { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800", alt: "Heavyweight Tee Front" },
      { url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800", alt: "Model View" },
    ],
    variants: [
      {
        color: { name: "Washed Black", hex: "#2b2b2b" },
        sizes: [{ size: "S", stock: 20 }, { size: "M", stock: 30 }, { size: "L", stock: 25 }, { size: "XL", stock: 15 }],
      },
    ],
  },
  // ── MEN'S SHORTS ──
  {
    name: "Men's Linen Stretch Casual Drawstring Shorts",
    slug: "mens-linen-stretch-casual-drawstring-shorts",
    description: "Summer linen shorts woven with 2% elastane stretch, elasticated drawstring waist, and back welt pocket.",
    gender: "Men",
    price: 1790,
    discount: 18,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "shorts",
    brandSlug: "luna-luxe",
    images: [
      { url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800", alt: "Linen Shorts Front" },
      { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800", alt: "Model View" },
    ],
    variants: [
      {
        color: { name: "Sand Beige", hex: "#f5f5dc" },
        sizes: [{ size: "S", stock: 14 }, { size: "M", stock: 22 }, { size: "L", stock: 18 }],
      },
    ],
  },
  // ── MEN'S JEANS ──
  {
    name: "Men's Slim Straight Vintage Wash Denim Jeans",
    slug: "mens-slim-straight-vintage-wash-denim-jeans",
    description: "Classic 5-pocket denim jeans in vintage indigo wash with slight whiskering and comfortable stretch denim.",
    gender: "Men",
    price: 3190,
    discount: 20,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "jeans",
    brandSlug: "noir-denim",
    images: [
      { url: "https://images.unsplash.com/photo-1542272604-780c36856d67?auto=format&fit=crop&q=80&w=800", alt: "Jeans Front" },
      { url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=800", alt: "Detail View" },
    ],
    variants: [
      {
        color: { name: "Vintage Indigo", hex: "#2f4f4f" },
        sizes: [{ size: "M", stock: 20 }, { size: "L", stock: 25 }, { size: "XL", stock: 15 }],
      },
    ],
  },
  // ── MEN'S PANTS ──
  {
    name: "Men's Tailored Smart Fit Stretch Pants",
    slug: "mens-tailored-smart-fit-stretch-pants",
    description: "Versatile smart casual trousers engineered with flex waistband, front crease, and wrinkle-resistant fabric.",
    gender: "Men",
    price: 2890,
    discount: 22,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "pants",
    brandSlug: "elanor-atelier",
    images: [
      { url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&q=80&w=800", alt: "Pants Front" },
      { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800", alt: "Style View" },
    ],
    variants: [
      {
        color: { name: "Midnight Navy", hex: "#000080" },
        sizes: [{ size: "S", stock: 15 }, { size: "M", stock: 25 }, { size: "L", stock: 20 }],
      },
    ],
  },
  // ── MEN'S SWIMWEAR ──
  {
    name: "Men's Athletic Quick-Dry Sport Swim Trunks",
    slug: "mens-athletic-quick-dry-sport-swim-trunks",
    description: "Lightweight quick-drying swim shorts with mesh lining, elastic drawstring waist, and secure zipped pocket.",
    gender: "Men",
    price: 1690,
    discount: 25,
    isFeatured: true,
    isPublished: true,
    status: "active",
    categorySlug: "swimwear",
    brandSlug: "luna-luxe",
    images: [
      { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800", alt: "Swim Trunks" },
      { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800", alt: "Model View" },
    ],
    variants: [
      {
        color: { name: "Ocean Blue", hex: "#00bfff" },
        sizes: [{ size: "S", stock: 18 }, { size: "M", stock: 24 }, { size: "L", stock: 20 }],
      },
    ],
  },
];

async function ensureSeedData() {
  try {
    const categoryMap = {};
    for (const catData of SEED_CATEGORIES) {
      let cat = await Category.findOne({ slug: catData.slug });
      if (!cat) cat = await Category.create(catData);
      categoryMap[cat.slug] = cat._id;
    }

    const brandMap = {};
    for (const brandData of SEED_BRANDS) {
      let brand = await Brand.findOne({ slug: brandData.slug });
      if (!brand) brand = await Brand.create(brandData);
      brandMap[brand.slug] = brand._id;
    }

    for (const item of SEED_PRODUCTS) {
      const exists = await Product.findOne({ slug: item.slug });
      if (!exists) {
        await Product.create({
          ...item,
          category: categoryMap[item.categorySlug] || Object.values(categoryMap)[0],
          brand: brandMap[item.brandSlug] || Object.values(brandMap)[0],
        });
      }
    }
    console.log("Database seeded with products successfully.");
  } catch (err) {
    console.warn("Auto-seeding check error:", err.message);
  }
}

connectDB().then(() => {
  ensureSeedData();
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});