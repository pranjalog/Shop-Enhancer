import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-24 flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            Your Wishlist is Empty
          </h1>
          <p className="text-gray-500 mb-8">
            Save products you love to come back to later
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Saved
            </span>
            <h1 className="text-4xl font-black uppercase tracking-tight mt-1">
              Wishlist
            </h1>
            <p className="text-gray-500 mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>

          <button
            onClick={() => {
              items.forEach((item) => addItem(item));
            }}
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            <ShoppingBag size={16} />
            Add All to Bag
          </button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
