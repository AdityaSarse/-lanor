import React from "react";
import { Route } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminProducts } from "../pages/admin/AdminProducts";
import { AdminOrders } from "../pages/admin/AdminOrders";
import { ProtectedRoute } from "./ProtectedRoute";

export const AdminRoutes = (
  <Route element={<ProtectedRoute requireAdmin={true} />}>
    <Route path="/admin" element={<AdminLayout />}>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="orders" element={<AdminOrders />} />
    </Route>
  </Route>
);
