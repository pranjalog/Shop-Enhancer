import { useState, useEffect, useRef } from "react";
const API = "https://workspaceapi-server-production-826f.up.railway.app";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Upload, X, Check, LogOut, Package,
  ImageIcon, Loader2, Shield, ShoppingBag, RefreshCw, ExternalLink,
} from "lucide-react";
import type { ApiProduct } from "@/hooks/useProducts";

const CATEGORIES = [
  "Wellness", "Self Care", "Nutrition", "Bundles", "Fitness", "Kitchen & Home",
];

type FormData = {
  name: string; slug: string; price: string; originalPrice: string;
  category: string; description: string; images: [string, string, string];
  badge: string; rating: string; reviewCount: string;
  inStock: boolean; isNew: boolean; isBestseller: boolean;
  colors: string; features: string;
};

const emptyForm: FormData = {
  name: "", slug: "", price: "", originalPrice: "", category: "Wellness",
  description: "", images: ["", "", ""], badge: "", rating: "4.5",
  reviewCount: "0", inStock: true, isNew: false, isBestseller: false,
  colors: "", features: "",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formToPayload(f: FormData) {
  return {
    name: f.name, slug: f.slug || slugify(f.name),
    price: parseFloat(f.price) || 0,
    originalPrice: f.originalPrice ? parseFloat(f.originalPrice) : null,
    category: f.category, description: f.description,
    images: f.images.filter(Boolean),
    badge: f.badge || null, rating: parseFloat(f.rating) || 4.5,
    reviewCount: parseInt(f.reviewCount) || 0,
    inStock: f.inStock, isNew: f.isNew, isBestseller: f.isBestseller,
    colors: f.colors.split(",").map((s) => s.trim()).filter(Boolean),
    features: f.features.split("\n").map((s) => s.trim()).filter(Boolean),
  };
}

function productToForm(p: ApiProduct): FormData {
  const imgs = p.images ?? [];
  return {
    name: p.name, slug: p.slug, price: String(p.price),
    originalPrice: p.originalPrice ? String(p.originalPrice) : "",
    category: p.category, description: p.description,
    images: [imgs[0] ?? "", imgs[1] ?? "", imgs[2] ?? ""],
    badge: p.badge ?? "", rating: String(p.rating),
    reviewCount: String(p.reviewCount), inStock: p.inStock,
    isNew: p.isNew, isBestseller: p.isBestseller,
    colors: p.colors.join(", "), features: p.features.join("\n"),
  };
}

function ImageSlot({ index, value, onChange, label }: {
  index: number; value: string; onChange: (url: string) => void; label: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fb, setFb] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      const { uploadURL, objectPath } = await urlRes.json();
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      onChange(`/api/storage${objectPath}`);
      setFb("Uploaded!"); setTimeout(() => setFb(null), 2000);
    } catch {
      setFb("Failed"); setTimeout(() => setFb(null), 2000);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="relative">
        {value ? (
          <div className="relative group">
            <img src={value} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded border border-gray-200"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
              <button onClick={() => fileRef.current?.click()} className="p-1.5 bg-white rounded text-xs font-medium flex items-center gap-1">
                <Upload size={10} /> Replace
              </button>
              <button onClick={() => onChange("")} className="p-1.5 bg-white rounded text-red-500"><X size={10} /></button>
            </div>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-black transition-colors rounded flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-black">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <><ImageIcon size={18} /><span className="text-xs font-medium">Upload photo</span></>}
          </button>
        )}
        {fb && (
          <span className={`absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded font-medium ${fb === "Uploaded!" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>{fb}</span>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Or paste image URL"
        className="w-full border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-black rounded" />
    </div>
  );
}

type ShopifyStatus = { connected: boolean; shop?: string; shopName?: string; email?: string; installUrl?: string; reason?: string };
type ShopifyOrder = {
  id: number; name: string; email: string; total_price: string;
  financial_status: string; fulfillment_status: string | null; created_at: string;
  line_items: { title: string; quantity: number; price: string }[];
  shipping_address?: { address1: string; city: string; province: string; zip: string };
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_authed") === "1");
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"products" | "shopify">("products");

  const [shopifyStatus, setShopifyStatus] = useState<ShopifyStatus | null>(null);
  const [shopifyOrders, setShopifyOrders] = useState<ShopifyOrder[]>([]);
  const [shopifyOrdersLoading, setShopifyOrdersLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("admin_categories") ?? "[]"); } catch { return []; }
  });
  const adminPw = useRef("");
  const allCategories = [...CATEGORIES, ...customCategories];

  function flash(type: "ok" | "err", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  }

  async function login() {
    setPwLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwInput }),
      });
      const data = await res.json();
      if (data.ok) {
        adminPw.current = pwInput;
        sessionStorage.setItem("admin_authed", "1");
        sessionStorage.setItem("admin_pw", pwInput);
        setAuthed(true);
      } else { setPwError("Incorrect password."); }
    } catch { setPwError("Connection error. Try again."); }
    finally { setPwLoading(false); }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) adminPw.current = saved;
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { flash("err", "Failed to load products."); }
    finally { setLoading(false); }
  }

  async function loadShopifyStatus() {
    try {
      const res = await fetch("/api/shopify/status");
      setShopifyStatus(await res.json());
    } catch { setShopifyStatus({ connected: false, reason: "Could not reach API" }); }
  }

  async function loadShopifyOrders() {
    setShopifyOrdersLoading(true);
    try {
      const res = await fetch("/api/shopify/orders?limit=50&status=any");
      const data = await res.json();
      setShopifyOrders(data.orders ?? []);
    } catch { flash("err", "Failed to load Shopify orders."); }
    finally { setShopifyOrdersLoading(false); }
  }

  async function syncToShopify() {
    setSyncLoading(true);
    try {
      const res = await fetch("/api/shopify/sync-products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPw.current }),
      });
      const data = await res.json();
      if (res.ok) flash("ok", `Synced ${data.synced} of ${data.total} products to Shopify!`);
      else flash("err", data.error ?? "Sync failed.");
    } catch { flash("err", "Sync failed — network error."); }
    finally { setSyncLoading(false); }
  }

  useEffect(() => {
    if (authed) { loadProducts(); loadShopifyStatus(); }
  }, [authed]);

  useEffect(() => {
    if (activeTab === "shopify" && shopifyStatus?.connected && shopifyOrders.length === 0) {
      loadShopifyOrders();
    }
  }, [activeTab, shopifyStatus]);

  async function seed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPw.current }),
      });
      const data = await res.json();
      flash("ok", data.message ?? "Seeded!");
      await loadProducts();
    } catch { flash("err", "Seed failed."); }
    finally { setSeeding(false); }
  }

  function openAdd() { setEditingId(null); setForm(emptyForm); setShowForm(true); }
  function openEdit(p: ApiProduct) { setEditingId(p.id); setForm(productToForm(p)); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditingId(null); setForm(emptyForm); }

  function setImageAt(i: 0 | 1 | 2, url: string) {
    setForm((f) => { const next: [string, string, string] = [...f.images] as [string, string, string]; next[i] = url; return { ...f, images: next }; });
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.category) { flash("err", "Name, price and category are required."); return; }
    setSaving(true);
    const payload = formToPayload(form);
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const err = await res.json(); flash("err", err.error ?? "Save failed."); return; }
      flash("ok", editingId ? "Product updated!" : "Product created!");
      closeForm(); await loadProducts();
    } catch { flash("err", "Network error."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      flash("ok", "Product deleted."); setDeleteId(null); await loadProducts();
    } catch { flash("err", "Delete failed."); }
  }

  function addCategory() {
    const cat = newCategory.trim();
    if (!cat || allCategories.includes(cat)) return;
    const next = [...customCategories, cat];
    setCustomCategories(next); localStorage.setItem("admin_categories", JSON.stringify(next));
    setNewCategory(""); flash("ok", `Category "${cat}" added.`);
  }

  function logout() { sessionStorage.removeItem("admin_authed"); sessionStorage.removeItem("admin_pw"); setAuthed(false); }

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-black" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">Admin Panel</h1>
              <p className="text-xs text-gray-500">Cartiva Store Management</p>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); login(); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Admin Password</label>
              <input type="password" value={pwInput} onChange={(e) => setPwInput(e.target.value)}
                placeholder="Enter password" autoComplete="current-password"
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black" />
            </div>
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
            <button type="submit" disabled={pwLoading || !pwInput}
              className="w-full py-3 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {pwLoading ? "Verifying..." : "Sign In"}
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-400 text-center">Default password: <span className="font-mono">cartiva2024</span></p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={20} />
            <span className="font-black uppercase tracking-tight text-lg">Cartiva Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-500 hover:text-black transition-colors">← Back to Store</a>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded shadow-lg text-sm font-medium flex items-center gap-2 ${feedback.type === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {feedback.type === "ok" ? <Check size={16} /> : <X size={16} />} {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Tab Nav */}
        <div className="flex border-b border-gray-200 -mb-2">
          <button onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "products" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"}`}>
            <Package size={15} /> Products &amp; Categories
          </button>
          <button onClick={() => setActiveTab("shopify")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "shopify" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"}`}>
            <ShoppingBag size={15} /> Shopify
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${shopifyStatus?.connected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {shopifyStatus?.connected ? "Connected" : "Not connected"}
            </span>
          </button>
        </div>

        {/* ───── SHOPIFY TAB ───── */}
        {activeTab === "shopify" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <ShoppingBag size={18} /> Shopify Integration
                </h2>
                <button onClick={loadShopifyStatus} className="text-gray-400 hover:text-black transition-colors" title="Refresh">
                  <RefreshCw size={14} />
                </button>
              </div>

              {!shopifyStatus ? (
                <div className="flex items-center gap-2 text-gray-400"><Loader2 size={14} className="animate-spin" /> Checking connection...</div>
              ) : shopifyStatus.connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800">{shopifyStatus.shopName}</p>
                      <p className="text-xs text-green-600">{shopifyStatus.shop} · {shopifyStatus.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={syncToShopify} disabled={syncLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                      {syncLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      {syncLoading ? "Syncing..." : "Sync Products to Shopify"}
                    </button>
                    <button onClick={loadShopifyOrders} disabled={shopifyOrdersLoading}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium hover:border-black transition-colors">
                      {shopifyOrdersLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      Refresh Orders
                    </button>
                    <a href={`https://${shopifyStatus.shop}/admin`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium hover:border-black transition-colors">
                      <ExternalLink size={14} /> Open Shopify Admin
                    </a>
                  </div>
                  <p className="text-xs text-gray-400">"Sync Products" pushes all CartivaSho products to Shopify as active listings. Run it once after connecting.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-800">Not connected to Shopify</p>
                      <p className="text-xs text-amber-600">{shopifyStatus.reason ?? "Complete the OAuth flow to connect your store."}</p>
                    </div>
                  </div>
                  <div>
                    <a href="/api/shopify/install"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
                      <ShoppingBag size={14} /> Connect Shopify Store
                    </a>
                    <p className="text-xs text-gray-400 mt-2">
                      You'll be redirected to Shopify to authorize this app on <strong>{shopifyStatus.shop}</strong>. Takes about 30 seconds.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {shopifyStatus?.connected && (
              <div className="bg-white border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-black uppercase tracking-tight">Shopify Orders</h2>
                  <span className="text-xs text-gray-400">{shopifyOrders.length} orders</span>
                </div>
                {shopifyOrdersLoading ? (
                  <div className="p-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-3" /><p className="text-sm">Loading orders...</p>
                  </div>
                ) : shopifyOrders.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Package size={32} className="mx-auto mb-3 opacity-30" /><p className="text-sm">No orders yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          {["Order", "Customer", "Items", "Total", "Payment", "Fulfillment", "Date"].map((h) => (
                            <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 px-4 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {shopifyOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-xs font-bold">{o.name}</td>
                            <td className="px-4 py-3 text-xs">
                              <div>{o.email}</div>
                              {o.shipping_address && <div className="text-gray-400">{o.shipping_address.city}, {o.shipping_address.province}</div>}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              {o.line_items.map((li) => <div key={li.title}>{li.quantity}× {li.title}</div>)}
                            </td>
                            <td className="px-4 py-3 font-bold">₹{parseFloat(o.total_price).toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${o.financial_status === "paid" ? "bg-green-100 text-green-700" : o.financial_status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                                {o.financial_status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${o.fulfillment_status === "fulfilled" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                                {o.fulfillment_status ?? "unfulfilled"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ───── PRODUCTS TAB ───── */}
        {activeTab === "products" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Products", value: products.length },
                { label: "In Stock", value: products.filter((p) => p.inStock).length },
                { label: "Categories", value: [...new Set(products.map((p) => p.category))].length },
                { label: "With Photos", value: products.filter((p) => p.images?.length > 0).length },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-gray-200 p-4">
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Products table */}
            <div className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-black uppercase tracking-tight">Products</h2>
                <div className="flex gap-3">
                  {products.length === 0 && (
                    <button onClick={seed} disabled={seeding}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium hover:border-black transition-colors">
                      {seeding ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
                      {seeding ? "Importing..." : "Import Default Products"}
                    </button>
                  )}
                  <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors">
                    <Plus size={14} /> Add Product
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-3" /><p className="text-sm">Loading products...</p></div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Package size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No products yet</p>
                  <p className="text-xs mt-1">Click "Import Default Products" or add manually.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        {["ID", "Photos", "Name", "Category", "Price", "Stock", "Flags", "Actions"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p) => {
                        const imgs = p.images ?? [];
                        return (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-xs text-gray-400">#{p.id}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                  <div key={i} className="w-9 h-9 bg-gray-100 rounded overflow-hidden flex items-center justify-center border border-gray-200">
                                    {imgs[i] ? <img src={imgs[i]} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={10} className="text-gray-300" />}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{imgs.length}/3 photos</p>
                            </td>
                            <td className="px-4 py-3 font-medium max-w-[160px]">
                              <span className="line-clamp-1">{p.name}</span>
                              {p.badge && <span className="inline-block mt-0.5 text-xs bg-black text-white px-1.5 py-0.5 rounded">{p.badge}</span>}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{p.category}</td>
                            <td className="px-4 py-3 font-bold">
                              ₹{p.price.toLocaleString("en-IN")}
                              {p.originalPrice && <span className="block text-xs text-gray-400 line-through font-normal">₹{p.originalPrice.toLocaleString("en-IN")}</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block w-2 h-2 rounded-full ${p.inStock ? "bg-green-500" : "bg-red-400"}`} />
                              <span className="ml-1.5 text-xs">{p.inStock ? "In Stock" : "Out"}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 space-y-0.5">
                              {p.isBestseller && <div>⭐ Bestseller</div>}
                              {p.isNew && <div>🆕 New</div>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Edit"><Pencil size={14} /></button>
                                <button onClick={() => setDeleteId(p.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors" title="Delete"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-black uppercase tracking-tight mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {allCategories.map((c) => (
                  <span key={c} className={`px-3 py-1 text-xs font-medium rounded-full border ${CATEGORIES.includes(c) ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}>
                    {c}
                    {!CATEGORIES.includes(c) && (
                      <button onClick={() => {
                        const next = customCategories.filter((x) => x !== c);
                        setCustomCategories(next); localStorage.setItem("admin_categories", JSON.stringify(next));
                      }} className="ml-1.5 opacity-60 hover:opacity-100">×</button>
                    )}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  placeholder="New category name"
                  className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                <button onClick={addCategory} disabled={!newCategory.trim()}
                  className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Black = built-in. White = custom (removable).</p>
            </div>
          </div>
        )}
      </div>

      {/* Product form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && closeForm()}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="bg-white w-full max-w-2xl my-6">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-black uppercase tracking-tight">{editingId ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-6">
                {/* 3 Image Slots */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Product Photos (up to 3)</p>
                  <div className="grid grid-cols-3 gap-4">
                    {([0, 1, 2] as const).map((i) => (
                      <ImageSlot key={i} index={i} value={form.images[i]} onChange={(url) => setImageAt(i, url)}
                        label={i === 0 ? "Main Photo *" : `Photo ${i + 1}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Photo 1 shown in product cards. All 3 appear in the product gallery.</p>
                </div>
                {/* Name + Slug */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Product Name *</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                      placeholder="Product name" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Slug (URL)</label>
                    <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      placeholder="auto-generated" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black font-mono text-xs" />
                  </div>
                </div>
                {/* Price + OG Price + Category */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="999" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Original Price (₹)</label>
                    <input type="number" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                      placeholder="1499" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Category *</label>
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
                      {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Product description"
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black resize-none" />
                </div>
                {/* Badge + Rating + Reviews */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Badge</label>
                    <input value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                      placeholder="e.g. Bestseller" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Rating (0–5)</label>
                    <input type="number" min="0" max="5" step="0.1" value={form.rating}
                      onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Review Count</label>
                    <input type="number" value={form.reviewCount}
                      onChange={(e) => setForm((f) => ({ ...f, reviewCount: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                  </div>
                </div>
                {/* Colors */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Colors (comma-separated)</label>
                  <input value={form.colors} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
                    placeholder="Rose Pink, Midnight Black, Silver"
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                </div>
                {/* Features */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Features (one per line)</label>
                  <textarea value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                    rows={3} placeholder={"USB-C rechargeable\n6 hour battery\n4 vibration modes"}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black resize-none" />
                </div>
                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  {(["inStock", "isNew", "isBestseller"] as const).map((key) => {
                    const labels: Record<string, string> = { inStock: "In Stock", isNew: "Mark as New", isBestseller: "Bestseller" };
                    return (
                      <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                        <button type="button" onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                          className={`w-10 h-5 rounded-full transition-colors ${form[key] ? "bg-black" : "bg-gray-300"} relative`}>
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                        <span className="text-sm font-medium">{labels[key]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={closeForm} className="px-5 py-2.5 border border-gray-300 text-sm font-medium hover:border-black transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2.5 bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 max-w-sm w-full">
              <h3 className="font-black text-lg mb-2">Delete Product?</h3>
              <p className="text-sm text-gray-500 mb-6">This will permanently remove the product. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-300 text-sm font-medium hover:border-black">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold hover:bg-red-700">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
