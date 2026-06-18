import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Minus, Plus, X, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-24 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            Your Bag is Empty
          </h1>
          <p className="text-gray-500 mb-8">Add something you love</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Shop Now
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  const shipping = totalPrice >= 500 ? 0 : 79;
  const total = totalPrice + shipping;

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
            Your Bag
          </h1>
          <p className="text-gray-500 mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-6 pb-6 border-b border-gray-200"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full"
                    fallbackSize={32}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/products/${item.product.id}`}
                        className="font-semibold text-gray-900 hover:text-black hover:underline"
                      >
                        {item.product.name}
                      </Link>
                      {item.selectedColor && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {item.selectedColor}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      aria-label="Remove item"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>

                  <p className="text-lg font-bold mt-2">
                    ₹{item.product.price.toLocaleString("en-IN")}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-300">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-2 hover:bg-gray-50 transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-2 hover:bg-gray-50 transition-colors"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Subtotal: ₹
                      {(item.product.price * item.quantity).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-gray-400 hover:text-red-500 underline transition-colors"
            >
              Clear bag
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-semibold">Free</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">
                    Add ₹{(500 - totalPrice).toLocaleString("en-IN")} more for
                    free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>

              <Link
                to="/checkout"
                className="mt-6 block w-full py-4 bg-black text-white text-center text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="mt-3 block w-full text-center text-sm text-gray-500 hover:text-black underline transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
