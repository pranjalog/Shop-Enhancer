import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function CartTimer() {
  const [seconds, setSeconds] = useState(600); // 10 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  const isUrgent = seconds < 120;

  return (
    <motion.div
      animate={{ scale: isUrgent ? [1, 1.02, 1] : 1 }}
      transition={{ repeat: isUrgent ? Infinity : 0, duration: 1 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold mb-4 ${
        isUrgent ? "bg-red-50 border border-red-200 text-red-700" : "bg-amber-50 border border-amber-200 text-amber-700"
      }`}
    >
      <Clock size={16} className="flex-shrink-0" />
      {seconds === 0 ? (
        <span>Your cart reservation has expired. Please refresh.</span>
      ) : (
        <span>
          🛒 Your cart is reserved for{" "}
          <span className="font-black tabular-nums">{m}:{s}</span>
          {isUrgent && " — Hurry!"}
        </span>
      )}
    </motion.div>
  );
}
