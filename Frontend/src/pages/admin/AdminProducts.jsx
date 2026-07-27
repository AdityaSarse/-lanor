import React, { useState, useEffect } from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { productService } from "../../services/api.service";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Plus, Trash2, Edit } from "lucide-react";

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getAll()
      .then((res) => setProducts(res.data?.products || res.products || []))
      .catch(() => {
        setProducts([
          {
            _id: "1",
            name: "Silk Evening Gown",
            gender: "Women",
            price: 29999,
            status: "active",
          },
          {
            _id: "2",
            name: "Tailored Tuxedo Blazer",
            gender: "Men",
            price: 18999,
            status: "active",
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-left">
      <AdminHeader title="Product Inventory Management" />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">All Products ({products.length})</h2>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add New Product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-950/80 text-xs uppercase text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-3.5">Product Name</th>
              <th className="px-6 py-3.5">Category / Gender</th>
              <th className="px-6 py-3.5">Price</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map((prod) => (
              <tr key={prod._id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-6 py-4 font-bold text-white">{prod.name}</td>
                <td className="px-6 py-4 text-xs font-semibold text-purple-400">{prod.gender}</td>
                <td className="px-6 py-4 font-semibold text-white">₹{prod.price}</td>
                <td className="px-6 py-4">
                  <span className="rounded-md bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                    {prod.status || "Active"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
