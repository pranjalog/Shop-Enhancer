import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = searchParams.get("category") || "All";
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = useMemo(() => {
    let list =
      activeCategory === "All"
        ? products
        : products.filter((p) => p.category === activeCategory);

    switch (sortBy) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "rating":
        return [...list].sort((a, b) => b.rating - a.rating);
      case "reviews":
        return [...list].sort((a, b) => b.reviewCount - a.reviewCount);
      default:
        return [...list].sort(
          (a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0)
        );
    }
  }, [activeCategory, sortBy, products]);

  const setCategory = (cat: string) => {
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            Our Collection
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-2">
            All Products
          </h1>
          <p className="text-gray-500 mt-2">{filtered.length} products</p>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all ${
                  activeCategory === cat
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold uppercase tracking-wider bg-transparent border border-gray-300 px-3 py-2 focus:outline-none focus:border-black transition-colors"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviews</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 border border-gray-300 hover:border-black transition-colors"
              aria-label="Filters"
            >
              {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />}
            </button>
          </div>
        </div>

        {activeCategory !== "All" && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-500">Filtering by:</span>
            <button
              onClick={() => setCategory("All")}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-semibold rounded-full"
            >
              {activeCategory}
              <X size={12} />
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-xl font-medium">No products found</p>
            <button
              onClick={() => setCategory("All")}
              className="mt-4 text-sm underline text-gray-600 hover:text-black"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
