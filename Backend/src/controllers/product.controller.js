const productService = require("../services/product.service");
const asyncHandler   = require("../utils/asyncHandler");
const ApiResponse    = require("../utils/ApiResponse");

// ─────────────────────────────────────────────────────────────────────────────
// Create Product
// POST /api/products
// ─────────────────────────────────────────────────────────────────────────────
const createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, product, "Product created successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Get All Products
// GET /api/products
// ─────────────────────────────────────────────────────────────────────────────
const getAllProducts = asyncHandler(async (req, res) => {
    const { products, total, page, totalPages } =
        await productService.getAllProducts(req.query);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                products,
                "Products fetched successfully",
                { total, page, totalPages }
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Product By Id
// GET /api/products/:id
// ─────────────────────────────────────────────────────────────────────────────
const getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Update Product
// PUT /api/products/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(
        req.params.id,
        req.body
    );

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Delete Product (Soft Delete)
// DELETE /api/products/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Product deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Search Products
// GET /api/products/search?keyword=shirt&page=1&limit=12
// ─────────────────────────────────────────────────────────────────────────────
const searchProducts = asyncHandler(async (req, res) => {
    const { keyword, page, limit } = req.query;

    const { products, total, page: currentPage, totalPages } =
        await productService.searchProducts(keyword, { page, limit });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                products,
                "Search completed successfully",
                { total, page: currentPage, totalPages }
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// Featured Products
// GET /api/products/featured
// ─────────────────────────────────────────────────────────────────────────────
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await productService.getFeaturedProducts(req.query.limit);

    return res
        .status(200)
        .json(new ApiResponse(200, products, "Featured products fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// New Arrivals
// GET /api/products/new-arrivals
// ─────────────────────────────────────────────────────────────────────────────
const getNewArrivals = asyncHandler(async (req, res) => {
    const products = await productService.getNewArrivals(req.query.limit);

    return res
        .status(200)
        .json(new ApiResponse(200, products, "New arrivals fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Top Rated Products
// GET /api/products/top-rated
// ─────────────────────────────────────────────────────────────────────────────
const getTopRatedProducts = asyncHandler(async (req, res) => {
    const products = await productService.getTopRatedProducts(req.query.limit);

    return res
        .status(200)
        .json(new ApiResponse(200, products, "Top rated products fetched successfully"));
});

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
