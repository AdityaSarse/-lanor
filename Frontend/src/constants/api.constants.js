export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://lanor.onrender.com/api/v1";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    REFRESH: "/auth/refresh-token",
  },
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (id) => `/products/${id}`,
    CREATE: "/products",
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
  },
  CATEGORIES: {
    LIST: "/categories",
    DETAIL: (id) => `/categories/${id}`,
    CREATE: "/categories",
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },
  BRANDS: {
    LIST: "/brands",
    DETAIL: (id) => `/brands/${id}`,
    CREATE: "/brands",
    UPDATE: (id) => `/brands/${id}`,
    DELETE: (id) => `/brands/${id}`,
  },
  COUPONS: {
    LIST: "/coupons",
    DETAIL: (id) => `/coupons/${id}`,
    CREATE: "/coupons",
    UPDATE: (id) => `/coupons/${id}`,
    DELETE: (id) => `/coupons/${id}`,
    VALIDATE: "/coupons/validate",
  },
  CART: {
    GET: "/cart",
    ADD: "/cart",
    UPDATE: (id) => `/cart/${id}`,
    DELETE: (id) => `/cart/${id}`,
    CLEAR: "/cart",
  },
  WISHLIST: {
    GET: "/wishlist",
    ADD: (productId) => `/wishlist/${productId}`,
    REMOVE: (productId) => `/wishlist/${productId}`,
    CLEAR: "/wishlist",
  },
  ADDRESS: {
    LIST: "/address",
    CREATE: "/address",
    UPDATE: (id) => `/address/${id}`,
    DELETE: (id) => `/address/${id}`,
    SET_DEFAULT: (id) => `/address/${id}/default`,
  },
  ORDERS: {
    MY_ORDERS: "/orders",
    PLACE: "/orders",
    DETAIL: (id) => `/orders/${id}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    CANCEL: (id) => `/orders/${id}/cancel`,
  },
  PAYMENTS: {
    CREATE: "/payments/create",
    VERIFY: "/payments/verify",
    REFUND: (id) => `/payments/${id}/refund`,
  },
  UPLOAD: {
    SINGLE: "/upload/single",
    MULTIPLE: "/upload/multiple",
  },
};

