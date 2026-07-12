import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart-store";
import { formatZAR } from "@/lib/mock-data";
import { X, Minus, Plus, Bookmark, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your bag — FrashionCart S.A" }] }),
  component: CartPage,
});

function CartPage() {
  const { detailed, setQty, remove, subtotal, count, moveToSaved, moveToCart, removeSaved, savedDetailed, hasMissingSize } = useCart();
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 120;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10">
        <div className="eyebrow mb-3">Your bag</div>
        <h1 className="font-display text-5xl md:text-6xl mb-12">Bag <span className="text-muted-foreground">({count})</span></h1>

        {detailed.length === 0 ? (
          <div className="border-y border-border py-24 text-center">
            <p className="text-muted-foreground mb-6">Your bag is empty.</p>
            <Link to="/shop" className="border-b border-foreground pb-0.5 text-xs uppercase tracking-widest">Continue shopping</Link>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-3">
            <div className="md:col-span-2 divide-y divide-border border-y border-border">
              {detailed.map(({ lineId, product, qty, size, color, unitPrice }) => (
                <div key={lineId} className="flex gap-5 py-6">
                  <Link to="/product/$id" params={{ id: product.id }} className="block w-24 md:w-32 shrink-0 bg-muted">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover aspect-[3/4]" />
                  </Link>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <div className="eyebrow mb-1">{product.brand}</div>
                        <div className="text-sm truncate">{product.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {size ? `Size ${size}` : (product.sizes.length > 1 ? <span className="text-destructive">Select a size</span> : "One size")}
                          {color && ` · ${color}`}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {product.stock > 5 ? "In stock" : `Only ${product.stock} left`} · Est. delivery 3–5 business days
                        </div>
                      </div>
                      <button onClick={() => remove(lineId)} aria-label="Remove from bag"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-border">
                          <button onClick={() => setQty(lineId, qty - 1)} className="p-2" aria-label="Decrease quantity"><Minus className="h-3 w-3" /></button>
                          <span className="w-8 text-center text-sm" aria-live="polite">{qty}</span>
                          <button onClick={() => setQty(lineId, qty + 1)} className="p-2" aria-label="Increase quantity"><Plus className="h-3 w-3" /></button>
                        </div>
                        <button onClick={() => moveToSaved(lineId)} className="text-[11px] uppercase tracking-widest inline-flex items-center gap-1.5 hover:opacity-70">
                          <Bookmark className="h-3.5 w-3.5" /> Save for later
                        </button>
                      </div>
                      <div className="text-sm">{formatZAR(unitPrice * qty)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="md:pl-8">
              <div className="border border-border p-6 sticky top-24">
                <div className="eyebrow mb-4">Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatZAR(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Complimentary" : formatZAR(shipping)}</span></div>
                  <div className="mt-4 border-t border-border pt-4 flex justify-between text-base"><span>Total</span><span>{formatZAR(total)}</span></div>
                </div>
                <button disabled={hasMissingSize} className="mt-6 w-full bg-foreground py-4 text-[11px] tracking-[0.2em] uppercase text-background disabled:opacity-40 disabled:cursor-not-allowed">
                  {hasMissingSize ? "Select sizes to checkout" : "Checkout"}
                </button>
                <p className="mt-4 text-[11px] text-muted-foreground text-center">Shipped by each brand independently. FrashionCart retains a 10% platform fee (paid by brands).</p>
              </div>
            </aside>
          </div>
        )}

        {savedDetailed.length > 0 && (
          <section className="mt-20">
            <div className="eyebrow mb-3">For later</div>
            <h2 className="font-display text-3xl md:text-4xl mb-8">Saved items</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {savedDetailed.map(({ lineId, product, size, color, unitPrice }) => (
                <div key={lineId} className="flex gap-4 border border-border p-4">
                  <Link to="/product/$id" params={{ id: product.id }} className="block w-24 shrink-0 bg-muted">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover aspect-[3/4]" />
                  </Link>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="eyebrow">{product.brand}</div>
                    <div className="text-sm truncate">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{size ? `Size ${size}` : ""} {color ? `· ${color}` : ""}</div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="text-sm">{formatZAR(unitPrice)}</div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => moveToCart(lineId)} className="text-[11px] uppercase tracking-widest inline-flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5" /> Move to bag
                        </button>
                        <button onClick={() => removeSaved(lineId)} aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
