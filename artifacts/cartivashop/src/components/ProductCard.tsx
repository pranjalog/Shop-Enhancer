import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, BarChart3, Star } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import ImageWithFallback from "./ImageWithFallback";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlist();
  const { isInCompare, toggleItem: toggleCompare } = useCompare();

  const wishlisted = isInWishlist(product.id);
  const compared = isInCompare(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <ImageWithFallback
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            fallbackSize={48}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.originalPrice && (
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
              Sale
            </span>
          )}
          {product.tags.includes("bestseller") && (
            <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
              Bestseller
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className={`p-2 rounded-full shadow-md transition-colors ${
              wishlisted
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(product);
            }}
            className={`p-2 rounded-full shadow-md transition-colors ${
              compared
                ? "bg-black text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            aria-label="Add to compare"
          >
            <BarChart3 size={16} />
          </button>
        </div>

        {/* Add to Bag overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="w-full py-3 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Add to Bag
          </button>
        </div>
      </div>

      {/* Info */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="flex items-center gap-1 mb-1">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-500">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {product.shortDescription}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
