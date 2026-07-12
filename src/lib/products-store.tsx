import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "./mock-data";
import { sanitizeImageUrl } from "./validation";

type ProductsContextType = {
  all: Product[];
  userProducts: Product[];
  byBrandOwner: (ownerId: string) => Product[];
  byBrandSlug: (slug: string) => Product[];
  addProduct: (p: Omit<Product, "id" | "createdAt" | "isNew"> & { ownerId: string }) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
};

type StoredProduct = Product & { ownerId: string };

const ProductsContext = createContext<ProductsContextType | null>(null);
const KEY = "frashioncart.products";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&q=80";

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [userProducts, setUserProducts] = useState<StoredProduct[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUserProducts(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: StoredProduct[]) => {
    setUserProducts(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const addProduct: ProductsContextType["addProduct"] = (p) => {
    const safeImage = sanitizeImageUrl(p.image) || FALLBACK_IMAGE;
    const product: StoredProduct = {
      id: `up_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      name: p.name,
      brand: p.brand,
      brandSlug: p.brandSlug,
      price: p.price,
      category: p.category,
      gender: p.gender,
      sizes: p.sizes,
      colors: p.colors,
      stock: p.stock,
      description: p.description,
      discountPct: p.discountPct,
      rating: 4.5 + Math.random() * 0.5,
      isNew: true,
      createdAt: new Date().toISOString(),
      image: safeImage,
      images: p.images?.map(sanitizeImageUrl).filter(Boolean),
      ownerId: p.ownerId,
    };
    persist([product, ...userProducts]);
    return product;
  };

  const updateProduct: ProductsContextType["updateProduct"] = (id, patch) => {
    const nextPatch: Partial<Product> = { ...patch };
    if (typeof patch.image === "string") nextPatch.image = sanitizeImageUrl(patch.image) || FALLBACK_IMAGE;
    persist(userProducts.map(p => p.id === id ? { ...p, ...nextPatch } : p));
  };

  const removeProduct: ProductsContextType["removeProduct"] = (id) => {
    persist(userProducts.filter(p => p.id !== id));
  };

  const all: Product[] = useMemo(() => {
    const merged = [...userProducts, ...PRODUCTS];
    return merged.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [userProducts]);

  const byBrandOwner = (ownerId: string) => userProducts.filter(p => p.ownerId === ownerId);
  const byBrandSlug = (slug: string) => all.filter(p => p.brandSlug === slug);

  return (
    <ProductsContext.Provider value={{ all, userProducts, byBrandOwner, byBrandSlug, addProduct, updateProduct, removeProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
