import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Heart,
  BarChart3,
  ShoppingBag,
  ArrowLeft,
  Check,
  Minus,
  Plus,
  Truck,
  RefreshCw,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import ProductCard from "@/components/ProductCard";
import ImageWithFallback from "@/components/ImageWithFallback";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function firePixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

// Hardcoded reviews per product (add more as needed)
const REVIEWS: Record<string, { name: string; rating: number; text: string; date: string }[]> = {
  default: [
    { name: "Priya S.", rating: 5, text: "Absolutely love this product! Works exactly as described. Fast delivery too.", date: "12 Jul 2026" },
    { name: "Anjali M.", rating: 5, text: "Best purchase I've made in a while. The quality is amazing for the price.", date: "10 Jul 2026" },
    { name: "Ritu K.", rating: 4, text: "Really good product. Helped me a lot. Would definitely recommend to friends.", date: "8 Jul 2026" },
    { name: "Sneha P.", rating: 5, text: "Received quickly and works perfectly. Very happy with my purchase!", date: "5 Jul 2026" },
    { name: "Divya R.", rating: 4, text: "Good quality and fast shipping. Exactly what I was looking for.", date: "2 Jul 2026" },
  ],
};

const FAQS = [
  { q: "Is Cash on Delivery available?", a: "Yes! We offer COD across India. Pay when your order arrives at your doorstep." },
  { q: "What is the return/replacement policy?", a: "We offer 7-day hassle-free replacement. If you receive a damaged or defective product, contact us within 7 days for a free replacement." },
  { q: "How long does delivery take?", a: "Orders are delivered within 4–7 business days across India. You'll receive tracking details once your order is shipped." },
  { q: "Is free shipping available?", a: "Yes! Free shipping on all orders above ₹500." },
  { q: "How do I use this product?", a: "Detailed usage instructions are included in the package. You can also contact our support team for guidance." },
];

function useCountdown() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 0);
    return Math.floor((end.getTime() - now.getTime()) / 1000);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => (t <= 0 ? 86399 : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = String(Math.floor(time / 3600)).padStart(2, "0");
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
  const s = String(time % 60).padStart(2, "0");
  return { h, m, s };
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const product = products.find((p) => String(p.id) === id);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(product?.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { addItem } = useCart();
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlist();
  const { isInCompare, toggleItem: toggleCompare } = useCompare();
  const { h, m, s } = useCountdown();

  useEffect(() => {
    if (product) {
      firePixel("ViewContent", {
        content_ids: [String(product.id)],
        content_name: product.name,
        content_category: product.category,
        content_type: "product",
        value: product.price,
        currency: "INR",
      });
    }
  }, [product?.id]);

  if (!product) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Product not found</p>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm underline">
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
    firePixel("AddToCart", {
      content_ids: [String(product.id)],
      content_name: product.name,
      content_category: product.category,
      content_type: "product",
      value: product.price * quantity,
      currency: "INR",
      num_items: quantity,
    });
  };

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const wishlisted = isInWishlist(String(product.id));
  const compared = isInCompare(String(product.id));
  const images = product.images && product.images.length > 0 ? product.images : [];
  const reviews = REVIEWS[String(product.id)] ?? REVIEWS["default"];

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black transition-colors">Products</Link>
          <span>/</span>
          <span className="text-black font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="aspect-square bg-gray-100 rounded-2xl overflow-hidden"
            >
              <ImageWithFallback
                src={images[activeImage] ?? ""}
                alt={product.name}
                className="w-full h-full"
                fallbackSize={80}
              />
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === i ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <ImageWithFallback src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full" fallbackSize={20} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{product.category}</span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount.toLocaleString()} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-4xl font-black">₹{product.price.toLocaleString("en-IN")}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Urgency Timer */}
            <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <Clock size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-semibold">
                🚚 Free shipping offer ends in{" "}
                <span className="font-black">{h}:{m}:{s}</span>
              </p>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 p-3 bg-green-50 rounded-lg text-center">
                <CreditCard size={18} className="text-green-600" />
                <span className="text-xs font-bold text-green-700">COD Available</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 bg-blue-50 rounded-lg text-center">
                <Truck size={18} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-700">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 bg-purple-50 rounded-lg text-center">
                <RefreshCw size={18} className="text-purple-600" />
                <span className="text-xs font-bold text-purple-700">7 Day Replace</span>
              </div>
            </div>

            <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

            {product.colors && product.colors.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-wider mb-3">
                  Color: <span className="font-normal text-gray-500">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs font-semibold border transition-all ${
                        selectedColor === color ? "border-black bg-black text-white" : "border-gray-300 text-gray-700 hover:border-black"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-wider mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 hover:bg-gray-50 transition-colors" aria-label="Decrease">
                    <Minus size={16} />
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="p-3 hover:bg-gray-50 transition-colors" aria-label="Increase">
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
                  added ? "bg-green-600 text-white" : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {added ? <><Check size={16} />Added!</> : <><ShoppingBag size={16} />Add to Bag</>}
              </motion.button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-4 border-2 transition-all ${wishlisted ? "border-red-500 bg-red-500 text-white" : "border-gray-300 text-gray-700 hover:border-black"}`}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
              </button>

              <button
                onClick={() => toggleCompare(product)}
                className={`p-4 border-2 transition-all ${compared ? "border-black bg-black text-white" : "border-gray-300 text-gray-700 hover:border-black"}`}
                aria-label="Compare"
              >
                <BarChart3 size={20} />
              </button>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mt-10 border-t border-gray-200 pt-8">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Features</h3>
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

        {/* Customer Reviews */}
        <div className="mt-20 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-bold">{product.rating} out of 5</span>
            <span className="text-gray-500 text-sm">({product.reviewCount.toLocaleString()} reviews)</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-xl p-5"
              >
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className={j < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-bold text-gray-500">{review.name}</span>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp size={18} className="flex-shrink-0" /> : <ChevronDown size={18} className="flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">You Might Also Like</h2>
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
