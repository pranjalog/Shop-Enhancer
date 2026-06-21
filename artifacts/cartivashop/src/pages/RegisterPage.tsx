import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const { signUp, resendConfirmation, configured } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error: err } = await signUp(form.email, form.password, form.fullName);
    if (err) {
      setError(err);
    } else {
      setRegistered(true);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage(null);
    const { error: err } = await resendConfirmation(form.email);
    if (err) {
      setResendMessage("Failed to resend: " + err);
    } else {
      setResendMessage("Confirmation email sent! Check your inbox.");
    }
    setResendLoading(false);
  };

  if (registered) {
    return (
      <main className="min-h-screen pt-24 pb-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md px-4 text-center"
        >
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Check Your Email</h1>
          <p className="text-gray-500 text-sm mt-3 mb-8">
            We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
          </p>

          {resendMessage && (
            <p className={`text-sm mb-4 px-4 py-3 rounded ${resendMessage.includes("Failed") ? "text-red-500 bg-red-50" : "text-green-700 bg-green-50"}`}>
              {resendMessage}
            </p>
          )}

          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full py-3 border-2 border-black text-sm font-semibold uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-60 transition-colors mb-4"
          >
            {resendLoading ? "Sending..." : "Resend Confirmation Email"}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Already confirmed? <Link to="/login" className="underline text-black">Sign in</Link>
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black uppercase tracking-tight">
            Cartiva
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-tight mt-4">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Join Cartiva for exclusive rewards and early access
          </p>
        </div>

        {!configured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>Demo mode:</strong> Add{" "}
            <code className="text-xs bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="text-xs bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>{" "}
            to enable registration.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Full Name
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              required
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                className="w-full border border-gray-300 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded">
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={loading || !configured}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating account..." : "Create Account"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-black font-semibold underline hover:text-gray-700">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
