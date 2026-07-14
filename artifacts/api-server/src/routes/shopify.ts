export async function pushOrderToShopify(order: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentMethod?: string;
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
        phone: order.customerPhone ?? "",
      },
      shipping_address: {
        first_name: order.customerName.split(" ")[0] ?? order.customerName,
        last_name: order.customerName.split(" ").slice(1).join(" ") ?? "",
        address1: order.address ?? "",
        city: order.city ?? "",
        province: order.state ?? "",
        zip: order.pincode ?? "",
        country: "IN",
        phone: order.customerPhone ?? "",
      },
      billing_address: {
        first_name: order.customerName.split(" ")[0] ?? order.customerName,
        last_name: order.customerName.split(" ").slice(1).join(" ") ?? "",
        address1: order.address ?? "",
        city: order.city ?? "",
        province: order.state ?? "",
        zip: order.pincode ?? "",
        country: "IN",
        phone: order.customerPhone ?? "",
      },
      financial_status: order.paymentMethod === "razorpay" ? "paid" : "pending",
      tags: `cartiva-website,${order.paymentMethod === "cod" ? "cod" : "razorpay"}`,
      note: `Payment: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}`,
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
