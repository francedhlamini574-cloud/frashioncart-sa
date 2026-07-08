import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, PRODUCTS } from "@/lib/mock-data";

export const Route = createFileRoute("/shop")({
  component: Shop,
});

function Shop() {
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "low" | "high">("new");

  let items = PRODUCTS.filter(p =>
    (!cat || p.category === cat) &&
    (!q || (p.name + " " + p.brand).toLowerCase().includes(q.toLowerCase()))
  );
  if (sort === "low") items = [...items].sort((a, b) => a.price - b.price);
  if (sort === "high") items = [...items].sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10">
        <div className="eyebrow mb-3">Marketplace</div>
        <h1 className="font-display text-5xl md:text-6xl mb-10">
          {cat ?? "Everything"}<span className="text-muted-foreground">.</span>
        </h1>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-1 text-[11px] tracking-[0.15em] uppercase">
            <button onClick={() => setCat(null)} className={`px-3 py-2 ${!cat ? "bg-foreground text-background" : "hover:bg-secondary"}`}>All</button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} className={`px-3 py-2 ${cat === c ? "bg-foreground text-background" : "hover:bg-secondary"}`}>{c}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search"
              className="w-full md:w-56 border-b border-foreground/40 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <select value={sort} onChange={e => setSort(e.target.value as "new" | "low" | "high")} className="border-b border-foreground/40 bg-transparent py-2 text-sm outline-none">
              <option value="new">Newest</option>
              <option value="low">Price · low</option>
              <option value="high">Price · high</option>
            </select>
          </div>
        </div>

        <div className="mb-6 text-xs text-muted-foreground">{items.length} pieces from {new Set(items.map(i => i.brand)).size} brands</div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        {items.length === 0 && (
          <div className="py-24 text-center text-sm text-muted-foreground">Nothing here yet — try another filter.</div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
