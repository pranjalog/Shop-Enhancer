import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Truck, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ImageWithFallback from "@/components/ImageWithFallback";

declare global {
  interface Window {
    Razorpay: {
      new (options: Record<string, unknown>): {
        open(): void;
        on(event: string, cb: () => void): void;
      };
    };
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = totalPrice >= 500 ? 0 : 79;
  const total = totalPrice + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePay = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.pincode
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order. Please try again.");
      }

      const data = await res.json();

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || data.key_id,
          amount: data.amount,
          currency: "INR",
          name: "Cartiva",
          description: "Order Payment",
          order_id: data.id,
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            clearCart();
            navigate("/order-confirmation?payment_id=" + response.razorpay_payment_id);
          },
          theme: { color: "#000000" },
        });

        rzp.on("payment.failed", () => {
          setError("Payment failed. Please try again.");
          setLoading(false);
        });

        rzp.open();
        setLoading(false);
      };

      script.onerror = () => {
        setError("Failed to load payment gateway. Please try again.");
        setLoading(false);
      };
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Your cart is empty</p>
          <Link to="/products" className="text-sm underline">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        <h1 className="text-4xl font-black uppercase tracking-tight mb-10">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Truck size={18} />
                Delivery Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Address *
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House/flat no., street, locality"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    City *
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    State
                  </label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Pincode *
                  </label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
            </motion.div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-8">
              {[
                { icon: Shield, text: "Secure Payment" },
                { icon: Truck, text: "Fast Delivery" },
                { icon: CreditCard, text: "Razorpay Powered" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <Icon size={24} className="text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full"
                        fallbackSize={20}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-xs font-bold">
                        ₹
                        {(
                          item.product.price * item.quantity
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-500 bg-red-50 px-3 py-2 rounded">
                  {error}
                </p>
              )}

              <motion.button
                onClick={handlePay}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <CreditCard size={16} />
                {loading ? "Processing..." : `Pay ₹${total.toLocaleString("en-IN")}`}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
