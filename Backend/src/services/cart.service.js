const Cart    = require("../models/cart.model");
const Product = require("../models/products.model");
const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Product fields returned inside every cart response.
 * Centralised here so both populateCart() and getCart() always return the same shape.
 * Update once → all cart endpoints pick it up.
 */
const CART_PRODUCT_FIELDS =
    "name slug images price averageRating reviewCount status deletedAt";

// ─────────────────────────────────────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Populates product details on a cart document.
 * Centralised so every operation returns an identical shape.
 *
 * @param {string|ObjectId} cartId
 * @returns {Promise<Cart>}
 */
const populateCart = (cartId) =>
    Cart.findById(cartId)
        .populate({
            path:   "items.product",
            select: CART_PRODUCT_FIELDS
        })
        .lean();

/**
 * Calculates cart summary totals from a populated cart document.
 * These duplicate the model virtuals so populated .lean() carts still get totals.
 *
 * @param {Object} cart - Populated cart (from populateCart).
 * @returns {{ totalItems, totalQuantity, subtotal }}
 */
const calculateCartTotals = (cart) => ({
    totalItems:    cart.items.length,
    totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    // priceSnapshot = price at the moment item was added to cart
    subtotal:      cart.items.reduce(
        (sum, item) => sum + item.priceSnapshot * item.quantity,
        0
    )
});

/**
 * Validates that the requested color + size combination exists on the product
 * and has sufficient stock.
 *
 * Product variant structure:
 *   product.variants[] → { color: { name, hex }, sizes: [{ size, stock }] }
 *
 * @param {Object} product  - Mongoose product document.
 * @param {string} size     - Requested size string (e.g. "M").
 * @param {string} colorName - Requested color name (e.g. "Black").
 * @param {number} quantity  - Units requested.
 * @returns {{ variant, sizeEntry }} The matched variant and size entry.
 * @throws {ApiError} 404/400 for bad variant/size/stock.
 */
const validateVariant = (product, size, colorName, quantity) => {
    // Match color (case-insensitive for UX tolerance)
    const variant = product.variants.find(
        (v) => v.color.name.toLowerCase() === colorName.toLowerCase()
    );
    if (!variant) {
        throw new ApiError(404, `Color "${colorName}" is not available for this product`);
    }

    // Match size within the found variant
    const sizeEntry = variant.sizes.find((s) => s.size === size);
    if (!sizeEntry) {
        throw new ApiError(
            404,
            `Size "${size}" is not available in color "${colorName}"`
        );
    }

    // Stock check
    if (sizeEntry.stock < quantity) {
        throw new ApiError(
            400,
            sizeEntry.stock === 0
                ? `${colorName} / ${size} is out of stock`
                : `Only ${sizeEntry.stock} unit(s) available for ${colorName} / ${size}`
        );
    }

    return { variant, sizeEntry };
};

// ─────────────────────────────────────────────────────────────────────────────
// Cart Service
// ─────────────────────────────────────────────────────────────────────────────

// ─── addToCart ────────────────────────────────────────────────────────────────
/**
 * Adds a product variant to the user's cart.
 * If the same product + color + size already exists, increments the quantity.
 *
 * Checks:
 *   1. Product exists and is not soft-deleted.
 *   2. Product status is "active".
 *   3. Variant (color + size) exists on the product.
 *   4. Sufficient stock for the requested quantity.
 *   5. Find or create the cart.
 *   6. Merge (increment) or push (new line).
 *   7. Save and return populated cart.
 *
 * @param {string} userId - req.user._id from verifyJWT.
 * @param {Object} data   - { product, size, color: { name, hex }, quantity }.
 * @returns {Promise<{ cart, totals }>}
 */
const addToCart = async (userId, data) => {
    const {
        product: productId,
        size,
        color,
        quantity = 1
    } = data;

    // ── 1. Product exists & not soft-deleted ──────────────────────────────────
    const product = await Product.findOne({ _id: productId, deletedAt: null });
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // ── 2. Product must be active ─────────────────────────────────────────────
    if (product.status !== "active") {
        throw new ApiError(400, "This product is not available for purchase");
    }

    // ── 3 & 4. Validate variant + stock ───────────────────────────────────────
    validateVariant(product, size, color.name, quantity);

    // ── 5. Find or create cart ────────────────────────────────────────────────
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    // ── 6. Merge or push ──────────────────────────────────────────────────────
    // Two items are the same variant if they share product + color.name + size.
    const existingItem = cart.items.find(
        (item) =>
            item.product.toString() === productId.toString() &&
            item.size             === size &&
            item.color.name.toLowerCase() === color.name.toLowerCase()
    );

    if (existingItem) {
        // Validate total stock (existing qty + new qty)
        validateVariant(product, size, color.name, existingItem.quantity + quantity);
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            product:       productId,
            size,
            color:         { name: color.name, hex: color.hex || "" },
            quantity,
            priceSnapshot: product.price,
            addedAt:       new Date()
        });
    }

    await cart.save();

    // ── 7. Populate and return ────────────────────────────────────────────────
    const populated = await populateCart(cart._id);
    return { cart: populated, totals: calculateCartTotals(populated) };
};

// ─── getCart ──────────────────────────────────────────────────────────────────
/**
 * Returns the user's cart.
 * Silently filters out items whose product was soft-deleted or made inactive
 * after being added — and persists that cleanup to avoid re-filtering every time.
 *
 * @param {string} userId - req.user._id from verifyJWT.
 * @returns {Promise<{ cart, totals }>}
 */
const getCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId })
        .populate({
            path:   "items.product",
            select: CART_PRODUCT_FIELDS
        })
        .lean();

    // Empty cart — return a consistent shape
    if (!cart) {
        return {
            cart:   { items: [] },
            totals: { totalItems: 0, totalQuantity: 0, subtotal: 0 }
        };
    }

    // Filter stale items (product deleted or deactivated after it was added)
    const liveItems = cart.items.filter(
        (item) =>
            item.product &&
            item.product.deletedAt === null &&
            item.product.status   === "active"
    );

    // If anything was filtered, persist the cleanup to avoid doing it every request
    if (liveItems.length !== cart.items.length) {
        await Cart.updateOne(
            { user: userId },
            { $set: { items: liveItems.map((item) => ({ ...item, product: item.product._id })) } }
        );
        cart = { ...cart, items: liveItems };
    }

    return { cart, totals: calculateCartTotals(cart) };
};

// ─── updateCartItem ───────────────────────────────────────────────────────────
/**
 * Updates the quantity of an existing cart line item.
 * Re-validates stock against the current quantity.
 * Product, color, and size are immutable — the user must remove and re-add.
 *
 * @param {string} userId   - req.user._id from verifyJWT.
 * @param {string} itemId   - The cart item's _id.
 * @param {number} quantity - New quantity (must be ≥ 1).
 * @returns {Promise<{ cart, totals }>}
 */
const updateCartItem = async (userId, itemId, quantity) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.id(itemId);
    if (!item) {
        throw new ApiError(404, "Cart item not found");
    }

    // Re-validate stock for the new quantity
    const product = await Product.findOne({ _id: item.product, deletedAt: null });
    if (!product || product.status !== "active") {
        throw new ApiError(400, "This product is no longer available");
    }

    validateVariant(product, item.size, item.color.name, quantity);

    item.quantity = quantity;
    await cart.save();

    const populated = await populateCart(cart._id);
    return { cart: populated, totals: calculateCartTotals(populated) };
};

// ─── removeCartItem ───────────────────────────────────────────────────────────
/**
 * Removes a single line item from the cart by its _id.
 *
 * @param {string} userId - req.user._id from verifyJWT.
 * @param {string} itemId - The cart item's _id.
 * @returns {Promise<{ cart, totals }>}
 */
const removeCartItem = async (userId, itemId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
        (item) => item._id.toString() !== itemId.toString()
    );

    if (cart.items.length === initialLength) {
        throw new ApiError(404, "Cart item not found");
    }

    await cart.save();

    const populated = await populateCart(cart._id);
    return { cart: populated, totals: calculateCartTotals(populated) };
};

// ─── clearCart ────────────────────────────────────────────────────────────────
/**
 * Removes all items from the user's cart.
 * No-op if the cart doesn't exist (idempotent).
 *
 * @param {string} userId - req.user._id from verifyJWT.
 * @returns {Promise<void>}
 */
const clearCart = async (userId) => {
    await Cart.updateOne({ user: userId }, { $set: { items: [] } });
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
