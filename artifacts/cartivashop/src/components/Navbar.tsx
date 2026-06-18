import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  Search,
  BarChart3,
  User,
  LogOut,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/loyalty", label: "Rewards" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { openCart, totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { items: compareItems } = useCompare();
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      {/* Promo Bar */}
      <div className="bg-black text-white text-center text-xs tracking-widest uppercase py-2 px-4">
        Free shipping on orders over ₹500 &bull; Join Cartiva Rewards for 2× points
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-black tracking-tight uppercase">
              Cartiva
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium uppercase tracking-wider transition-colors relative group ${
                  location.pathname === link.href
                    ? "text-black"
                    : "text-gray-700 hover:text-black"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-black transition-all ${
                    location.pathname === link.href
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search size={20} />
            </button>

            <Link
              to="/compare"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Compare products"
            >
              <BarChart3 size={20} />
              {compareItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareItems.length}
                </span>
              )}
            </Link>

            <Link
              to="/wishlist"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Account Icon */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Account"
                >
                  <User size={20} />
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg border border-gray-100 rounded-xl overflow-hidden z-50"
                    >
                      <Link
                        to="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <User size={14} />
                        My Account
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setAccountOpen(false);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-red-600"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Sign in"
              >
                <User size={20} />
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-lg font-medium uppercase tracking-wider text-gray-800 hover:text-black"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block text-lg font-medium uppercase tracking-wider text-gray-800 hover:text-black"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    className="block text-lg font-medium uppercase tracking-wider text-red-500"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-lg font-medium uppercase tracking-wider text-gray-800 hover:text-black"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
