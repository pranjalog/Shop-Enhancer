const handleCOD = async () => {
  if (!validateForm()) return;
  setError(null);
  setLoading(true);
  try {
    const orderNumber = "ORD-" + Date.now();
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          color: i.color,
        })),
        total: total,
        paymentMethod: "cod",
        status: "pending",
      }),
    });
    clearCart();
    navigate("/order-confirmation?method=cod&order=" + orderNumber);
  } catch {
    setError("Failed to place order. Please try again.");
  } finally {
    setLoading(false);
  }
};

const handleOnlinePay = async () => {
  if (!validateForm()) return;
  setError(null);
  setLoading(true);

  try {
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    });

    if (!res.ok) throw new Error("Failed to create order. Please try again.");

    const data = await res.json();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);

    script.onload = () => {
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || data.key_id,
        amount: data.amount,
        currency: "INR",
        name: "Cartiva",
        description: "Order Payment",
        order_id: data.id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: async (response: { razorpay_payment_id: string }) => {
          const orderNumber = "ORD-" + Date.now();
          await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderNumber,
              customerName: form.name,
              customerEmail: form.email,
              customerPhone: form.phone,
              address: form.address,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
              items: items.map((i) => ({
                id: i.product.id,
                name: i.product.name,
                price: i.product.price,
                quantity: i.quantity,
                color: i.color,
              })),
              total: total,
              paymentMethod: "razorpay",
              paymentId: response.razorpay_payment_id,
              status: "paid",
            }),
          });
          clearCart();
          navigate("/order-confirmation?payment_id=" + response.razorpay_payment_id + "&order=" + orderNumber);
        },
        theme: { color: "#000000" },
      });
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
      setLoading(false);
    };

    script.onerror = () => {
      setError("Failed to load payment gateway. Please try again.");
      setLoading(false);
    };
  } catch (err) {
    setError((err as Error).message);
    setLoading(false);
  }
};
