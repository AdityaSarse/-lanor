const Product = require("../models/products.model");
const Category = require("../models/category.model");
// TODO: Import Brand model once the Brand module is built
// const Brand = require("../models/brand.model");

const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base query that excludes soft-deleted products.
 * Every listing/search function must include this filter.
 */
const ALIVE = { deletedAt: null };

// ─────────────────────────────────────────────────────────────────────────────
// Product Service
// ─────────────────────────────────────────────────────────────────────────────

// ─── createProduct ────────────────────────────────────────────────────────────
/**
 * Creates a new product after validating category, brand, and slug uniqueness.
 *
 * @param {Object} data - Validated product fields from the controller.
 * @returns {Promise<Product>} The newly created product document.
 * @throws {ApiError} 404 if category/brand not found, 409 if slug is taken.
 */
const createProduct = async (data) => {
    const mongoose = require("mongoose");

    // ── 1. Validate / Resolve Category ────────────────────────────────────────
    let categoryDoc = null;
    if (data.category && mongoose.Types.ObjectId.isValid(data.category)) {
        categoryDoc = await Category.findOne({ _id: data.category, deletedAt: null });
    }
    if (!categoryDoc && typeof data.category === "string" && data.category.trim()) {
        const catSearch = data.category.trim().toLowerCase();
        categoryDoc = await Category.findOne({
            $or: [{ slug: catSearch }, { name: new RegExp(`^${catSearch}$`, "i") }],
            deletedAt: null
        });
    }
    if (!categoryDoc) {
        categoryDoc = await Category.findOne({ deletedAt: null });
    }
    if (!categoryDoc) {
        categoryDoc = await Category.create({
            name: data.category || "General",
            slug: (data.category || "general").toLowerCase().replace(/[^a-z0-9]/g, "-"),
            status: "active"
        });
    }
    data.category = categoryDoc._id;

    // ── 2. Ensure Unique Slug ──────────────────────────────────────────────────
    let baseSlug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let targetSlug = baseSlug;
    let counter = 1;
    while (await Product.exists({ slug: targetSlug })) {
        targetSlug = `${baseSlug}-${counter}`;
        counter++;
    }
    data.slug = targetSlug;

    // ── 3. Create & Return ─────────────────────────────────────────────────────
    const product = await Product.create(data);
    return Product.findById(product._id)
        .populate("category", "name slug")
        .populate("subCategory", "name slug");
};

// ─── getAllProducts ───────────────────────────────────────────────────────────
/**
 * Returns a paginated, filterable, sortable list of active products.
 *
 * Supported query params (passed as `filters`):
 *   page, limit, search, category, brand, gender, status, isFeatured, sort
 *
 * @param {Object} filters - Parsed query params from the controller.
 * @returns {Promise<{products, total, page, totalPages}>}
 */
const getAllProducts = async (filters = {}) => {
    const {
        page = 1,
        limit = 12,
        search,
        category,
        brand,
        gender,
        status,
        isFeatured,
        sort = "-createdAt"   // newest first by default
    } = filters;

    const query = { ...ALIVE };

    // ── Full-text search ──────────────────────────────────────────────────────
    if (search) {
        query.$text = { $search: search };
    }

    // ── Category filter ───────────────────────────────────────────────────────
    if (category) {
        const mongoose = require("mongoose");
        if (mongoose.Types.ObjectId.isValid(category)) {
            query.category = category;
        } else {
            const rawCat  = category.toLowerCase().trim();
            // Build multiple slug variations to maximise slug match chances
            const singularCat = rawCat.endsWith("s") ? rawCat.slice(0, -1) : rawCat;
            const pluralCat   = rawCat.endsWith("s") ? rawCat : rawCat + "s";

            const catDoc = await Category.findOne({
                $or: [
                    { slug: rawCat },
                    { slug: singularCat },
                    { slug: pluralCat },
                    { name: new RegExp(`^${rawCat}$`, "i") },
                    { name: new RegExp(`^${singularCat}$`, "i") },
                    { name: new RegExp(rawCat, "i") },
                ],
                deletedAt: null
            });

            if (catDoc) {
                query.category = catDoc._id;
            } else {
                // Fallback: name/description fuzzy match — don't set query.category so no cast error
                // Use $or only when $text is NOT already set to avoid index conflicts
                if (!query.$text) {
                    query.$or = [
                        { name: new RegExp(singularCat, "i") },
                        { description: new RegExp(singularCat, "i") },
                        { tags: new RegExp(singularCat, "i") },
                    ];
                }
            }
        }
    }

    if (brand)      query.brand  = brand;
    if (gender)     query.gender = new RegExp(`^${gender}$`, "i");
    if (status)     query.status = status;
    if (isFeatured !== undefined) {
        query.isFeatured = isFeatured === "true" || isFeatured === true;
    }

    // ── Pagination ────────────────────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10))); // raised cap to 200
    const skip     = (pageNum - 1) * limitNum;

    // ── Sort ──────────────────────────────────────────────────────────────────
    const allowedSorts = new Set([
        "price", "-price",
        "createdAt", "-createdAt",
        "averageRating", "-averageRating",
        "name", "-name",
        "isFeatured", "-isFeatured",  // allow featured sort from frontend
    ]);
    const sortField = allowedSorts.has(sort) ? sort : "-createdAt";

    const [products, total] = await Promise.all([
        Product.find(query)
            .populate("category", "name slug")
            .sort(sortField)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Product.countDocuments(query)
    ]);

    return {
        products,
        total,
        page:       pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
};

// ─── getProductById ───────────────────────────────────────────────────────────
/**
 * Fetches a single product by its MongoDB ObjectId, populated with
 * category and brand references.
 *
 * @param {string} id - MongoDB ObjectId string.
 * @returns {Promise<Product>}
 * @throws {ApiError} 404 if product not found or soft-deleted.
 */
const getProductById = async (id) => {
    const product = await Product.findOne({ _id: id, ...ALIVE })
        .populate("category",    "name slug")
        .populate("subCategory", "name slug")
        // TODO: .populate("brand", "name logo") — uncomment once Brand model exists
        .lean();

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return product;
};

// ─── updateProduct ────────────────────────────────────────────────────────────
/**
 * Partially updates a product. Re-validates category, brand, and slug
 * uniqueness only when those specific fields are being changed.
 *
 * @param {string} id   - MongoDB ObjectId of the product to update.
 * @param {Object} data - Validated partial fields from the controller.
 * @returns {Promise<Product>} The updated product document.
 * @throws {ApiError} 404 if product/category/brand not found, 409 if slug conflict.
 */
const updateProduct = async (id, data) => {
    // ── 1. Confirm product exists ─────────────────────────────────────────────
    const product = await Product.findOne({ _id: id, ...ALIVE });
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // ── 2. Re-validate Category (only if changing) ───────────────────────────
    if (data.category) {
        const category = await Category.findOne({ _id: data.category, deletedAt: null });
        if (!category) {
            throw new ApiError(404, "Category not found");
        }
    }

    // ── 3. Re-validate SubCategory (only if changing) ────────────────────────
    if (data.subCategory) {
        const subCategory = await Category.findOne({ _id: data.subCategory, deletedAt: null });
        if (!subCategory) {
            throw new ApiError(404, "Sub-category not found");
        }
    }

    // ── 4. Re-validate Brand (only if changing) ───────────────────────────────
    // TODO: Uncomment once Brand model is built
    // if (data.brand) {
    //     const brand = await Brand.findById(data.brand);
    //     if (!brand) throw new ApiError(404, "Brand not found");
    // }

    // ── 5. Slug uniqueness — only check if slug is actually changing ──────────
    if (data.slug && data.slug !== product.slug) {
        const slugTaken = await Product.exists({ slug: data.slug, _id: { $ne: id } });
        if (slugTaken) {
            throw new ApiError(409, "A product with this slug already exists");
        }
    }

    // ── 6. Apply changes & persist (return populated) ───────────────────────
    Object.assign(product, data);
    await product.save();

    return Product.findById(product._id)
        .populate("category",    "name slug")
        .populate("subCategory", "name slug");
        // TODO: .populate("brand", "name logo") — uncomment once Brand model exists
};

// ─── deleteProduct ────────────────────────────────────────────────────────────
/**
 * Soft-deletes a product by stamping `deletedAt` with the current timestamp.
 * The document is preserved in MongoDB for order history and analytics.
 *
 * @param {string} id - MongoDB ObjectId string.
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if product not found or already deleted.
 */
const deleteProduct = async (id) => {
    const product = await Product.findOne({ _id: id, ...ALIVE });
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    product.deletedAt = new Date();
    await product.save();
};

// ─── searchProducts ───────────────────────────────────────────────────────────
/**
 * Full-text search across name, description, and tags using MongoDB's $text
 * operator. Results are scored and sorted by relevance unless overridden.
 *
 * Requires the compound text index added to the Product model:
 *   productSchema.index({ name: "text", description: "text", tags: "text" }, ...)
 *
 * @param {string} keyword  - The raw search string from the user.
 * @param {Object} options  - Optional: page, limit, sort overrides.
 * @returns {Promise<{products, total, page, totalPages}>}
 * @throws {ApiError} 400 if keyword is empty.
 */
const searchProducts = async (keyword, options = {}) => {
    if (!keyword || !keyword.trim()) {
        throw new ApiError(400, "Search keyword is required");
    }

    const { page = 1, limit = 12 } = options;
    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const query = {
        ...ALIVE,
        status: "active",
        $text:  { $search: keyword.trim() }
    };

    // $meta textScore sorts by relevance — highest-scoring matches first
    const projection = { score: { $meta: "textScore" } };
    const sortByRelevance = { score: { $meta: "textScore" } };

    const [products, total] = await Promise.all([
        Product.find(query, projection)
            .populate("category", "name slug")
            .sort(sortByRelevance)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Product.countDocuments(query)
    ]);

    return {
        products,
        total,
        page:       pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
};

// ─── getFeaturedProducts ──────────────────────────────────────────────────────
/**
 * Returns active, non-deleted products that are marked as featured.
 * Used on the homepage hero / featured section.
 *
 * @param {number} limit - Maximum number of products to return (default 8).
 * @returns {Promise<Product[]>}
 */
const getFeaturedProducts = async (limit = 8) => {
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const products = await Product.find({
        ...ALIVE,
        isFeatured: true,
        status:     "active"
    })
        .populate("category", "name slug")
        .sort("-createdAt")
        .limit(limitNum)
        .lean();

    return products;
};

// ─── getNewArrivals ───────────────────────────────────────────────────────────
/**
 * Returns the most recently created active products.
 * Used on the homepage new arrivals strip.
 *
 * @param {number} limit - Maximum number of products to return (default 10).
 * @returns {Promise<Product[]>}
 */
const getNewArrivals = async (limit = 10) => {
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const products = await Product.find({
        ...ALIVE,
        status: "active"
    })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .lean();

    return products;
};

// ─── getTopRatedProducts ─────────────────────────────────────────────────────
/**
 * Returns products sorted by average rating then review count.
 * Wire this up once the Review module is built and averageRating/reviewCount
 * are being aggregated onto the Product document.
 *
 * @param {number} limit - Maximum number of products to return (default 10).
 * @returns {Promise<Product[]>}
 */
const getTopRatedProducts = async (limit = 10) => {
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const products = await Product.find({
        ...ALIVE,
        status:      "active",
        reviewCount: { $gt: 0 }   // only include products that actually have reviews
    })
        .populate("category", "name slug")
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(limitNum)
        .lean();

    return products;
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    getFeaturedProducts,
    getNewArrivals,
    getTopRatedProducts
};
