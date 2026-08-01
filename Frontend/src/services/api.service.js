import apiClient from "../utils/axios";
import { ENDPOINTS } from "../constants/api.constants";

export { categoryService } from "./category.service";

export const productService = {
  getAll: async (params) => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.DETAIL(id));
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(ENDPOINTS.PRODUCTS.UPDATE(id), data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(ENDPOINTS.PRODUCTS.DELETE(id));
    return response.data;
  },
};

export const orderService = {
  getMyOrders: async (params) => {
    const response = await apiClient.get(ENDPOINTS.ORDERS.MY_ORDERS, { params });
    return response.data;
  },
  placeOrder: async (orderData) => {
    const response = await apiClient.post(ENDPOINTS.ORDERS.PLACE, orderData);
    return response.data;
  },
  updateStatus: async (id, statusData) => {
    const response = await apiClient.patch(ENDPOINTS.ORDERS.UPDATE_STATUS(id), statusData);
    return response.data;
  },
};

export const paymentService = {
  createPayment: async (orderId) => {
    const response = await apiClient.post(ENDPOINTS.PAYMENTS.CREATE, { orderId });
    return response.data;
  },
  verifyPayment: async (paymentData) => {
    const response = await apiClient.post(ENDPOINTS.PAYMENTS.VERIFY, paymentData);
    return response.data;
  },
};
