import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const total = searchParams.get("total");

  useEffect(() => {
    // Fire Meta Pixel Purchase event
    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", {
        value: total ? parseFloat(total) : 0,
        currency: "INR",
      });
    }
  }, [total]);

  return (
    <main className="min-h-screen pt-24 pb-24 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={40} className="text-green-600" />
          </div>
        </motion.div>

        <h1 className="text-4xl font-black uppercase tracking-tight">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 mt-4 leading-relaxed">
          Thank you for your order! We&apos;ve received your payment and will
          start processing it right away. A confirmation email will be sent
          shortly.
        </p>

        {paymentId && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg inline-block">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Payment ID
            </p>
            <p className="text-sm font-mono font-semibold mt-0.5">{paymentId}</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-6 text-sm text-gray-500">
          <Package size={18} />
          <span>Expected delivery: 4–7 business days</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/account"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-black text-black text-sm font-semibold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            View Orders
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
