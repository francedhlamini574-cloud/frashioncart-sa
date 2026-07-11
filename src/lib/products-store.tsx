import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "./mock-data";

type ProductsContextType = {
  all: Product[];
  userProducts: Product[];
  byBrandOwner: (ownerId: string) => Product[];
  addProduct: (p: Omit<Product, "id" | "image"> & { image?: string; ownerId: string }) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
};

type StoredProduct = Product & { ownerId: string };

const ProductsContext = createContext<ProductsContextType | null>(null);
const KEY = "frashioncart.products";

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
    const product: StoredProduct = {
      id: `up_${Date.now().toString(36)}`,
      name: p.name,
      brand: p.brand,
      brandSlug: p.brandSlug,
      price: p.price,
      category: p.category,
      stock: p.stock,
      description: p.description,
      isNew: true,
      image: p.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&q=80",
      ownerId: p.ownerId,
    };
    persist([product, ...userProducts]);
    return product;
  };

  const updateProduct: ProductsContextType["updateProduct"] = (id, patch) => {
    persist(userProducts.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  const removeProduct: ProductsContextType["removeProduct"] = (id) => {
    persist(userProducts.filter(p => p.id !== id));
  };

  const byBrandOwner = (ownerId: string) => userProducts.filter(p => p.ownerId === ownerId);
  const all: Product[] = [...userProducts, ...PRODUCTS];

  return (
    <ProductsContext.Provider value={{ all, userProducts, byBrandOwner, addProduct, updateProduct, removeProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
