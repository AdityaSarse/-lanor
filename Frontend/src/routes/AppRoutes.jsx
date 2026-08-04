import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CustomerLayout } from "../layouts/CustomerLayout";
import { HomePage } from "../pages/customer/HomePage";
import { ProductsPage } from "../pages/customer/ProductsPage";
import { ProductDetailPage } from "../pages/customer/ProductDetailPage";
import { CartPage } from "../pages/customer/CartPage";
import { CheckoutPage } from "../pages/customer/CheckoutPage";
import { OrdersPage } from "../pages/customer/OrdersPage";
import { WishlistPage } from "../pages/customer/WishlistPage";
import { ProfilePage } from "../pages/customer/ProfilePage";

import { AuthLayout } from "../layouts/AuthLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";

import { AdminLayout } from "../layouts/AdminLayout";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminProducts } from "../pages/admin/AdminProducts";
import { AdminOrders } from "../pages/admin/AdminOrders";
import { AdminCategories } from "../pages/admin/AdminCategories";
import { AdminBrands } from "../pages/admin/AdminBrands";
import { AdminCoupons } from "../pages/admin/AdminCoupons";
import { AdminPayments } from "../pages/admin/AdminPayments";
import { AdminCustomers } from "../pages/admin/AdminCustomers";
import { AdminAnalytics } from "../pages/admin/AdminAnalytics";
import { AdminSettings } from "../pages/admin/AdminSettings";

import { ProtectedRoute } from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />

        {/* Protected Customer Routes — requires login */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Authentication Routes — redirect away if already logged in */}
      <Route element={<GuestRoute />}>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Protected Admin Portal Routes — requires role === "admin" */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"  element={<AdminDashboard />} />

          {/* Catalog */}
          <Route path="products"   element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands"     element={<AdminBrands />} />

          {/* Sales */}
          <Route path="orders"     element={<AdminOrders />} />
          <Route path="coupons"    element={<AdminCoupons />} />
          <Route path="payments"   element={<AdminPayments />} />

          {/* Users */}
          <Route path="customers"  element={<AdminCustomers />} />

          {/* Other */}
          <Route path="analytics"  element={<AdminAnalytics />} />
          <Route path="settings"   element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
