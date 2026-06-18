import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold uppercase tracking-wider">
                Your Bag ({items.length})
              </h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">
                    Your bag is empty
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Add something you love
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-6 px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <ShoppingBag size={24} className="text-gray-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        {item.selectedColor && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.selectedColor}
                          </p>
                        )}
                        <p className="text-sm font-bold mt-1">
                          ₹{item.product.price.toLocaleString("en-IN")}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-200 rounded">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                              className="p-1.5 hover:bg-gray-50 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              className="p-1.5 hover:bg-gray-50 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Subtotal
                  </span>
                  <span className="text-lg font-bold">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Shipping & taxes calculated at checkout
                </p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block w-full py-4 bg-black text-white text-center text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block w-full text-center text-sm text-gray-500 hover:text-black underline transition-colors"
                >
                  View Bag
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full text-center text-sm text-gray-500 hover:text-black underline transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
