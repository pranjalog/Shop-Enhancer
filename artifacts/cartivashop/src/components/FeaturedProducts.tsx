import { motion } from "framer-motion";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FeaturedProducts() {
  const featured = products.filter((p) => p.featured);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Curated for you
            </span>
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-2">
              Featured
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:gap-3 transition-all"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="sm:hidden mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
          >
            View All Products
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
