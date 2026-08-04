import apiClient from "../utils/axios";
import { ENDPOINTS } from "../constants/api.constants";

export const cartService = {
  getCart: async () => {
    const response = await apiClient.get(ENDPOINTS.CART.GET);
    return response.data;
  },
  addToCart: async (cartData) => {
    const response = await apiClient.post(ENDPOINTS.CART.ADD, cartData);
    return response.data;
  },
  updateCartItem: async (itemId, quantity) => {
    const response = await apiClient.patch(ENDPOINTS.CART.UPDATE(itemId), { quantity });
    return response.data;
  },
  removeCartItem: async (itemId) => {
    const response = await apiClient.delete(ENDPOINTS.CART.DELETE(itemId));
    return response.data;
  },
  clearCart: async () => {
    const response = await apiClient.delete(ENDPOINTS.CART.CLEAR);
    return response.data;
  },
};
