import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Product } from "@/types";

interface CompareContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
  clearAll: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === product.id)) return prev;
      if (prev.length >= 4) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const isInCompare = useCallback(
    (productId: string) => items.some((i) => i.id === productId),
    [items]
  );

  const toggleItem = useCallback(
    (product: Product) => {
      if (items.some((i) => i.id === product.id)) {
        removeItem(product.id);
      } else {
        addItem(product);
      }
    },
    [items, addItem, removeItem]
  );

  const clearAll = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider
      value={{ items, addItem, removeItem, isInCompare, toggleItem, clearAll }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context)
    throw new Error("useCompare must be used within CompareProvider");
  return context;
}
