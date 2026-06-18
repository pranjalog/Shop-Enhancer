import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya S.",
    location: "Mumbai",
    text: "This massager changed my life. I used to miss work every month because of cramps. Now I carry it everywhere — it works within minutes.",
    rating: 5,
    product: "Period Cramp Massager",
  },
  {
    name: "Ananya R.",
    location: "Delhi",
    text: "Got the complete bundle for my sister as a gift. She called me crying happy tears. The heating belt + massager combo is unbeatable.",
    rating: 5,
    product: "Complete Relief Bundle",
  },
  {
    name: "Meera K.",
    location: "Bangalore",
    text: "Finally a brand that understands! The TENS patch is discreet enough to wear under my work clothes. No one even knows it's there.",
    rating: 5,
    product: "TENS Pain Relief Patch",
  },
  {
    name: "Sneha T.",
    location: "Hyderabad",
    text: "I was skeptical but the heat therapy is so soothing. The 10 intensity levels mean I can dial it to exactly what I need. Worth every rupee.",
    rating: 4,
    product: "Period Cramp Massager",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            Real stories
          </span>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-2">
            Loved by Thousands
          </h2>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto">
            Join 10,000+ women who&apos;ve made Cartiva part of their monthly
            routine.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className={
                      j < t.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-gray-400">
                  {t.location} &bull; {t.product}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
