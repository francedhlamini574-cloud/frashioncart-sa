import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type WishlistContextType = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);
const KEY = "frashioncart.wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {} }, [ids]);

  const has = (id: string) => ids.includes(id);
  const toggle = (id: string) => setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]);
  const remove = (id: string) => setIds(prev => prev.filter(x => x !== id));

  return (
    <WishlistContext.Provider value={{ ids, has, toggle, remove, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
