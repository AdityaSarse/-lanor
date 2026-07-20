const Category = require("../models/category.model");
const ApiError  = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Base filter that excludes soft-deleted documents. */
const ALIVE = { deletedAt: null };

// ─────────────────────────────────────────────────────────────────────────────
// Category Service
// ─────────────────────────────────────────────────────────────────────────────

// ─── createCategory ───────────────────────────────────────────────────────────
/**
 * Creates a new category.
 *
 * - Validates slug uniqueness.
 * - Resolves parent → sets level = parent.level + 1, else level = 0.
 *
 * @param {Object} data - Validated category fields from the controller.
 * @returns {Promise<Category>} The newly created category document.
 * @throws {ApiError} 409 slug conflict | 404 parent not found.
 */
const createCategory = async (data) => {
    // ── 1. Slug uniqueness ────────────────────────────────────────────────────
    const slugTaken = await Category.exists({ slug: data.slug });
    if (slugTaken) {
        throw new ApiError(409, "A category with this slug already exists");
    }

    // ── 2. Resolve parent & level ─────────────────────────────────────────────
    if (data.parent) {
        const parentCategory = await Category.findOne({ _id: data.parent, ...ALIVE });
        if (!parentCategory) {
            throw new ApiError(404, "Parent category not found");
        }
        // Level is always derived from the parent, not trusted from the client
        data.level = parentCategory.level + 1;
    } else {
        data.level = 0;
    }

    // ── 3. Create & return populated ─────────────────────────────────────────
    const category = await Category.create(data);
    return Category.findById(category._id).populate("parent", "name slug level");
};

// ─── getAllCategories ─────────────────────────────────────────────────────────
/**
 * Returns a paginated, filterable list of categories.
 *
 * Supported filters: page, limit, search, status, parent, sort
 *
 * @param {Object} filters - Parsed query params from the controller.
 * @returns {Promise<{categories, total, page, totalPages}>}
 */
const getAllCategories = async (filters = {}) => {
    const {
        page   = 1,
        limit  = 20,
        search,
        status,
        parent,
        sort   = "displayOrder"   // ascending display order by default
    } = filters;

    const query = { ...ALIVE };

    // Case-insensitive partial name match
    if (search) {
        query.name = { $regex: search, $options: "i" };
    }

    if (status) query.status = status;

    // parent=null → root categories | parent=<id> → children of that category
    if (parent !== undefined) {
        query.parent = parent === "null" ? null : parent;
    }

    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const allowedSorts = new Set([
        "displayOrder", "-displayOrder",
        "name", "-name",
        "createdAt", "-createdAt",
        "level", "-level"
    ]);
    const sortField = allowedSorts.has(sort) ? sort : "displayOrder";

    const [categories, total] = await Promise.all([
        Category.find(query)
            .populate("parent", "name slug")
            .sort(sortField)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Category.countDocuments(query)
    ]);

    return {
        categories,
        total,
        page:       pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
};

// ─── getCategoryById ──────────────────────────────────────────────────────────
/**
 * Finds a single category by its MongoDB ObjectId.
 *
 * @param {string} id - MongoDB ObjectId string.
 * @returns {Promise<Category>}
 * @throws {ApiError} 404 if not found or soft-deleted.
 */
const getCategoryById = async (id) => {
    const category = await Category.findOne({ _id: id, ...ALIVE })
        .populate("parent", "name slug level")
        .lean();

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return category;
};

// ─── getCategoryBySlug ────────────────────────────────────────────────────────
/**
 * Finds a single category by its URL-friendly slug.
 * Used by public-facing routes like GET /categories/slug/men.
 *
 * @param {string} slug - The category slug.
 * @returns {Promise<Category>}
 * @throws {ApiError} 404 if not found or soft-deleted.
 */
const getCategoryBySlug = async (slug) => {
    const category = await Category.findOne({ slug, ...ALIVE })
        .populate("parent", "name slug level")
        .lean();

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return category;
};

// ─── updateCategory ───────────────────────────────────────────────────────────
/**
 * Partially updates a category.
 *
 * Re-validates:
 *   - Slug uniqueness (only when slug is changing).
 *   - Parent exists (only when parent is changing).
 *   - A category cannot become its own parent.
 *   - Level is recalculated from the new parent if parent changes.
 *
 * @param {string} id   - MongoDB ObjectId of the category to update.
 * @param {Object} data - Validated partial fields from the controller.
 * @returns {Promise<Category>} The updated, populated category document.
 * @throws {ApiError} 404 not found | 409 slug conflict | 400 self-parent.
 */
const updateCategory = async (id, data) => {
    // ── 1. Confirm category exists ────────────────────────────────────────────
    const category = await Category.findOne({ _id: id, ...ALIVE });
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // ── 2. Slug uniqueness (only if slug is changing) ─────────────────────────
    if (data.slug && data.slug !== category.slug) {
        const slugTaken = await Category.exists({ slug: data.slug, _id: { $ne: id } });
        if (slugTaken) {
            throw new ApiError(409, "A category with this slug already exists");
        }
    }

    // ── 3. Parent validation (only if parent is changing) ─────────────────────
    if (data.parent !== undefined) {
        if (data.parent !== null) {
            // Prevent a category from being set as its own parent
            if (data.parent.toString() === id.toString()) {
                throw new ApiError(400, "A category cannot be its own parent");
            }

            const parentCategory = await Category.findOne({ _id: data.parent, ...ALIVE });
            if (!parentCategory) {
                throw new ApiError(404, "Parent category not found");
            }

            // Recalculate level from the new parent
            data.level = parentCategory.level + 1;
        } else {
            // Promoted to root
            data.level = 0;
        }
    }

    // ── 4. Apply & persist ────────────────────────────────────────────────────
    Object.assign(category, data);
    await category.save();

    return Category.findById(category._id).populate("parent", "name slug level");
};

// ─── deleteCategory ───────────────────────────────────────────────────────────
/**
 * Soft-deletes a category by stamping `deletedAt`.
 * Prevents deletion if active child categories still exist.
 *
 * @param {string} id - MongoDB ObjectId string.
 * @returns {Promise<void>}
 * @throws {ApiError} 404 not found | 400 has active children.
 */
const deleteCategory = async (id) => {
    const category = await Category.findOne({ _id: id, ...ALIVE });
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Guard: prevent deleting a parent that still has active children
    const hasChildren = await Category.exists({ parent: id, ...ALIVE });
    if (hasChildren) {
        throw new ApiError(
            400,
            "Cannot delete a category that has active sub-categories. " +
            "Delete or reassign the sub-categories first."
        );
    }

    category.deletedAt = new Date();
    await category.save();
};

// ─── getFeaturedCategories ────────────────────────────────────────────────────
/**
 * Returns active, non-deleted categories marked as featured.
 * Sorted by displayOrder for consistent menu rendering.
 *
 * @returns {Promise<Category[]>}
 */
const getFeaturedCategories = async () => {
    const categories = await Category.find({
        ...ALIVE,
        status:     "active",
        isFeatured: true
    })
        .sort("displayOrder")
        .lean();

    return categories;
};

// ─── getCategoryTree ──────────────────────────────────────────────────────────
/**
 * Builds a nested category tree for frontend navigation menus.
 *
 * Strategy:
 *   1. Fetch all active, non-deleted categories in one query.
 *   2. Build a map keyed by id.
 *   3. Walk the flat list and nest each child under its parent.
 *   4. Return only root nodes (parent === null) — children are nested inside.
 *
 * Time complexity: O(n) — single DB round-trip + linear in-memory pass.
 *
 * Example response:
 *   [
 *     { name: "Women", children: [
 *         { name: "Tops", children: [{ name: "T-Shirts" }] },
 *         { name: "Bottoms", children: [] }
 *     ]},
 *     ...
 *   ]
 *
 * @returns {Promise<Object[]>} Nested tree of category nodes.
 */
const getCategoryTree = async () => {
    const categories = await Category.find({ ...ALIVE, status: "active" })
        .sort("displayOrder")
        .lean();

    // Map id → node (with an empty children array attached)
    const map = {};
    categories.forEach((cat) => {
        map[cat._id.toString()] = { ...cat, children: [] };
    });

    const roots = [];

    categories.forEach((cat) => {
        const node = map[cat._id.toString()];
        if (cat.parent) {
            const parentNode = map[cat.parent.toString()];
            if (parentNode) {
                parentNode.children.push(node);
            }
            // If parent was deleted/inactive and not in the map,
            // promote this node to root rather than silently dropping it
            else {
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    return roots;
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    getFeaturedCategories,
    getCategoryTree
};
