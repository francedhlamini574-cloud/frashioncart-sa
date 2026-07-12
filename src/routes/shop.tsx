import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { CATEGORIES, GENDERS, priceAfterDiscount, type Product } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-store";
import { X, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop — FrashionCart S.A" }] }),
  component: Shop,
});

type Sort = "new" | "trending" | "discount" | "low" | "high" | "rating";

function Shop() {
  const { all } = useProducts();
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [sort, setSort] = useState<Sort>("new");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 220);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash.replace("#", "").toLowerCase();
    if (h === "women") setGender("Women");
    else if (h === "men") setGender("Men");
    else if (h === "unisex") setGender("Unisex");
  }, []);

  const brands = useMemo(() => Array.from(new Set(all.map(p => p.brand))).sort(), [all]);
  const allSizes = useMemo(() => Array.from(new Set(all.flatMap(p => p.sizes))), [all]);
  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    all.forEach(p => p.colors.forEach(c => map.set(c.name, c.hex)));
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [all]);

  let items: Product[] = all.filter(p =>
    (!cat || p.category === cat) &&
    (!gender || p.gender === gender) &&
    (!brand || p.brand === brand) &&
    (!size || p.sizes.includes(size)) &&
    (!color || p.colors.some(c => c.name === color)) &&
    (!minRating || (p.rating ?? 0) >= minRating) &&
    (priceAfterDiscount(p) <= maxPrice) &&
    (!q || (p.name + " " + p.brand).toLowerCase().includes(q.toLowerCase()))
  );

  if (sort === "low") items = [...items].sort((a, b) => priceAfterDiscount(a) - priceAfterDiscount(b));
  else if (sort === "high") items = [...items].sort((a, b) => priceAfterDiscount(b) - priceAfterDiscount(a));
  else if (sort === "trending") items = [...items].sort((a, b) => Number(b.trending) - Number(a.trending));
  else if (sort === "discount") items = [...items].sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0));
  else if (sort === "rating") items = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  // 'new' is already the default order from products-store

  const reset = () => {
    setCat(null); setGender(null); setBrand(null); setSize(null); setColor(null); setMinRating(0); setMaxPrice(15000); setQ("");
  };

  const activeCount = [cat, gender, brand, size, color, minRating ? "r" : null, maxPrice < 15000 ? "p" : null, q].filter(Boolean).length;

  const filtersPanel = (
    <div className="space-y-8 text-sm">
      <FilterGroup title="Category">
        <ChipList items={CATEGORIES as unknown as string[]} value={cat} onChange={setCat} />
      </FilterGroup>
      <FilterGroup title="Gender">
        <ChipList items={GENDERS} value={gender} onChange={setGender} />
      </FilterGroup>
      <FilterGroup title="Brand">
        <ChipList items={brands} value={brand} onChange={setBrand} />
      </FilterGroup>
      <FilterGroup title="Size">
        <ChipList items={allSizes} value={size} onChange={setSize} small />
      </FilterGroup>
      <FilterGroup title="Colour">
        <div className="flex flex-wrap gap-2">
          {allColors.map(c => (
            <button key={c.name} onClick={() => setColor(color === c.name ? null : c.name)} aria-label={c.name}
              className={`flex items-center gap-2 border px-2 py-1 text-[11px] uppercase tracking-widest ${color === c.name ? "border-foreground" : "border-border"}`}>
              <span className="inline-block h-3 w-3 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
              {c.name}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title={`Max price · R${maxPrice.toLocaleString("en-ZA")}`}>
        <input type="range" min={500} max={15000} step={100} value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} className="w-full accent-foreground" />
      </FilterGroup>
      <FilterGroup title="Minimum rating">
        <div className="flex gap-2">
          {[0, 4, 4.5, 4.8].map(r => (
            <button key={r} onClick={() => setMinRating(r)}
              className={`border px-3 py-1.5 text-[11px] uppercase tracking-widest ${minRating === r ? "border-foreground bg-foreground text-background" : "border-border"}`}>
              {r === 0 ? "Any" : `${r}★+`}
            </button>
          ))}
        </div>
      </FilterGroup>
      <button onClick={reset} className="text-[11px] uppercase tracking-widest border-b border-foreground pb-0.5">Reset filters</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10">
        <div className="eyebrow mb-3">Marketplace</div>
        <h1 className="font-display text-5xl md:text-6xl mb-8">
          {gender ? `${gender}` : cat ?? "Everything"}<span className="text-muted-foreground">.</span>
        </h1>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
          <button onClick={() => setFiltersOpen(true)} className="md:hidden inline-flex items-center gap-2 border border-border px-4 py-2 text-[11px] uppercase tracking-widest w-fit">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters {activeCount > 0 && <span className="bg-foreground text-background px-1.5">{activeCount}</span>}
          </button>
          <div className="flex flex-1 gap-3">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products or brands"
              className="w-full border-b border-foreground/40 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground" />
            <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="border-b border-foreground/40 bg-transparent py-2 text-sm outline-none">
              <option value="new">Newest</option>
              <option value="trending">Trending</option>
              <option value="discount">Best discount</option>
              <option value="rating">Top rated</option>
              <option value="low">Price · low</option>
              <option value="high">Price · high</option>
            </select>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[240px_1fr]">
          <aside className="hidden md:block sticky top-24 self-start">{filtersPanel}</aside>

          <div>
            <div className="mb-6 text-xs text-muted-foreground">
              {items.length} pieces from {new Set(items.map(i => i.brand)).size} brands
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="py-24 text-center text-sm text-muted-foreground">
                Nothing here yet — try another filter.
                <div className="mt-4"><button onClick={reset} className="text-[11px] uppercase tracking-widest border-b border-foreground pb-0.5">Reset filters</button></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
                {items.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/40 md:hidden" onClick={() => setFiltersOpen(false)}>
          <div className="absolute inset-y-0 right-0 w-80 max-w-full overflow-y-auto bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div className="eyebrow">Filters</div>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X className="h-5 w-5" /></button>
            </div>
            {filtersPanel}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-3">{title}</div>
      {children}
    </div>
  );
}

function ChipList({ items, value, onChange, small }: { items: string[]; value: string | null; onChange: (v: string | null) => void; small?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(it => (
        <button key={it} onClick={() => onChange(value === it ? null : it)}
          className={`border ${small ? "px-2.5 py-1" : "px-3 py-1.5"} text-[11px] uppercase tracking-widest ${value === it ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>
          {it}
        </button>
      ))}
    </div>
  );
}
