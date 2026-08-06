require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./src/models/products.model");
const Category = require("./src/models/category.model");
const Brand = require("./src/models/brand.model");

const UPLOADS_DIR = path.join(__dirname, "src", "uploads");

// Standard categories to ensure exist
const CATEGORIES_DATA = [
  { name: "Tops & Tees", slug: "tops", description: "Stylish tops, t-shirts, and bodysuits", status: "active" },
  { name: "Denim", slug: "denim", description: "Premium jeans, denim jackets, and skirts", status: "active" },
  { name: "Shirts", slug: "shirts", description: "Casual and formal shirts for men and women", status: "active" },
];

// Standard brands to ensure exist
const BRANDS_DATA = [
  { name: "Élanor Atelier", slug: "elanor-atelier", description: "Signature luxury collection", status: "active" },
  { name: "Luna Luxe", slug: "luna-luxe", description: "Modern minimalist fashion", status: "active" },
  { name: "Veloura", slug: "veloura", description: "High comfort loungewear and silk wear", status: "active" },
  { name: "Noir Denim", slug: "noir-denim", description: "Premium denim garments", status: "active" },
];

// Helper to sanitize title
function formatTitle(folderName, filename, index) {
  let categoryLabel = "Item";
  if (folderName === "shirts") categoryLabel = "Cotton Shirt";
  else if (folderName === "tops") categoryLabel = "Satin & Knit Top";
  else if (folderName.includes("Men")) categoryLabel = "Men's Premium Denim";
  else if (folderName.includes("women")) categoryLabel = "Women's High-Rise Denim";

  return `Élanor Designer ${categoryLabel} (Edition #${index + 1})`;
}

// Helper to generate slug
function generateSlug(folderName, filename, index) {
  const cleanName = filename.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  return `elanor-${folderName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${index + 1}-${cleanName}`.slice(0, 80);
}

async function seedUploads(isStandalone = true) {
  try {
    if (isStandalone) {
      const mongoUri = process.env.MONGO_URI || "mongodb+srv://backend:IZkxein6YkKA5VFM@backend.tuklnl7.mongodb.net/Elanor";
      console.log("[SeedUploads] Connecting to MongoDB:", mongoUri);
      await mongoose.connect(mongoUri);
      console.log("[SeedUploads] Connected to MongoDB successfully.");
    }

    // 1. Ensure Categories
    const categoryMap = {};
    for (const catData of CATEGORIES_DATA) {
      let cat = await Category.findOne({ slug: catData.slug });
      if (!cat) {
        cat = await Category.create(catData);
        console.log(`[SeedUploads] Created category: ${cat.name}`);
      }
      categoryMap[cat.slug] = cat._id;
    }

    // 2. Ensure Brands
    const brandMap = {};
    for (const brandData of BRANDS_DATA) {
      let brand = await Brand.findOne({ slug: brandData.slug });
      if (!brand) {
        brand = await Brand.create(brandData);
        console.log(`[SeedUploads] Created brand: ${brand.name}`);
      }
      brandMap[brand.slug] = brand._id;
    }

    // 3. Scan Upload Folders
    const subdirs = [
      { relativePath: "shirts", categorySlug: "shirts", defaultGender: "Unisex", brandSlug: "elanor-atelier" },
      { relativePath: "tops", categorySlug: "tops", defaultGender: "Women", brandSlug: "luna-luxe" },
      { relativePath: "Denime/Men", categorySlug: "denim", defaultGender: "Men", brandSlug: "noir-denim" },
      { relativePath: "Denime/women", categorySlug: "denim", defaultGender: "Women", brandSlug: "noir-denim" },
    ];

    let totalProductsSeeded = 0;

    for (const target of subdirs) {
      const fullPath = path.join(UPLOADS_DIR, target.relativePath);
      if (!fs.existsSync(fullPath)) {
        console.warn(`[SeedUploads] Directory not found: ${fullPath}`);
        continue;
      }

      const files = fs.readdirSync(fullPath).filter((f) => /\.(png|jpg|jpeg|webp|avif)$/i.test(f));
      console.log(`[SeedUploads] Found ${files.length} images in ${target.relativePath}`);

      for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        // Web accessible static URL (e.g. /uploads/shirts/filename.png)
        const webUrl = `/uploads/${target.relativePath.replace(/\\/g, "/")}/${encodeURIComponent(filename)}`;
        // Full local endpoint fallback URL for maximum compatibility
        const fullUrl = `http://localhost:3000${webUrl}`;

        const name = formatTitle(target.relativePath, filename, i);
        const slug = generateSlug(target.relativePath, filename, i);

        const price = Math.floor(Math.random() * 2000) + 1499; // Price between 1499 and 3499
        const discount = Math.floor(Math.random() * 25) + 10; // Discount 10% to 35%

        const categoryId = categoryMap[target.categorySlug] || Object.values(categoryMap)[0];
        const brandId = brandMap[target.brandSlug] || Object.values(brandMap)[0];

        const productData = {
          name,
          slug,
          description: `Crafted from top-tier materials, this ${target.categorySlug} piece embodies timeless luxury and exceptional tailored comfort. Designed for versatile styling.`,
          gender: target.defaultGender,
          price,
          discount,
          isFeatured: i < 3, // mark first few in each category as featured
          isPublished: true,
          status: "active",
          category: categoryId,
          brand: brandId,
          images: [
            { url: fullUrl, alt: `${name} Front` },
            { url: fullUrl, alt: `${name} Detail` },
          ],
          variants: [
            {
              color: { name: "Signature Luxe", hex: "#1f2937" },
              sizes: [
                { size: "S", stock: 15 },
                { size: "M", stock: 25 },
                { size: "L", stock: 20 },
                { size: "XL", stock: 10 },
              ],
            },
          ],
        };

        const existing = await Product.findOne({ slug });
        if (!existing) {
          await Product.create(productData);
          totalProductsSeeded++;
          console.log(`[+] Seeded uploaded product: ${name}`);
        } else {
          await Product.updateOne({ slug }, productData);
          totalProductsSeeded++;
          console.log(`[*] Updated uploaded product: ${name}`);
        }
      }
    }

    console.log(`\n🎉 Successfully processed and seeded ${totalProductsSeeded} products from uploads folder!`);
  } catch (err) {
    console.error("[SeedUploads] Error seeding uploaded products:", err);
  } finally {
    if (isStandalone) {
      await mongoose.disconnect();
      console.log("[SeedUploads] Disconnected from MongoDB.");
    }
  }
}

if (require.main === module) {
  seedUploads(true);
}

module.exports = seedUploads;
