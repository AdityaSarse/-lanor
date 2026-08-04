import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { wishlistService } from "../../services/wishlist.service";
import { useCartStore } from "../../store/useCartStore";
import { ProductCard } from "../../components/customer/ProductCard";
import { toast } from "sonner";

export const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistService.getWishlist();
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : (res.products || []);
      setItems(list);
    } catch (err) {
      console.warn("Failed to load wishlist", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setItems((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all items from your wishlist?")) return;
    try {
      await wishlistService.clearWishlist();
      setItems([]);
      toast.success("Wishlist cleared");
    } catch (err) {
      toast.error("Failed to clear wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1400px] px-6 py-2.5 lg:px-10">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">My Wishlist</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 text-center">
        <h1 className="text-[24px] font-bold tracking-[0.08em] text-gray-900 uppercase">
          My Saved Items ({items.length})
        </h1>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#0d2137]" />
          </div>
        ) : items.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center bg-white border border-gray-200 p-8 rounded-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-400 mb-4">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your Wishlist is Empty</h2>
            <p className="text-xs text-gray-500 mb-6 max-w-xs">
              Save your favorite luxury pieces here to keep track of items you love.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#0d2137] text-white px-7 py-3 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1a3a5c] transition-colors"
            >
              Discover Catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearAll}
                className="text-[11px] font-semibold text-gray-500 hover:text-red-600 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((prod) => (
                <div key={prod._id} className="relative group">
                  <ProductCard product={prod} />
                  <button
                    onClick={() => handleRemove(prod._id)}
                    className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-red-50 p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
