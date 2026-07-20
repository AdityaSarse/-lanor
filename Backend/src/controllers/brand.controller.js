const asyncHandler  = require("../utils/asyncHandler");
const ApiResponse   = require("../utils/ApiResponse");
const brandService  = require("../services/brand.service");

// ─────────────────────────────────────────────────────────────────────────────
// Create Brand
// POST /api/v1/brands
// ─────────────────────────────────────────────────────────────────────────────
const createBrand = asyncHandler(async (req, res) => {
    const brand = await brandService.createBrand(req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, brand, "Brand created successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Get All Brands
// GET /api/v1/brands
// ─────────────────────────────────────────────────────────────────────────────
const getAllBrands = asyncHandler(async (req, res) => {
    const { brands, total, page, totalPages } =
        await brandService.getAllBrands(req.query);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                brands,
                "Brands fetched successfully",
                { total, page, totalPages }
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Brand By ID
// GET /api/v1/brands/:id
// ─────────────────────────────────────────────────────────────────────────────
const getBrandById = asyncHandler(async (req, res) => {
    const brand = await brandService.getBrandById(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, brand, "Brand fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Brand By Slug
// GET /api/v1/brands/slug/:slug
// ─────────────────────────────────────────────────────────────────────────────
const getBrandBySlug = asyncHandler(async (req, res) => {
    const brand = await brandService.getBrandBySlug(req.params.slug);

    return res
        .status(200)
        .json(new ApiResponse(200, brand, "Brand fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Update Brand
// PATCH /api/v1/brands/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateBrand = asyncHandler(async (req, res) => {
    const brand = await brandService.updateBrand(req.params.id, req.body);

    return res
        .status(200)
        .json(new ApiResponse(200, brand, "Brand updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Delete Brand (Soft Delete)
// DELETE /api/v1/brands/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteBrand = asyncHandler(async (req, res) => {
    await brandService.deleteBrand(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Brand deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Featured Brands
// GET /api/v1/brands/featured
// ─────────────────────────────────────────────────────────────────────────────
const getFeaturedBrands = asyncHandler(async (req, res) => {
    const brands = await brandService.getFeaturedBrands();

    return res
        .status(200)
        .json(new ApiResponse(200, brands, "Featured brands fetched successfully"));
});

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
