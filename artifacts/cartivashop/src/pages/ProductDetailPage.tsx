import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  BarChart3,
  ShoppingBag,
  ArrowLeft,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import ProductCard from "@/components/ProductCard";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const product = products.find((p) => String(p.id) === id);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlist();
  const { isInCompare, toggleItem: toggleCompare } = useCompare();

  if (!product) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Product not found</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm underline"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const wishlisted = isInWishlist(String(product.id));
  const compared = isInCompare(String(product.id));

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-black font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Image */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-square bg-gray-100 rounded-2xl overflow-hidden"
            >
              <ImageWithFallback
                src={product.images?.[0] ?? ""}
                alt={product.name}
                className="w-full h-full"
                fallbackSize={80}
              />
            </motion.div>
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.round(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-4xl font-black">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    % OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 mt-6 leading-relaxed">
              {product.description}
            </p>

            {product.colors && product.colors.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-wider mb-3">
                  Color:{" "}
                  <span className="font-normal text-gray-500">
                    {selectedColor}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs font-semibold border transition-all ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-gray-300 text-gray-700 hover:border-black"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-wider mb-3">
                Quantity
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 hover:bg-gray-50 transition-colors"
                    aria-label="Increase"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold uppercase tracking-widest transition-all ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {added ? (
                  <>
                    <Check size={16} />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Add to Bag
                  </>
                )}
              </motion.button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-4 border-2 transition-all ${
                  wishlisted
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-gray-300 text-gray-700 hover:border-black"
                }`}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
              </button>

              <button
                onClick={() => toggleCompare(product)}
                className={`p-4 border-2 transition-all ${
                  compared
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-700 hover:border-black"
                }`}
                aria-label="Compare"
              >
                <BarChart3 size={20} />
              </button>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mt-10 border-t border-gray-200 pt-8">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4">
                  Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-green-600 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
