import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-rose-50 via-white to-purple-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-rose-100/40 to-purple-100/40 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-100/30 to-rose-100/30 blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-6">
              India&apos;s #1 Period Relief Brand
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] uppercase"
          >
            Relief that
            <br />
            <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              moves with
            </span>
            <br />
            you.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-lg text-gray-600 max-w-lg leading-relaxed"
          >
            4 vibration modes + dedicated heating mode designed for real life.
            The CartivaCare Massager targets cramps at their source — so you
            can keep going.
          </motion.p>

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-2 mt-4"
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              4.8 &bull; 2,847 reviews
            </span>
          </motion.div>

          {/* Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-baseline gap-3 mt-6"
          >
            <span className="text-4xl font-black">₹899</span>
            <span className="text-xl text-gray-400 line-through">₹1,499</span>
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
              40% OFF
            </span>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap gap-4 mt-8"
          >
            <Link
              to="/products/1"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              Shop Now
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-black text-black text-sm font-semibold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              View All Products
            </Link>
          </motion.div>
        </div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative hidden lg:block"
        >
          <div className="relative aspect-square">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-200/60 to-purple-200/60 rounded-[3rem] flex items-center justify-center">
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-center"
              >
                <div className="w-48 h-48 bg-white/60 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center shadow-2xl">
                  <span className="text-6xl">🌸</span>
                </div>
                <p className="mt-6 text-sm font-semibold text-gray-700 uppercase tracking-widest">
                  CartivaCare Massager
                </p>
              </motion.div>
            </div>

            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute -left-4 top-1/4 bg-white rounded-2xl shadow-lg px-4 py-3"
            >
              <p className="text-xs font-bold text-gray-900">
                4 Vibration + Heating
              </p>
              <p className="text-[10px] text-gray-500">5 modes total</p>
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -right-4 top-1/3 bg-white rounded-2xl shadow-lg px-4 py-3"
            >
              <p className="text-xs font-bold text-gray-900">USB-C Charging</p>
              <p className="text-[10px] text-gray-500">6 hours battery life</p>
            </motion.div>

            <motion.div
              animate={{ y: [-3, 7, -3] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              className="absolute left-1/4 -bottom-2 bg-white rounded-2xl shadow-lg px-4 py-3"
            >
              <p className="text-xs font-bold text-gray-900">
                Medical-Grade Silicone
              </p>
              <p className="text-[10px] text-gray-500">Safe & skin-friendly</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
