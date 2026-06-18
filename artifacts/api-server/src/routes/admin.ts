import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "cartiva2024";

router.post("/admin/verify", (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (password === ADMIN_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: "Invalid password" });
  }
});

router.post("/admin/seed", async (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const existing = await db.select().from(productsTable);
  if (existing.length > 0) {
    res.json({ message: "Already seeded", count: existing.length });
    return;
  }

  const defaults = [
    {
      name: "CartivaCare Period Cramp Massager",
      slug: "cartiva-care-period-cramp-massager",
      price: "899",
      originalPrice: "1499",
      category: "Wellness",
      description: "Experience instant relief with the CartivaCare Period Cramp Massager. Designed with 4 vibration modes and a dedicated heating mode, this compact device targets menstrual discomfort at its source.",
      image: null,
      badge: "Bestseller",
      rating: "4.8",
      reviewCount: 2847,
      inStock: true,
      isNew: false,
      isBestseller: true,
      colors: ["Rose Pink"],
      features: ["4 vibration modes", "Heating mode 38°C–45°C", "10 intensity levels", "USB-C rechargeable", "6 hour battery"],
    },
    {
      name: "CartivaCare Heating Pad Belt",
      slug: "cartiva-care-heating-pad-belt",
      price: "599",
      originalPrice: "999",
      category: "Wellness",
      description: "Wrap yourself in warmth with the CartivaCare Heating Pad Belt. This flexible, adjustable belt delivers consistent heat therapy directly to your lower abdomen.",
      image: null,
      badge: null,
      rating: "4.6",
      reviewCount: 1203,
      inStock: true,
      isNew: false,
      isBestseller: false,
      colors: ["Blush Pink", "Charcoal", "Sky Blue"],
      features: ["3 heat settings", "4 hour battery", "Adjustable waist 24\"–42\"", "30 min auto-shutoff"],
    },
    {
      name: "CartivaCare Aromatherapy Roll-On",
      slug: "cartiva-care-aromatherapy-roll-on",
      price: "299",
      originalPrice: null,
      category: "Self Care",
      description: "A soothing blend of lavender, peppermint, and chamomile essential oils in a convenient roll-on applicator.",
      image: null,
      badge: null,
      rating: "4.5",
      reviewCount: 892,
      inStock: true,
      isNew: false,
      isBestseller: false,
      colors: [],
      features: ["100% natural essential oils", "Lavender, peppermint & chamomile", "10ml roll-on"],
    },
    {
      name: "CartivaCare TENS Pain Relief Patch",
      slug: "cartiva-care-tens-pain-relief-patch",
      price: "749",
      originalPrice: "1199",
      category: "Wellness",
      description: "Clinical-grade TENS technology in a slim, wireless patch. Delivers gentle electrical impulses to block pain signals and stimulate natural endorphin release.",
      image: null,
      badge: "Clinical Grade",
      rating: "4.7",
      reviewCount: 1567,
      inStock: true,
      isNew: false,
      isBestseller: false,
      colors: ["White", "Black"],
      features: ["6 TENS programs", "20 intensity levels", "10 hour battery", "Rechargeable"],
    },
    {
      name: "CartivaCare Comfort Tea Collection",
      slug: "cartiva-care-comfort-tea-collection",
      price: "399",
      originalPrice: null,
      category: "Nutrition",
      description: "A curated collection of 4 herbal tea blends designed to ease menstrual discomfort naturally. 40 individually wrapped sachets.",
      image: null,
      badge: null,
      rating: "4.4",
      reviewCount: 634,
      inStock: true,
      isNew: false,
      isBestseller: false,
      colors: [],
      features: ["4 herbal blends", "40 sachets total", "100% organic herbs", "Caffeine free"],
    },
    {
      name: "CartivaCare Sleep & Recovery Mask",
      slug: "cartiva-care-sleep-recovery-mask",
      price: "499",
      originalPrice: null,
      category: "Self Care",
      description: "A weighted silk sleep mask with cooling gel inserts. Designed to relieve tension headaches and promote deep sleep during your cycle.",
      image: null,
      badge: null,
      rating: "4.6",
      reviewCount: 478,
      inStock: true,
      isNew: false,
      isBestseller: false,
      colors: ["Midnight Black", "Dusty Rose", "Sage Green"],
      features: ["100% Mulberry Silk", "0.5lb weighted", "Cooling gel inserts", "Adjustable strap"],
    },
    {
      name: "CartivaCare Complete Relief Bundle",
      slug: "cartiva-care-complete-relief-bundle",
      price: "1399",
      originalPrice: "1999",
      category: "Bundles",
      description: "Everything you need in one bundle. Includes: Period Cramp Massager, Heating Pad Belt and Aromatherapy Roll-On. Save over 60%.",
      image: null,
      badge: "Best Value",
      rating: "4.9",
      reviewCount: 1102,
      inStock: true,
      isNew: false,
      isBestseller: true,
      colors: [],
      features: ["Massager + Heating Belt + Roll-On", "Save 60%+", "Premium gift packaging"],
    },
    {
      name: "CartivaCare Yoga & Stretch Mat",
      slug: "cartiva-care-yoga-stretch-mat",
      price: "549",
      originalPrice: null,
      category: "Fitness",
      description: "A premium non-slip yoga mat with printed gentle stretch sequences designed specifically for period relief. 6mm cushion.",
      image: null,
      badge: null,
      rating: "4.3",
      reviewCount: 321,
      inStock: true,
      isNew: false,
      isBestseller: false,
      colors: ["Lavender", "Sage", "Coral"],
      features: ["6mm TPE foam", "Non-slip surface", "Printed stretch guides", "Carrying strap included"],
    },
    {
      name: "CartivaCare Electric Milk Frother",
      slug: "cartiva-care-electric-milk-frother",
      price: "649",
      originalPrice: "999",
      category: "Kitchen & Home",
      description: "Upgrade your morning ritual with the CartivaCare Electric Milk Frother. Creates perfectly silky foam for lattes, cappuccinos, and wellness drinks in seconds.",
      image: null,
      badge: "New",
      rating: "4.6",
      reviewCount: 318,
      inStock: true,
      isNew: true,
      isBestseller: false,
      colors: ["Rose Gold", "Matte Black", "Silver"],
      features: ["3 speed settings", "USB-C rechargeable", "90 min battery", "Detachable whisk head"],
    },
    {
      name: "CartivaPro 3-in-1 PocketVac",
      slug: "cartivapro-3-in-1-pocketvac",
      price: "1299",
      originalPrice: "1799",
      category: "Kitchen & Home",
      description: "The world's most compact and versatile mini vacuum cleaner. Three modes: Standard Suction, Turbo Boost, and Blow Mode. Folds flat for easy storage.",
      image: null,
      badge: "New",
      rating: "4.5",
      reviewCount: 214,
      inStock: true,
      isNew: true,
      isBestseller: false,
      colors: ["Midnight Black", "Pearl White", "Dusty Rose"],
      features: ["3 modes: Suction, Turbo, Blow", "USB-C rechargeable", "30 min battery", "Foldable design"],
    },
  ];

  const inserted = await db.insert(productsTable).values(defaults).returning();
  res.json({ message: "Seeded successfully", count: inserted.length });
});

export default router;
