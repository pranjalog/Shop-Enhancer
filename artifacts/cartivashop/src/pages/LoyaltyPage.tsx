import { motion } from "framer-motion";
import { Star, Gift, Trophy, Crown } from "lucide-react";
import { loyaltyTiers } from "@/data/products";
import { Link } from "react-router-dom";

export default function LoyaltyPage() {
  return (
    <main className="min-h-screen pt-24 pb-24">
      {/* Hero */}
      <section className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Star
              size={48}
              className="mx-auto text-yellow-400 fill-yellow-400 mb-4"
            />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Cartiva Rewards
            </span>
            <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tight mt-3">
              Earn While You Heal
            </h1>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Every rupee you spend earns points. Points unlock exclusive perks,
              discounts, and rewards — because you deserve it.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-black text-sm font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              Start Earning
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              It&apos;s Simple
            </span>
            <h2 className="text-4xl font-black uppercase tracking-tight mt-2">
              How It Works
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBagIcon,
                step: "01",
                title: "Shop",
                desc: "Earn 1 point for every ₹10 spent on any Cartiva product",
              },
              {
                icon: TrophyIconEl,
                step: "02",
                title: "Level Up",
                desc: "Accumulate points to reach Silver, Gold, or Platinum tiers",
              },
              {
                icon: GiftIconEl,
                step: "03",
                title: "Redeem",
                desc: "Use points for discounts, free products, and exclusive perks",
              },
            ].map(({ icon: Icon, step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Step {step}
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight mt-1">
                  {title}
                </h3>
                <p className="text-gray-500 mt-2 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Tiers
            </span>
            <h2 className="text-4xl font-black uppercase tracking-tight mt-2">
              Unlock Rewards
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loyaltyTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`p-8 rounded-2xl ${
                  tier.name === "Platinum"
                    ? "bg-black text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <span className="text-4xl">{tier.icon}</span>
                <h3 className="text-2xl font-black uppercase tracking-tight mt-3">
                  {tier.name}
                </h3>
                <p
                  className={`text-xs font-bold uppercase tracking-widest mt-1 ${
                    tier.name === "Platinum"
                      ? "text-gray-400"
                      : "text-gray-400"
                  }`}
                >
                  {tier.minPoints === 0
                    ? "Starting tier"
                    : `${tier.minPoints.toLocaleString()}+ points`}
                </p>
                <ul className="mt-6 space-y-2">
                  {tier.perks.map((perk) => (
                    <li
                      key={perk}
                      className={`text-sm flex items-start gap-2 ${
                        tier.name === "Platinum"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      <span className="mt-0.5">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ShoppingBagIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function TrophyIconEl() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="8 21 12 21 16 21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <path d="M17 2H7a2 2 0 0 0-2 2v6a8 8 0 0 0 4.555 7.196A2 2 0 0 0 12 18a2 2 0 0 0 2.445-.804A8 8 0 0 0 19 10V4a2 2 0 0 0-2-2z" />
    </svg>
  );
}

function GiftIconEl() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}
