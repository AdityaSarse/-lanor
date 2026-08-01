import React from "react";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { Award, Plus, Search } from "lucide-react";

const FALLBACK_BRANDS = [
  { _id: "1", name: "Élanor",      slug: "elanor",      productCount: 42, country: "India",  status: "Active" },
  { _id: "2", name: "Vionellae",   slug: "vionellae",   productCount: 18, country: "France", status: "Active" },
  { _id: "3", name: "Luxara",      slug: "luxara",      productCount: 11, country: "Italy",  status: "Active" },
  { _id: "4", name: "PureForm",    slug: "pureform",    productCount: 7,  country: "India",  status: "Draft" },
  { _id: "5", name: "ActiveEdge",  slug: "activeedge",  productCount: 5,  country: "USA",    status: "Active" },
];

export const AdminBrands = () => {
  const [search, setSearch] = React.useState("");
  const filtered = FALLBACK_BRANDS.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Brands" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4a6d98] focus:outline-none rounded-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#0d2137] text-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors rounded-sm cursor-pointer">
            <Plus className="h-4 w-4" /> Add Brand
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-900">
              All Brands ({filtered.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Brand Name</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Country</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((brand) => (
                  <tr key={brand._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-sm bg-[#0d2137]/10 flex items-center justify-center">
                          <Award className="h-3.5 w-3.5 text-[#0d2137]" />
                        </div>
                        <span className="font-semibold text-gray-900 text-[13px]">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[12px] text-gray-500 font-mono">{brand.slug}</td>
                    <td className="px-6 py-3.5 text-[12px] text-gray-600">{brand.country}</td>
                    <td className="px-6 py-3.5 text-[13px] font-semibold text-gray-700">{brand.productCount}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                        brand.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {brand.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="px-3 py-1 text-[11px] font-semibold text-gray-600 hover:text-[#0d2137] hover:bg-gray-100 rounded-sm transition-colors cursor-pointer">Edit</button>
                        <button className="px-3 py-1 text-[11px] font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
