import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useProducts } from "./products-store";
import { priceAfterDiscount, type Product } from "./mock-data";

export type CartItem = {
  lineId: string;
  productId: string;
  qty: number;
  size?: string;
  color?: string;
};

export type CartLine = {
  lineId: string;
  product: Product;
  qty: number;
  size?: string;
  color?: string;
  unitPrice: number;
};

type CartContextType = {
  items: CartItem[];
  saved: CartItem[];
  add: (productId: string, opts?: { qty?: number; size?: string; color?: string }) => void;
  remove: (lineId: string) => void;
  setQty: (lineId: string, qty: number) => void;
  clear: () => void;
  moveToSaved: (lineId: string) => void;
  moveToCart: (lineId: string) => void;
  removeSaved: (lineId: string) => void;
  count: number;
  savedCount: number;
  subtotal: number;
  platformFee: number;
  detailed: CartLine[];
  savedDetailed: CartLine[];
  hasMissingSize: boolean;
};

const CartContext = createContext<CartContextType | null>(null);
const CART_KEY = "frashioncart.cart";
const SAVED_KEY = "frashioncart.saved";

const genLineId = (productId: string, size?: string, color?: string) =>
  `${productId}::${size ?? ""}::${color ?? ""}::${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const { all } = useProducts();
  const [items, setItems] = useState<CartItem[]>([]);
  const [saved, setSaved] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY);
      const s = localStorage.getItem(SAVED_KEY);
      if (c) setItems(JSON.parse(c));
      if (s) setSaved(JSON.parse(s));
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {} }, [items]);
  useEffect(() => { try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); } catch {} }, [saved]);

  const add: CartContextType["add"] = (productId, opts = {}) => {
    const { qty = 1, size, color } = opts;
    setItems(prev => {
      const existing = prev.find(i => i.productId === productId && i.size === size && i.color === color);
      if (existing) return prev.map(i => i.lineId === existing.lineId ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { lineId: genLineId(productId, size, color), productId, qty, size, color }];
    });
  };
  const remove = (lineId: string) => setItems(prev => prev.filter(i => i.lineId !== lineId));
  const setQty = (lineId: string, qty: number) => setItems(prev =>
    qty <= 0 ? prev.filter(i => i.lineId !== lineId) : prev.map(i => i.lineId === lineId ? { ...i, qty } : i)
  );
  const clear = () => setItems([]);

  const moveToSaved = (lineId: string) => {
    const item = items.find(i => i.lineId === lineId);
    if (!item) return;
    setItems(prev => prev.filter(i => i.lineId !== lineId));
    setSaved(prev => [item, ...prev]);
  };
  const moveToCart = (lineId: string) => {
    const item = saved.find(i => i.lineId === lineId);
    if (!item) return;
    setSaved(prev => prev.filter(i => i.lineId !== lineId));
    setItems(prev => [...prev, item]);
  };
  const removeSaved = (lineId: string) => setSaved(prev => prev.filter(i => i.lineId !== lineId));

  const toLine = (i: CartItem): CartLine | null => {
    const product = all.find(p => p.id === i.productId);
    if (!product) return null;
    return {
      lineId: i.lineId,
      product,
      qty: i.qty,
      size: i.size,
      color: i.color,
      unitPrice: priceAfterDiscount(product),
    };
  };

  const detailed = items.map(toLine).filter((x): x is CartLine => x !== null);
  const savedDetailed = saved.map(toLine).filter((x): x is CartLine => x !== null);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const savedCount = saved.length;
  const subtotal = detailed.reduce((s, x) => s + x.unitPrice * x.qty, 0);
  const platformFee = 0; // 10% is deducted from the brand, not added to customer
  const hasMissingSize = detailed.some(l => l.product.sizes.length > 1 && !l.size);

  return (
    <CartContext.Provider value={{
      items, saved, add, remove, setQty, clear,
      moveToSaved, moveToCart, removeSaved,
      count, savedCount, subtotal, platformFee, detailed, savedDetailed, hasMissingSize,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
