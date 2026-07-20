const Brand   = require("../models/brand.model");
const Product  = require("../models/products.model");  // note: products.model (plural)
const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Base filter that excludes soft-deleted documents. */
const ALIVE = { deletedAt: null };

// ─────────────────────────────────────────────────────────────────────────────
// Brand Service
// ─────────────────────────────────────────────────────────────────────────────

// ─── createBrand ──────────────────────────────────────────────────────────────
/**
 * Creates a new brand after validating slug uniqueness.
 *
 * @param {Object} data - Validated brand fields from the controller.
 * @returns {Promise<Brand>}
 * @throws {ApiError} 409 if slug is already taken.
 */
const createBrand = async (data) => {
    const slugTaken = await Brand.exists({ slug: data.slug });
    if (slugTaken) {
        throw new ApiError(409, "A brand with this slug already exists");
    }

    return Brand.create(data);
};

// ─── getAllBrands ─────────────────────────────────────────────────────────────
/**
 * Returns a paginated, filterable list of brands.
 *
 * Supported filters: page, limit, search, status, sort
 *
 * @param {Object} filters - Parsed query params from the controller.
 * @returns {Promise<{brands, total, page, totalPages}>}
 */
const getAllBrands = async (filters = {}) => {
    const {
        page   = 1,
        limit  = 20,
        search,
        status,
        sort   = "name"
    } = filters;

    const query = { ...ALIVE };

    // Full-text search across name and description using the brand_text_search index
    if (search) {
        query.$text = { $search: search };
    }

    if (status) query.status = status;

    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const allowedSorts = new Set([
        "name", "-name",
        "createdAt", "-createdAt"
    ]);
    const sortField = allowedSorts.has(sort) ? sort : "name";

    const [brands, total] = await Promise.all([
        Brand.find(query)
            .sort(sortField)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Brand.countDocuments(query)
    ]);

    return {
        brands,
        total,
        page:       pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
};

// ─── getBrandById ─────────────────────────────────────────────────────────────
/**
 * Finds a single brand by its MongoDB ObjectId.
 *
 * @param {string} id - MongoDB ObjectId string.
 * @returns {Promise<Brand>}
 * @throws {ApiError} 404 if not found or soft-deleted.
 */
const getBrandById = async (id) => {
    const brand = await Brand.findOne({ _id: id, ...ALIVE }).lean();

    if (!brand) {
        throw new ApiError(404, "Brand not found");
    }

    return brand;
};

// ─── getBrandBySlug ───────────────────────────────────────────────────────────
/**
 * Finds a single brand by its URL-friendly slug.
 * Used by public routes like GET /brands/slug/nike.
 *
 * @param {string} slug - The brand slug.
 * @returns {Promise<Brand>}
 * @throws {ApiError} 404 if not found or soft-deleted.
 */
const getBrandBySlug = async (slug) => {
    const brand = await Brand.findOne({ slug, ...ALIVE }).lean();

    if (!brand) {
        throw new ApiError(404, "Brand not found");
    }

    return brand;
};

// ─── updateBrand ──────────────────────────────────────────────────────────────
/**
 * Partially updates a brand.
 * Re-validates slug uniqueness only when the slug is actually changing.
 *
 * @param {string} id   - MongoDB ObjectId of the brand to update.
 * @param {Object} data - Validated partial fields from the controller.
 * @returns {Promise<Brand>}
 * @throws {ApiError} 404 not found | 409 slug conflict.
 */
const updateBrand = async (id, data) => {
    const brand = await Brand.findOne({ _id: id, ...ALIVE });
    if (!brand) {
        throw new ApiError(404, "Brand not found");
    }

    // Only check uniqueness if the slug is actually changing
    if (data.slug && data.slug !== brand.slug) {
        const slugTaken = await Brand.exists({ slug: data.slug, _id: { $ne: id } });
        if (slugTaken) {
            throw new ApiError(409, "A brand with this slug already exists");
        }
    }

    Object.assign(brand, data);
    await brand.save();

    return brand;
};

// ─── deleteBrand ──────────────────────────────────────────────────────────────
/**
 * Soft-deletes a brand by stamping `deletedAt`.
 * Blocked if active products still reference this brand.
 *
 * @param {string} id - MongoDB ObjectId string.
 * @returns {Promise<void>}
 * @throws {ApiError} 404 not found | 400 has active products.
 */
const deleteBrand = async (id) => {
    const brand = await Brand.findOne({ _id: id, ...ALIVE });
    if (!brand) {
        throw new ApiError(404, "Brand not found");
    }

    const hasProducts = await Product.exists({ brand: id, deletedAt: null });
    if (hasProducts) {
        throw new ApiError(
            400,
            "Cannot delete a brand with active products. " +
            "Remove or reassign the products first."
        );
    }

    brand.deletedAt = new Date();
    await brand.save();
};

// ─── getFeaturedBrands ────────────────────────────────────────────────────────
/**
 * Returns active, non-deleted brands marked as featured.
 * Sorted alphabetically by name.
 *
 * @returns {Promise<Brand[]>}
 */
const getFeaturedBrands = async () => {
    return Brand.find({
        ...ALIVE,
        status:     "active",
        isFeatured: true
    })
        .sort("name")
        .lean();
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createBrand,
    getAllBrands,
    getBrandById,
    getBrandBySlug,
    updateBrand,
    deleteBrand,
    getFeaturedBrands
};
