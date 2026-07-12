import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { formatZAR, priceAfterDiscount } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-store";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { Heart, Truck, RotateCcw, Shield, Check } from "lucide-react";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { all } = useProducts();
  const product = all.find(p => p.id === id);
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const [size, setSize] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(product?.colors[0]?.name);
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeErr, setSizeErr] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-[1400px] px-6 py-24 text-center">
          <div className="eyebrow mb-3">404</div>
          <h1 className="font-display text-4xl">Piece not found</h1>
          <Link to="/shop" className="mt-6 inline-block border-b border-foreground pb-0.5 text-xs uppercase tracking-widest">Back to shop</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const related = all.filter(p => p.id !== product.id).slice(0, 4);
  const requiresSize = product.sizes.length > 1;
  const wished = has(product.id);
  const discounted = priceAfterDiscount(product);

  const addToBag = () => {
    if (pending) return;
    if (requiresSize && !size) { setSizeErr(true); return; }
    setSizeErr(false);
    setPending(true);
    add(product.id, { qty: 1, size, color });
    setTimeout(() => { setAdded(true); setPending(false); setTimeout(() => setAdded(false), 1600); }, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-6 py-8 md:px-10">
        <nav className="mb-6 text-[11px] uppercase tracking-widest text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" width={900} height={1100} />
          </div>

          <div className="md:pl-6 lg:pl-12">
            <div className="eyebrow mb-3">
              <Link to="/brand/$slug" params={{ slug: product.brandSlug }} className="hover:text-foreground">{product.brand}</Link> · {product.category} · {product.gender}
            </div>
            <h1 className="font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
            <div className="mt-6 flex items-baseline gap-3">
              <div className="text-xl">{formatZAR(discounted)}</div>
              {product.discountPct ? (
                <>
                  <div className="text-sm text-muted-foreground line-through">{formatZAR(product.price)}</div>
                  <div className="bg-foreground px-2 py-0.5 text-[10px] uppercase tracking-widest text-background">−{product.discountPct}%</div>
                </>
              ) : null}
            </div>

            <p className="mt-8 text-sm leading-relaxed text-muted-foreground max-w-md">{product.description}</p>

            {product.colors.length > 0 && (
              <div className="mt-8">
                <div className="eyebrow mb-3">Colour · {color}</div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button key={c.name} onClick={() => setColor(c.name)} aria-label={c.name}
                      className={`flex items-center gap-2 border px-2.5 py-1.5 text-[11px] uppercase tracking-widest ${color === c.name ? "border-foreground" : "border-border"}`}>
                      <span className="inline-block h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                      {c.name}
                      {color === c.name && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <div className="eyebrow">Size {requiresSize && <span className="text-destructive">*</span>}</div>
                <button className="text-[11px] uppercase tracking-widest underline underline-offset-4">Size guide</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => { setSize(s); setSizeErr(false); }}
                    className={`border py-3 text-sm ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
              {sizeErr && <div className="mt-2 text-xs text-destructive">Please select a size.</div>}
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={addToBag} disabled={pending}
                className="flex-1 bg-foreground py-4 text-[11px] tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90 disabled:opacity-50">
                {added ? "Added to bag" : pending ? "Adding…" : "Add to bag"}
              </button>
              <button aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => toggle(product.id)}
                className={`border p-4 hover:border-foreground ${wished ? "border-foreground" : "border-border"}`}>
                <Heart className={`h-4 w-4 ${wished ? "fill-foreground" : ""}`} />
              </button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              {product.stock === 0 ? "Out of stock" : product.stock > 5 ? "In stock — ready to ship" : `Only ${product.stock} left · shipped by ${product.brand}`}
            </div>

            <div className="mt-10 space-y-3 border-t border-border pt-6 text-sm">
              <div className="flex items-center gap-3"><Truck className="h-4 w-4" /> Shipped by the brand · 3–5 business days</div>
              <div className="flex items-center gap-3"><RotateCcw className="h-4 w-4" /> 14-day returns via seller</div>
              <div className="flex items-center gap-3"><Shield className="h-4 w-4" /> FrashionCart buyer protection</div>
            </div>
          </div>
        </div>

        <section className="mt-32">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-3xl md:text-4xl">You may also like.</h2>
            <Link to="/shop" className="text-[11px] tracking-[0.2em] uppercase border-b border-foreground pb-0.5">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
