import { Link } from "react-router-dom";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Wellness", href: "/products?category=Wellness" },
    { label: "Self Care", href: "/products?category=Self+Care" },
    { label: "Kitchen & Home", href: "/products?category=Kitchen+%26+Home" },
    { label: "Bundles", href: "/products?category=Bundles" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Our Story", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Contact Us", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-xl">
            <h3 className="text-2xl font-bold uppercase tracking-wider">
              Stay in the loop
            </h3>
            <p className="text-gray-400 mt-2 text-sm">
              Get 15% off your first order + exclusive access to new drops and
              wellness tips.
            </p>
            <div className="flex mt-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/40 transition-colors"
              />
              <button className="px-8 py-3 bg-white text-black text-sm font-semibold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-2xl font-black tracking-tight uppercase">
            Cartiva
          </span>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Cartiva. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
