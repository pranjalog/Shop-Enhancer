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
    res.status(201).json(order);

    // Push to Shopify in the background; don't block or fail the checkout if this errors
    pushOrderToShopify({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      items: order.items as any,
      total: order.total,
      paymentMethod: order.paymentMethod,
    }).catch((err) => console.log("[shopify] order push threw:", err));
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

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "cartiva2024";
const ALLOWED_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

// PATCH /api/orders/:id/status — update an order's status (e.g. mark as delivered)
router.patch("/orders/:id/status", async (req: Request, res: Response) => {
  const { status, password } = req.body as { status?: string; password?: string };
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` });
    return;
  }
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }
  try {
    const [order] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
