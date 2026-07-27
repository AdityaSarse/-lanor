import React from "react";
import { Route } from "react-router-dom";
import { CustomerLayout } from "../layouts/CustomerLayout";
import { HomePage } from "../pages/customer/HomePage";
import { ProductsPage } from "../pages/customer/ProductsPage";
import { ProductDetailPage } from "../pages/customer/ProductDetailPage";
import { CartPage } from "../pages/customer/CartPage";
import { CheckoutPage } from "../pages/customer/CheckoutPage";
import { OrdersPage } from "../pages/customer/OrdersPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const CustomerRoutes = (
  <Route path="/" element={<CustomerLayout />}>
    <Route index element={<HomePage />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="products/:id" element={<ProductDetailPage />} />
    <Route path="cart" element={<CartPage />} />
    
    <Route element={<ProtectedRoute />}>
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="orders" element={<OrdersPage />} />
    </Route>
  </Route>
);
