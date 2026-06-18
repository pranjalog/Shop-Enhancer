import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen pt-24 pb-24 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-8xl font-black text-gray-100">404</p>
        <h1 className="text-3xl font-black uppercase tracking-tight -mt-4">
          Page Not Found
        </h1>
        <p className="text-gray-500 mt-4 max-w-sm mx-auto">
          Looks like this page doesn&apos;t exist. Maybe it moved, or maybe it
          never existed.
        </p>
        <Link
          to="/"
          className="inline-block mt-8 px-8 py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
          Go Home
        </Link>
      </motion.div>
    </main>
  );
}
