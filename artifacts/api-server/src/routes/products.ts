import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { productsTable, insertProductSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { DbProduct } from "@workspace/db";

const router: IRouter = Router();

function toJson(p: DbProduct) {
  return {
    ...p,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
    rating: parseFloat(p.rating ?? "4.5"),
    image: p.image ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

router.get("/products", async (_req: Request, res: Response) => {
  try {
    const products = await db.select().from(productsTable).orderBy(productsTable.id);
    res.json(products.map(toJson));
  } catch {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/products", async (req: Request, res: Response) => {
  const body = {
    ...req.body,
    price: req.body.price?.toString(),
    originalPrice: req.body.originalPrice?.toString() ?? null,
    rating: req.body.rating?.toString(),
  };
  const parsed = insertProductSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product data", details: parsed.error.flatten() });
    return;
  }
  try {
    const [product] = await db.insert(productsTable).values(parsed.data).returning();
    res.status(201).json(toJson(product));
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A product with this slug already exists" });
    } else {
      res.status(500).json({ error: "Failed to create product" });
    }
  }
});

router.put("/products/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  const body = {
    ...req.body,
    price: req.body.price?.toString(),
    originalPrice: req.body.originalPrice?.toString() ?? null,
    rating: req.body.rating?.toString(),
  };
  const parsed = insertProductSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product data", details: parsed.error.flatten() });
    return;
  }
  try {
    const [product] = await db
      .update(productsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(productsTable.id, id))
      .returning();
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(toJson(product));
  } catch {
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  try {
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
