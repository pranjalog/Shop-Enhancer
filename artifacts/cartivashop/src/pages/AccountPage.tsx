import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Package, Settings, LogOut, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Order } from "@/types";

type Tab = "profile" | "orders" | "settings";

export default function AccountPage() {
  const { user, profile, signOut, updateProfile, configured } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    default_address: profile?.default_address || "",
    city: profile?.city || "",
    state: profile?.state || "",
    pincode: profile?.pincode || "",
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        default_address: profile.default_address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "orders" && isSupabaseConfigured()) {
      setOrdersLoading(true);
      supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setOrders((data as Order[]) || []);
          setOrdersLoading(false);
        });
    }
  }, [activeTab, user]);

  if (!configured) {
    return (
      <main className="min-h-screen pt-24 pb-24 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-xl font-bold mb-4">Account Unavailable</p>
          <p className="text-gray-500 text-sm">
            Supabase authentication is not configured. Add{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">
              VITE_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">
              VITE_SUPABASE_ANON_KEY
            </code>{" "}
            to enable user accounts.
          </p>
          <Link
            to="/"
            className="inline-block mt-6 px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen pt-24 pb-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Please sign in to continue</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    setProfileError(null);
    const { error } = await updateProfile(profileForm);
    if (error) {
      setProfileError(error);
    } else {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
    setSaving(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            My Cartiva
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tight mt-2">
            Account
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{user.email}</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors text-left rounded ${
                    activeTab === id
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
              <button
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors text-left rounded"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold uppercase tracking-wider mb-6">
                  My Profile
                </h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      Full Name
                    </label>
                    <input
                      value={profileForm.full_name}
                      onChange={(e) =>
                        setProfileForm((f) => ({
                          ...f,
                          full_name: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      Phone
                    </label>
                    <input
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((f) => ({
                          ...f,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      Default Address
                    </label>
                    <input
                      value={profileForm.default_address}
                      onChange={(e) =>
                        setProfileForm((f) => ({
                          ...f,
                          default_address: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      City
                    </label>
                    <input
                      value={profileForm.city}
                      onChange={(e) =>
                        setProfileForm((f) => ({
                          ...f,
                          city: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      State
                    </label>
                    <input
                      value={profileForm.state}
                      onChange={(e) =>
                        setProfileForm((f) => ({
                          ...f,
                          state: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      Pincode
                    </label>
                    <input
                      value={profileForm.pincode}
                      onChange={(e) =>
                        setProfileForm((f) => ({
                          ...f,
                          pincode: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {profileError && (
                  <p className="mt-4 text-sm text-red-500 bg-red-50 px-4 py-3 rounded">
                    {profileError}
                  </p>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-60 transition-colors"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : savedMsg ? "Saved!" : "Save Changes"}
                </button>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold uppercase tracking-wider mb-6">
                  My Orders
                </h2>
                {ordersLoading ? (
                  <p className="text-gray-500">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold">No orders yet</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Your order history will appear here
                    </p>
                    <Link
                      to="/products"
                      className="inline-block mt-4 px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                              Order
                            </p>
                            <p className="font-semibold">#{order.id.slice(-8).toUpperCase()}</p>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <span className="font-bold">
                            ₹{order.total.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold uppercase tracking-wider mb-6">
                  Settings
                </h2>
                <div className="space-y-4">
                  <div className="p-5 border border-gray-200 rounded-lg">
                    <p className="text-sm font-semibold">Email Address</p>
                    <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-5 border border-gray-200 rounded-lg">
                    <p className="text-sm font-semibold">Account Created</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(user.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-red-500 text-red-500 text-sm font-semibold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
