const Address  = require("../models/addresses.models");
const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds an address by id that belongs to the given user.
 * Throws 404 if it doesn't exist or belongs to a different user.
 * Used by every function that operates on a specific address.
 *
 * @param {string} userId    - req.user._id from verifyJWT.
 * @param {string} addressId - Route param :id.
 * @returns {Promise<Address>} Mongoose document (not .lean(), so .save() works).
 */
const getAddressOrThrow = async (userId, addressId) => {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
        throw new ApiError(404, "Address not found");
    }
    return address;
};

/**
 * Unsets isDefault on all addresses belonging to the user.
 * Called before setting a new default so only one address is ever default.
 *
 * @param {string} userId
 */
const clearCurrentDefault = async (userId) => {
    await Address.updateMany(
        { user: userId, isDefault: true },   // only touch the current default
        { $set: { isDefault: false } }
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Address Service
// ─────────────────────────────────────────────────────────────────────────────

// ─── createAddress ────────────────────────────────────────────────────────────
/**
 * Creates a new address for the logged-in user.
 *
 * Default logic:
 *   - If this is the user's first address → automatically make it default.
 *   - If isDefault: true is explicitly passed → unset the old default first.
 *   - Otherwise → isDefault stays false.
 *
 * @param {string} userId      - req.user._id from verifyJWT.
 * @param {Object} addressData - Validated fields from the controller.
 * @returns {Promise<Address>}
 */
const createAddress = async (userId, addressData) => {
    const existingCount = await Address.countDocuments({ user: userId });

    // First address is always the default — user can't choose a non-default first address
    const shouldBeDefault = existingCount === 0 || addressData.isDefault === true;

    if (shouldBeDefault) {
        // Unset previous default before creating the new one
        await clearCurrentDefault(userId);
    }

    const address = await Address.create({
        ...addressData,
        user:      userId,
        isDefault: shouldBeDefault
    });

    return address;
};

// ─── getAddresses ─────────────────────────────────────────────────────────────
/**
 * Returns all addresses belonging to the logged-in user.
 * Default address is listed first, then sorted by most recently created.
 *
 * @param {string} userId - req.user._id from verifyJWT.
 * @returns {Promise<Address[]>}
 */
const getAddresses = async (userId) => {
    return Address.find({ user: userId })
        .sort({ isDefault: -1, createdAt: -1 }) // default first, then newest
        .lean();
};

// ─── getAddressById ───────────────────────────────────────────────────────────
/**
 * Fetches a single address by id, enforcing ownership.
 *
 * @param {string} userId    - req.user._id from verifyJWT.
 * @param {string} addressId - Route param :id.
 * @returns {Promise<Address>}
 */
const getAddressById = async (userId, addressId) => {
    return getAddressOrThrow(userId, addressId);
};

// ─── updateAddress ────────────────────────────────────────────────────────────
/**
 * Updates allowed fields on an address. Enforces ownership.
 *
 * If isDefault: true is set in the update:
 *   → Unsets the current default first (only one default allowed per user).
 *
 * @param {string} userId      - req.user._id from verifyJWT.
 * @param {string} addressId   - Route param :id.
 * @param {Object} updateData  - Validated partial fields from the controller.
 * @returns {Promise<Address>}
 */
const updateAddress = async (userId, addressId, updateData) => {
    const address = await getAddressOrThrow(userId, addressId);

    // Only clear the old default if this address isn't already the default.
    // Avoids an unnecessary updateMany when patching non-default fields on a
    // default address together with isDefault: true.
    if (updateData.isDefault && !address.isDefault) {
        await clearCurrentDefault(userId);
    }

    Object.assign(address, updateData);
    await address.save();

    return address;
};

// ─── deleteAddress ────────────────────────────────────────────────────────────
/**
 * Deletes an address. Enforces ownership.
 *
 * If the deleted address was the default:
 *   → Automatically promotes the most recently created remaining address
 *     to be the new default (if one exists).
 *
 * @param {string} userId    - req.user._id from verifyJWT.
 * @param {string} addressId - Route param :id.
 * @returns {Promise<void>}
 */
const deleteAddress = async (userId, addressId) => {
    const address = await getAddressOrThrow(userId, addressId);
    const wasDefault = address.isDefault;

    await address.deleteOne();

    // Promote another address to default if the deleted one was the default.
    // Promotes the OLDEST remaining address — more established / predictable
    // than the newest (e.g. Office is more likely to be the right fallback
    // than a recently added Friend's address).
    if (wasDefault) {
        const next = await Address.findOne({ user: userId }).sort({ createdAt: 1 });
        if (next) {
            next.isDefault = true;
            await next.save();
        }
    }
};

// ─── setDefaultAddress ────────────────────────────────────────────────────────
/**
 * Sets an address as the user's default without editing any other fields.
 * Dedicated endpoint for address-book UIs where users tap "Set as Default".
 *
 * Steps:
 *   1. Verify the address exists and belongs to the user.
 *   2. Unset the current default.
 *   3. Set the new default.
 *   4. Return the updated address.
 *
 * @param {string} userId    - req.user._id from verifyJWT.
 * @param {string} addressId - Route param :id.
 * @returns {Promise<Address>}
 */
const setDefaultAddress = async (userId, addressId) => {
    const address = await getAddressOrThrow(userId, addressId);

    // Already the default — return early (idempotent)
    if (address.isDefault) {
        return address;
    }

    await clearCurrentDefault(userId);

    address.isDefault = true;
    await address.save();

    return address;
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
