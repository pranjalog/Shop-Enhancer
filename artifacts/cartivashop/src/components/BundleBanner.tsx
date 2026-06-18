import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function BundleBanner() {
  return (
    <section className="py-24 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-3 py-1 border border-white/30 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-6">
              Limited Time Offer
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95]">
              Complete Relief
              <br />
              <span className="text-rose-400">Bundle</span>
            </h2>
            <p className="mt-6 text-gray-400 max-w-md leading-relaxed">
              Get everything you need — Massager, Heating Belt, Aromatherapy
              Roll-On & Comfort Tea. All in one box, at one unbeatable price.
            </p>

            <div className="flex items-baseline gap-3 mt-8">
              <span className="text-5xl font-black">₹699</span>
              <span className="text-2xl text-gray-500 line-through">₹1,799</span>
              <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded">
                SAVE 61%
              </span>
            </div>

            <Link
              to="/products/7"
              className="group inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-black text-sm font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              Get the Bundle
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-80 h-80">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 rounded-full border border-white/10"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-4 rounded-full border border-white/10"
              />

              {["🌸", "🔥", "🧴", "🍵"].map((emoji, i) => (
                <motion.div
                  key={emoji}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5,
                  }}
                  className="absolute w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    top: `${50 + 38 * Math.sin((i * Math.PI) / 2) - 8}%`,
                    left: `${50 + 38 * Math.cos((i * Math.PI) / 2) - 8}%`,
                  }}
                >
                  {emoji}
                </motion.div>
              ))}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl font-black">4</p>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">
                    Products
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
