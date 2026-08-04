import { create } from "zustand";
import { cartService } from "../services/cart.service";

export const useCartStore = create((set, get) => ({
  cart: [],
  totalAmount: 0,
  loading: false,

  fetchServerCart: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      set({ loading: true });
      const res = await cartService.getCart();
      const serverItems = res.data?.items || res.items || [];
      if (Array.isArray(serverItems)) {
        const formatted = serverItems.map((item) => ({
          _id: item._id,
          product: item.product?._id || item.product,
          name: item.product?.name || item.name || "Product",
          price: item.price || item.product?.price || 0,
          discount: item.discount || item.product?.discount || 0,
          image: item.product?.images?.[0]?.url || item.image || "",
          size: item.size || "M",
          color: item.color || { name: "Standard", hex: "#000000" },
          quantity: item.quantity || 1,
        }));
        set({ cart: formatted, totalAmount: calculateTotal(formatted) });
      }
    } catch (err) {
      console.warn("Failed fetching server cart:", err.message);
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (item) => {
    set((state) => {
      const existing = state.cart.find(
        (i) => i.product === item.product && i.size === item.size && i.color?.name === item.color?.name
      );
      let updated;
      if (existing) {
        updated = state.cart.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      } else {
        updated = [...state.cart, { ...item, quantity: item.quantity || 1 }];
      }
      return { cart: updated, totalAmount: calculateTotal(updated) };
    });

    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        await cartService.addToCart({
          product: item.product || item._id,
          size: item.size || "M",
          color: item.color || { name: "Standard", hex: "#000000" },
          quantity: item.quantity || 1,
        });
      } catch (err) {
        console.warn("Server cart sync error:", err.message);
      }
    }
  },

  removeFromCart: async (index) => {
    const currentCart = get().cart;
    const targetItem = currentCart[index];
    set((state) => {
      const updated = state.cart.filter((_, i) => i !== index);
      return { cart: updated, totalAmount: calculateTotal(updated) };
    });

    const token = localStorage.getItem("accessToken");
    if (token && targetItem?._id) {
      try {
        await cartService.removeCartItem(targetItem._id);
      } catch (err) {
        console.warn("Server cart remove item error:", err.message);
      }
    }
  },

  updateQuantity: async (index, qty) => {
    const currentCart = get().cart;
    const targetItem = currentCart[index];
    const newQty = Math.max(1, qty);
    set((state) => {
      const updated = state.cart.map((item, i) =>
        i === index ? { ...item, quantity: newQty } : item
      );
      return { cart: updated, totalAmount: calculateTotal(updated) };
    });

    const token = localStorage.getItem("accessToken");
    if (token && targetItem?._id) {
      try {
        await cartService.updateCartItem(targetItem._id, newQty);
      } catch (err) {
        console.warn("Server cart update quantity error:", err.message);
      }
    }
  },

  clearCart: async () => {
    set({ cart: [], totalAmount: 0 });
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.warn("Server cart clear error:", err.message);
      }
    }
  },
}));

function calculateTotal(items) {
  return items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
}
