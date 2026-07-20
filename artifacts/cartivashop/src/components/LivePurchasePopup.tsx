import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

const NAMES = ["Priya", "Anjali", "Sneha", "Divya", "Ritu", "Pooja", "Neha", "Kavya", "Shreya", "Meera", "Sunita", "Rekha", "Deepa", "Nisha", "Anita"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Jaipur", "Lucknow", "Chandigarh", "Surat", "Indore", "Bhopal", "Nagpur", "Kolkata", "Ahmedabad"];
const PRODUCTS = ["Cartiva Period Cramp Massager", "CartivaCare Yoga & Stretch Mat", "Cartiva Wellness Kit", "CartivaCare Heat Therapy Belt", "Cartiva Relaxation Bundle"];
const TIMES = ["2 minutes ago", "5 minutes ago", "8 minutes ago", "12 minutes ago", "just now", "3 minutes ago"];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function LivePurchasePopup() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({ name: "", city: "", product: "", time: "" });

  useEffect(() => {
    const show = () => {
      setData({
        name: getRandom(NAMES),
        city: getRandom(CITIES),
        product: getRandom(PRODUCTS),
        time: getRandom(TIMES),
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    // First popup after 8 seconds
    const first = setTimeout(show, 8000);
    // Then every 20-30 seconds
    const interval = setInterval(() => {
      show();
    }, 25000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-4 z-[200] max-w-xs bg-white shadow-2xl rounded-xl border border-gray-100 p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">
              {data.name} from {data.city}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Just ordered <span className="font-semibold text-gray-700">{data.product}</span>
            </p>
            <p className="text-xs text-green-600 mt-0.5">{data.time} ✓</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
