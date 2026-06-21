import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { ordersTable, insertOrderSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/api/orders", async (req: Request, res: Response) => {
  const body = {
    ...req.body,
    total: req.body.total?.toString(),
  };
  const parsed = insertOrderSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order data", details: parsed.error.flatten() });
    return;
  }
  try {
    const [order] = await db.insert(ordersTable).values(parsed.data).returning();
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

router.get("/api/orders", async (req: Request, res: Response) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/api/orders/by-email/:email", async (req: Request, res: Response) => {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.customerEmail, req.params.email));
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
