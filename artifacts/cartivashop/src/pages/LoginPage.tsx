import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, configured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err);
    } else {
      navigate("/account");
    }
    setLoading(false);
  };

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
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Sign in to your account to access rewards and orders
          </p>
        </div>

        {!configured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>Demo mode:</strong> Supabase authentication is not yet
            configured. Add your{" "}
            <code className="text-xs bg-amber-100 px-1 rounded">
              VITE_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="text-xs bg-amber-100 px-1 rounded">
              VITE_SUPABASE_ANON_KEY
            </code>{" "}
            environment variables to enable login.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
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
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-black font-semibold underline hover:text-gray-700"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
