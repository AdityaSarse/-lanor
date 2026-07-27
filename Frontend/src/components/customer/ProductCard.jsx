import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "../../store/useCartStore";

export const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const [hovered, setHovered] = useState(false);

  const primaryImage =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600";

  const secondaryImage =
    product.images?.[1]?.url || primaryImage;

  const discountedPrice = product.price;
  const originalPrice = product.discount > 0
    ? Math.round(product.price * (100 / (100 - product.discount)))
    : null;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      size: product.variants?.[0]?.sizes?.[0]?.size || "M",
      color: product.variants?.[0]?.color || { name: "Default" },
      image: primaryImage,
      quantity: 1,
    });
  };

  return (
    <div
      className="group relative flex flex-col bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="relative block aspect-[3/4] w-full overflow-hidden bg-gray-100">
        <img
          src={hovered ? secondaryImage : primaryImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-all duration-500"
        />

        {/* Quick Add button */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={hovered ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-0"
        >
          <button
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-2 bg-[#0d2137] py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-[#1a3a5c] transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to Bag
          </button>
        </motion.div>
      </Link>

      {/* Save Badge */}
      {product.discount > 0 && (
        <div className="mt-2">
          <span className="save-badge">Save {product.discount}%</span>
        </div>
      )}

      {/* Info */}
      <div className="mt-1.5 space-y-0.5">
        <Link to={`/products/${product._id}`}>
          <p className="text-[13px] text-gray-800 leading-snug line-clamp-2 hover:text-[#0d2137] transition-colors">
            {product.name}
          </p>
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-semibold text-gray-900">
            ₹{discountedPrice?.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-[12px] text-gray-400 line-through">
              ₹{originalPrice?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
