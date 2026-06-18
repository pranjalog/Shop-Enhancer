import { useState, useEffect } from "react";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/types";

export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  category: string;
  description: string;
  image: string | null;
  badge: string | null;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew: boolean;
  isBestseller: boolean;
  colors: string[];
  features: string[];
  createdAt: string;
  updatedAt: string;
};

export function apiProductToProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    category: p.category,
    description: p.description,
    shortDescription: p.description.slice(0, 120) + "...",
    images: p.image ? [p.image] : [],
    badge: p.badge ?? undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    inStock: p.inStock,
    featured: p.isBestseller || p.isNew,
    tags: [
      ...(p.isBestseller ? ["bestseller"] : []),
      ...(p.isNew ? ["new"] : []),
    ],
    colors: p.colors,
    specs: {},
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: ApiProduct[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.map(apiProductToProduct));
          setFromApi(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, fromApi };
}
