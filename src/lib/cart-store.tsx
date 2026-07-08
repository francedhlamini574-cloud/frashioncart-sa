import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "./mock-data";

type CartItem = { productId: string; qty: number };
type CartContextType = {
  items: CartItem[];
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  detailed: { product: Product; qty: number }[];
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("frashion.cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("frashion.cart", JSON.stringify(items)); } catch {}
  }, [items]);

  const add = (id: string, qty = 1) =>
    setItems(prev => {
      const existing = prev.find(i => i.productId === id);
      if (existing) return prev.map(i => i.productId === id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { productId: id, qty }];
    });
  const remove = (id: string) => setItems(prev => prev.filter(i => i.productId !== id));
  const setQty = (id: string, qty: number) => setItems(prev =>
    qty <= 0 ? prev.filter(i => i.productId !== id) : prev.map(i => i.productId === id ? { ...i, qty } : i)
  );
  const clear = () => setItems([]);

  const detailed = items
    .map(i => ({ product: PRODUCTS.find(p => p.id === i.productId)!, qty: i.qty }))
    .filter(x => x.product);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = detailed.reduce((s, x) => s + x.product.price * x.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, subtotal, detailed }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
