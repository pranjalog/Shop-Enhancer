import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, Check } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const CONTACT_INFO = {
  address: "149, New Anaj Mandi, Sirsa, Haryana, India – 125055",
  phone: "+91 8360197434",
  email: "choudharynanshu@gmail.com",
  mapQuery: "149+New+Anaj+Mandi+Sirsa+Haryana+125055+India",
};

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { error: dbError } = await supabase
          .from("contact_submissions")
          .insert([form]);

        if (dbError) throw new Error(dbError.message);
      }

      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight mt-2 leading-tight">
            Contact Us
          </h1>
          <p className="text-gray-500 mt-4 max-w-lg">
            Have a question, concern, or just want to say hi? We&apos;re here
            to help — usually respond within 24 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left: Info + Map */}
          <div className="lg:col-span-2 space-y-10">
            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              {[
                {
                  icon: MapPin,
                  label: "Our Office",
                  value: CONTACT_INFO.address,
                  href: undefined,
                },
                {
                  icon: Phone,
                  label: "Helpline",
                  value: CONTACT_INFO.phone,
                  href: `tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`,
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: CONTACT_INFO.email,
                  href: `mailto:${CONTACT_INFO.email}`,
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex gap-4 p-5 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm font-medium hover:underline mt-0.5 block"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium mt-0.5">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Google Maps Embed */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Find Us
              </p>
              <div className="aspect-video rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  title="Cartiva Office Location"
                  src={`https://maps.google.com/maps?q=${CONTACT_INFO.mapQuery}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>
          </div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {success ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Message Sent!
                </h2>
                <p className="text-gray-500 mt-2 max-w-sm">
                  Thanks for reaching out. We&apos;ll get back to you within 24
                  hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-sm underline text-gray-500 hover:text-black"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Full name"
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Subject
                  </label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="What&apos;s this about?"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    rows={7}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded">
                    {error}
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                  {loading ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
