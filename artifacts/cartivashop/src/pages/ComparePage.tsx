import { motion } from "framer-motion";
import { BarChart3, X, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCompare } from "@/context/CompareContext";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function ComparePage() {
  const { items, removeItem, clearAll } = useCompare();

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-24 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 size={64} className="text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            Nothing to Compare
          </h1>
          <p className="text-gray-500 mb-8">
            Add products to compare them side by side
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

  const allSpecs = Array.from(
    new Set(items.flatMap((p) => Object.keys(p.specs || {})))
  );

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Side by Side
            </span>
            <h1 className="text-4xl font-black uppercase tracking-tight mt-1">
              Compare
            </h1>
          </div>
          <button
            onClick={clearAll}
            className="text-sm text-gray-400 hover:text-red-500 underline transition-colors"
          >
            Clear All
          </button>
        </motion.div>

        <div className="min-w-[600px]">
          {/* Product headers */}
          <div
            className="grid gap-4 mb-8"
            style={{
              gridTemplateColumns: `160px repeat(${Math.min(items.length + 1, 4)}, 1fr)`,
            }}
          >
            <div />
            {items.map((product) => (
              <div key={product.id} className="relative">
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-100 transition-colors z-10"
                  aria-label="Remove from compare"
                >
                  <X size={12} />
                </button>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <ImageWithFallback
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full"
                    fallbackSize={32}
                  />
                </div>
                <Link
                  to={`/products/${product.id}`}
                  className="text-sm font-semibold hover:underline line-clamp-2 block"
                >
                  {product.name}
                </Link>
                <p className="text-lg font-black mt-1">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
                <Link
                  to={`/products/${product.id}`}
                  className="mt-2 block text-center py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  View
                </Link>
              </div>
            ))}
            {items.length < 4 && (
              <Link
                to="/products"
                className="flex flex-col items-center justify-center aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-black transition-colors"
              >
                <Plus size={24} className="text-gray-400" />
                <span className="text-xs text-gray-400 mt-2 uppercase tracking-wider">
                  Add Product
                </span>
              </Link>
            )}
          </div>

          {/* Specs Table */}
          {allSpecs.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="grid gap-4 px-4 py-3 bg-gray-50 font-bold text-xs uppercase tracking-widest"
                style={{
                  gridTemplateColumns: `160px repeat(${items.length}, 1fr)`,
                }}
              >
                <span>Specification</span>
                {items.map((p) => (
                  <span key={p.id} className="truncate">
                    {p.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                ))}
              </div>
              {allSpecs.map((spec, i) => (
                <div
                  key={spec}
                  className={`grid gap-4 px-4 py-3 text-sm ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                  style={{
                    gridTemplateColumns: `160px repeat(${items.length}, 1fr)`,
                  }}
                >
                  <span className="text-gray-500 font-medium">{spec}</span>
                  {items.map((p) => (
                    <span key={p.id}>{p.specs?.[spec] ?? "—"}</span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
