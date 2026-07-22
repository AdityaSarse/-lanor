const asyncHandler     = require("../utils/asyncHandler");
const ApiResponse      = require("../utils/ApiResponse");
const addressService   = require("../services/address.service");

// ─────────────────────────────────────────────────────────────────────────────
// Create Address
// POST /api/v1/address
// ─────────────────────────────────────────────────────────────────────────────
const createAddress = asyncHandler(async (req, res) => {
    const address = await addressService.createAddress(req.user._id, req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, address, "Address created successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Get All Addresses
// GET /api/v1/address
// ─────────────────────────────────────────────────────────────────────────────
const getAddresses = asyncHandler(async (req, res) => {
    const addresses = await addressService.getAddresses(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Address By ID
// GET /api/v1/address/:id
// ─────────────────────────────────────────────────────────────────────────────
const getAddressById = asyncHandler(async (req, res) => {
    const address = await addressService.getAddressById(
        req.user._id,
        req.params.id
    );

    return res
        .status(200)
        .json(new ApiResponse(200, address, "Address fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Update Address
// PATCH /api/v1/address/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateAddress = asyncHandler(async (req, res) => {
    const address = await addressService.updateAddress(
        req.user._id,
        req.params.id,
        req.body
    );

    return res
        .status(200)
        .json(new ApiResponse(200, address, "Address updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Delete Address
// DELETE /api/v1/address/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteAddress = asyncHandler(async (req, res) => {
    await addressService.deleteAddress(req.user._id, req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Address deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Set Default Address
// PATCH /api/v1/address/:id/default
// ─────────────────────────────────────────────────────────────────────────────
const setDefaultAddress = asyncHandler(async (req, res) => {
    const address = await addressService.setDefaultAddress(
        req.user._id,
        req.params.id
    );

    return res
        .status(200)
        .json(new ApiResponse(200, address, "Default address updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
