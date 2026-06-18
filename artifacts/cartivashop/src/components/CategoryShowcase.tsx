import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const showcaseCategories = [
  {
    title: "Wellness Devices",
    description: "Tech-powered relief for your toughest days",
    href: "/products?category=Wellness",
    bg: "from-rose-100 to-rose-200",
    emoji: "💆‍♀️",
    span: "col-span-2 row-span-2",
  },
  {
    title: "Self Care",
    description: "Pamper yourself naturally",
    href: "/products?category=Self+Care",
    bg: "from-purple-100 to-purple-200",
    emoji: "🧴",
    span: "col-span-1",
  },
  {
    title: "Nutrition",
    description: "Nourish from within",
    href: "/products?category=Nutrition",
    bg: "from-green-100 to-green-200",
    emoji: "🍵",
    span: "col-span-1",
  },
  {
    title: "Kitchen & Home",
    description: "Elevate your everyday rituals",
    href: "/products?category=Kitchen+%26+Home",
    bg: "from-amber-100 to-orange-200",
    emoji: "☕",
    span: "col-span-1",
  },
  {
    title: "Value Bundles",
    description: "Save big on complete kits",
    href: "/products?category=Bundles",
    bg: "from-amber-100 to-amber-200",
    emoji: "🎁",
    span: "col-span-1",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            Explore
          </span>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-2">
            Shop by Category
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {showcaseCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cat.span}
            >
              <Link
                to={cat.href}
                className={`block h-full bg-gradient-to-br ${cat.bg} rounded-2xl p-6 sm:p-8 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300`}
              >
                <div className="relative z-10">
                  <span className="text-4xl">{cat.emoji}</span>
                  <h3 className="text-lg sm:text-xl font-bold mt-3">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {cat.description}
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 text-[120px] leading-none opacity-10 group-hover:opacity-20 transition-opacity duration-300 translate-x-4 translate-y-4">
                  {cat.emoji}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
