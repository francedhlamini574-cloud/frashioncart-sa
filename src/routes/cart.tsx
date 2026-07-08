import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart-store";
import { formatZAR } from "@/lib/mock-data";
import { X, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { detailed, setQty, remove, subtotal, count } = useCart();
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
              {detailed.map(({ product, qty }) => (
                <div key={product.id} className="flex gap-5 py-6">
                  <Link to="/product/$id" params={{ id: product.id }} className="block w-24 md:w-32 shrink-0 bg-muted">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover aspect-[3/4]" />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="eyebrow mb-1">{product.brand}</div>
                        <div className="text-sm">{product.name}</div>
                      </div>
                      <button onClick={() => remove(product.id)} aria-label="Remove"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex items-center border border-border">
                        <button onClick={() => setQty(product.id, qty - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-sm">{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                      </div>
                      <div className="text-sm">{formatZAR(product.price * qty)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="md:pl-8">
              <div className="border border-border p-6">
                <div className="eyebrow mb-4">Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatZAR(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Complimentary" : formatZAR(shipping)}</span></div>
                  <div className="mt-4 border-t border-border pt-4 flex justify-between text-base"><span>Total</span><span>{formatZAR(total)}</span></div>
                </div>
                <button className="mt-6 w-full bg-foreground py-4 text-[11px] tracking-[0.2em] uppercase text-background">Checkout</button>
                <p className="mt-4 text-[11px] text-muted-foreground text-center">Shipped by each brand independently. Frashion retains a 10% platform fee.</p>
              </div>
            </aside>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
