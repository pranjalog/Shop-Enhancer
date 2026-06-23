import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

const API_KEY = process.env["SHOPIFY_API_KEY"] ?? "";
const SHARED_SECRET = process.env["SHOPIFY_APP_SHARED_SECRET"] ?? "";
const SHOP_DOMAIN = (process.env["SHOPIFY_SHOP_DOMAIN"] ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
const SCOPES = "read_products,write_products,read_orders,write_orders,read_inventory,write_inventory";

function getRedirectUri(req: Request) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  return `${proto}://${host}/api/shopify/callback`;
}

function verifyHmac(query: Record<string, string>): boolean {
  const { hmac, ...rest } = query;
  if (!hmac) return false;
  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");
  const digest = crypto.createHmac("sha256", SHARED_SECRET).update(message).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

async function getStoredToken(shop: string): Promise<string | null> {
  try {
    console.log("[shopify] looking up token for shop:", JSON.stringify(shop));
    const rows = await db.execute(
      sql`SELECT access_token, shop FROM shopify_tokens WHERE shop = ${shop} LIMIT 1`
    );
    console.log("[shopify] query returned rows:", JSON.stringify(rows));
    const first = (rows as any[])[0];
    return first?.access_token ?? null;
  } catch (err) {
    console.log("[shopify] getStoredToken error:", err);
    return null;
  }
}

async function storeToken(shop: string, accessToken: string, scope: string) {
  await db.execute(sql`
    INSERT INTO shopify_tokens (shop, access_token, scope)
    VALUES (${shop}, ${accessToken}, ${scope})
    ON CONFLICT (shop) DO UPDATE
      SET access_token = EXCLUDED.access_token,
          scope = EXCLUDED.scope,
          updated_at = now()
  `);
}

// GET /api/shopify/install — start OAuth
router.get("/shopify/install", (req: Request, res: Response) => {
  const shop = (req.query.shop as string) || SHOP_DOMAIN;
  if (!shop) {
    res.status(400).json({ error: "Missing shop parameter" });
    return;
  }
  const redirectUri = getRedirectUri(req);
  const nonce = crypto.randomBytes(16).toString("hex");
  const url =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${API_KEY}` +
    `&scope=${SCOPES}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${nonce}`;
  res.redirect(url);
});

// GET /api/shopify/callback — handle OAuth callback
router.get("/shopify/callback", async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const { shop, code } = query;

  if (!shop || !code) {
    res.status(400).json({ error: "Missing shop or code" });
    return;
  }

  if (!verifyHmac(query)) {
    res.status(400).json({ error: "HMAC validation failed" });
    return;
  }

  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: API_KEY,
        client_secret: SHARED_SECRET,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      res.status(502).json({ error: "Token exchange failed", detail: txt });
      return;
    }

    const data = (await tokenRes.json()) as { access_token: string; scope: string };
    await storeToken(shop, data.access_token, data.scope);

    // Redirect to admin panel with success
    res.redirect("https://cartiva.click/admin?shopify=connected");
  } catch (err) {
    res.status(500).json({ error: "OAuth callback error" });
  }
});

// GET /api/shopify/debug — temporary debug info (remove after fixing)
router.get("/shopify/debug", async (req: Request, res: Response) => {
  try {
    const allRows = await db.execute(sql`SELECT shop, scope, updated_at FROM shopify_tokens`);
    res.json({
      SHOP_DOMAIN_env_value: SHOP_DOMAIN,
      SHOP_DOMAIN_char_count: SHOP_DOMAIN.length,
      rows_in_database: allRows,
    });
  } catch (err) {
    res.json({ error: String(err) });
  }
});

// GET /api/shopify/status — check connection status
router.get("/shopify/status", async (req: Request, res: Response) => {
  const shop = SHOP_DOMAIN;
  if (!shop) {
    res.json({ connected: false, reason: "SHOPIFY_SHOP_DOMAIN not set" });
    return;
  }
  const token = await getStoredToken(shop);
  if (!token) {
    res.json({ connected: false, shop, installUrl: `/api/shopify/install` });
    return;
  }
  // Verify token is still valid
  try {
    const check = await fetch(`https://${shop}/admin/api/2024-10/shop.json`, {
      headers: { "X-Shopify-Access-Token": token },
    });
    if (check.ok) {
      const { shop: shopData } = (await check.json()) as { shop: { name: string; email: string } };
      res.json({ connected: true, shop, shopName: shopData.name, email: shopData.email });
    } else {
      res.json({ connected: false, shop, reason: "Token invalid or expired", installUrl: `/api/shopify/install` });
    }
  } catch {
    res.json({ connected: false, shop, reason: "Could not reach Shopify" });
  }
});

// GET /api/shopify/orders — fetch orders from Shopify
router.get("/shopify/orders", async (req: Request, res: Response) => {
  const shop = SHOP_DOMAIN;
  const token = await getStoredToken(shop);
  if (!token) {
    res.status(401).json({ error: "Shopify not connected", installUrl: `/api/shopify/install` });
    return;
  }
  try {
    const limit = req.query.limit ?? "50";
    const status = req.query.status ?? "any";
    const r = await fetch(
      `https://${shop}/admin/api/2024-10/orders.json?limit=${limit}&status=${status}`,
      { headers: { "X-Shopify-Access-Token": token } }
    );
    if (!r.ok) {
      res.status(502).json({ error: "Shopify API error", status: r.status });
      return;
    }
    const data = await r.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/shopify/products — fetch products from Shopify
router.get("/shopify/products", async (req: Request, res: Response) => {
  const shop = SHOP_DOMAIN;
  const token = await getStoredToken(shop);
  if (!token) {
    res.status(401).json({ error: "Shopify not connected", installUrl: `/api/shopify/install` });
    return;
  }
  try {
    const r = await fetch(
      `https://${shop}/admin/api/2024-10/products.json?limit=250`,
      { headers: { "X-Shopify-Access-Token": token } }
    );
    if (!r.ok) {
      res.status(502).json({ error: "Shopify API error" });
      return;
    }
    const data = await r.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch Shopify products" });
  }
});

// POST /api/shopify/sync-products — push local products to Shopify
router.post("/shopify/sync-products", async (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "cartiva2024";
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const shop = SHOP_DOMAIN;
  const token = await getStoredToken(shop);
  if (!token) {
    res.status(401).json({ error: "Shopify not connected", installUrl: `/api/shopify/install` });
    return;
  }

  // Fetch local products
  const { db: database } = await import("@workspace/db");
  const { productsTable } = await import("@workspace/db");
  const localProducts = await database.select().from(productsTable);

  const results: { name: string; status: string; shopifyId?: string }[] = [];

  for (const p of localProducts) {
    try {
      const body = {
        product: {
          title: p.name,
          body_html: p.description,
          vendor: "CartivaSho",
          product_type: p.category,
          status: p.inStock ? "active" : "draft",
          tags: [
            ...(p.isBestseller ? ["bestseller"] : []),
            ...(p.isNew ? ["new"] : []),
            p.category,
          ].join(", "),
          images: (p.images ?? []).filter(Boolean).map((src) => ({ src })),
          variants: [
            {
              price: p.price,
              compare_at_price: p.originalPrice ?? undefined,
              inventory_management: "shopify",
              inventory_quantity: p.inStock ? 100 : 0,
            },
          ],
        },
      };

      const r = await fetch(`https://${shop}/admin/api/2024-10/products.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify(body),
      });

      if (r.ok) {
        const data = (await r.json()) as { product: { id: string } };
        results.push({ name: p.name, status: "created", shopifyId: String(data.product.id) });
      } else {
        const err = await r.text();
        results.push({ name: p.name, status: `error: ${err.slice(0, 100)}` });
      }
    } catch (e) {
      results.push({ name: p.name, status: "exception" });
    }
  }

  res.json({ synced: results.filter((r) => r.status === "created").length, total: localProducts.length, results });
});


// Push an order to Shopify
export async function pushOrderToShopify(order: {
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  address?: string;
}): Promise<void> {
  const shop = process.env["SHOPIFY_SHOP_DOMAIN"] ?? "";
  const token = await getStoredToken(shop);
  if (!token) {
    console.error("[shopify] pushOrderToShopify: no token found, skipping");
    return;
  }

  const lineItems = order.items.map((item) => ({
    title: item.name,
    quantity: item.quantity,
    price: item.price.toFixed(2),
  }));

  const shopifyOrder = {
    order: {
      line_items: lineItems,
      customer: {
        first_name: order.customerName.split(" ")[0] ?? order.customerName,
        last_name: order.customerName.split(" ").slice(1).join(" ") ?? "",
        email: order.customerEmail,
      },
      financial_status: "pending",
      tags: "cartiva-website",
    },
  };

  const res = await fetch(
    `https://${shop}/admin/api/2024-10/orders.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify(shopifyOrder),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("[shopify] pushOrderToShopify failed:", err);
  } else {
    console.log("[shopify] order pushed to Shopify successfully");
  }
}

export default router;
