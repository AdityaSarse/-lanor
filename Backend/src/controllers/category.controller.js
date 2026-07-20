const categoryService = require("../services/category.service");
const asyncHandler    = require("../utils/asyncHandler");
const ApiResponse     = require("../utils/ApiResponse");

// ─────────────────────────────────────────────────────────────────────────────
// Create Category
// POST /api/v1/categories
// ─────────────────────────────────────────────────────────────────────────────
const createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, category, "Category created successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Get All Categories
// GET /api/v1/categories
// ─────────────────────────────────────────────────────────────────────────────
const getAllCategories = asyncHandler(async (req, res) => {
    const { categories, total, page, totalPages } =
        await categoryService.getAllCategories(req.query);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                categories,
                "Categories fetched successfully",
                { total, page, totalPages }
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Category By Id
// GET /api/v1/categories/:id
// ─────────────────────────────────────────────────────────────────────────────
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, category, "Category fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Category By Slug
// GET /api/v1/categories/slug/:slug
// ─────────────────────────────────────────────────────────────────────────────
const getCategoryBySlug = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    return res
        .status(200)
        .json(new ApiResponse(200, category, "Category fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Update Category
// PATCH /api/v1/categories/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(
        req.params.id,
        req.body
    );

    return res
        .status(200)
        .json(new ApiResponse(200, category, "Category updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Delete Category (Soft Delete)
// DELETE /api/v1/categories/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Category deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Featured Categories
// GET /api/v1/categories/featured
// ─────────────────────────────────────────────────────────────────────────────
const getFeaturedCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getFeaturedCategories();

    return res
        .status(200)
        .json(new ApiResponse(200, categories, "Featured categories fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Category Tree
// GET /api/v1/categories/tree
// ─────────────────────────────────────────────────────────────────────────────
const getCategoryTree = asyncHandler(async (req, res) => {
    const tree = await categoryService.getCategoryTree();

    return res
        .status(200)
        .json(new ApiResponse(200, tree, "Category tree fetched successfully"));
});

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
