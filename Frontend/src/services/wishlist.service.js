import apiClient from "../utils/axios";
import { ENDPOINTS } from "../constants/api.constants";

export const wishlistService = {
  getWishlist: async (params) => {
    const response = await apiClient.get(ENDPOINTS.WISHLIST.GET, { params });
    return response.data;
  },
  addToWishlist: async (productId) => {
    const response = await apiClient.post(ENDPOINTS.WISHLIST.ADD(productId));
    return response.data;
  },
  removeFromWishlist: async (productId) => {
    const response = await apiClient.delete(ENDPOINTS.WISHLIST.REMOVE(productId));
    return response.data;
  },
  clearWishlist: async () => {
    const response = await apiClient.delete(ENDPOINTS.WISHLIST.CLEAR);
    return response.data;
  },
};
