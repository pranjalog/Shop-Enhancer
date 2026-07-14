import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { ordersTable, insertOrderSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { pushOrderToShopify } from "./shopify";

const router: IRouter = Router();

router.post("/orders", async (req: Request, res: Response) => {
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

    pushOrderToShopify({
      customerName: parsed.data.customerName ?? "Guest",
      customerEmail: parsed.data.customerEmail ?? "",
      customerPhone: parsed.data.customerPhone ?? "",
      total: parseFloat(parsed.data.total),
      items: parsed.data.items as Array<{ name: string; quantity: number; price: number }>,
      address: parsed.data.address ?? "",
      city: parsed.data.city ?? "",
      state: parsed.data.state ?? "",
      pincode: parsed.data.pincode ?? "",
      paymentMethod: parsed.data.paymentMethod ?? "cod",
    }).catch((err) => console.error("[shopify] push error:", err));

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

router.get("/orders", async (req: Request, res: Response) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/orders/by-email/:email", async (req: Request, res: Response) => {
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

router.patch("/orders/:id/status", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (!status) { res.status(400).json({ error: "Status required" }); return; }
  try {
    const [order] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
