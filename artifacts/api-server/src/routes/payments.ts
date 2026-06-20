import { Router } from "express";
import crypto from "crypto";

const router = Router();

router.post("/payments/create-order", async (req, res) => {
  const { amount } = req.body as { amount?: number };

  if (!amount || typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];

  if (!keyId || !keySecret) {
    res.status(503).json({
      error: "Payment gateway not configured",
      message: "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set",
    });
    return;
  }

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      req.log.error({ status: response.status, body: errText }, "Razorpay error");
      res.status(502).json({ error: "Failed to create Razorpay order" });
      return;
    }

    const order = await response.json() as Record<string, unknown>;
    res.json({ ...order, key_id: keyId });
  } catch (err) {
    req.log.error({ err }, "Razorpay create-order failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/payments/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keySecret) {
    res.status(503).json({ error: "Payment gateway not configured" });
    return;
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false, error: "Signature mismatch" });
  }
});

export default router;
