import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cart: [],
  totalAmount: 0,
  addToCart: (item) => {
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
  },
  removeFromCart: (index) => {
    set((state) => {
      const updated = state.cart.filter((_, i) => i !== index);
      return { cart: updated, totalAmount: calculateTotal(updated) };
    });
  },
  updateQuantity: (index, qty) => {
    set((state) => {
      const updated = state.cart.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, qty) } : item
      );
      return { cart: updated, totalAmount: calculateTotal(updated) };
    });
  },
  clearCart: () => set({ cart: [], totalAmount: 0 }),
}));

function calculateTotal(items) {
  return items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
}
