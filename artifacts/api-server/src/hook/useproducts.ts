import { useState, useEffect } from "react";

export interface ApiProduct {
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
}

export function useProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
