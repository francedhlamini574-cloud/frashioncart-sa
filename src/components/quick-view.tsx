import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatZAR, priceAfterDiscount, type Product } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-store";

export function QuickView({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const { add } = useCart();
  const [size, setSize] = useState<string | undefined>(product.sizes.length === 1 ? product.sizes[0] : undefined);
  const [color, setColor] = useState<string | undefined>(product.colors[0]?.name);
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const requiresSize = product.sizes.length > 1;
  const canAdd = !requiresSize || !!size;
  const discounted = priceAfterDiscount(product);

  const submit = () => {
    if (!canAdd || pending) return;
    setPending(true);
    add(product.id, { qty: 1, size, color });
    setTimeout(() => { setPending(false); setAdded(true); setTimeout(onClose, 900); }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Quick view ${product.name}`}>
      <div className="relative grid w-full max-w-3xl overflow-hidden bg-background md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close quick view" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center bg-background/80">
          <X className="h-4 w-4" />
        </button>
        <div className="aspect-[3/4] bg-muted">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col p-6 md:p-8">
          <div className="eyebrow mb-2">{product.brand} · {product.category}</div>
          <h3 className="font-display text-2xl leading-tight">{product.name}</h3>
          <div className="mt-3 text-lg">
            {product.discountPct ? (
              <span className="flex items-baseline gap-2">
                <span>{formatZAR(discounted)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatZAR(product.price)}</span>
              </span>
            ) : formatZAR(product.price)}
          </div>

          {product.colors.length > 0 && (
            <div className="mt-5">
              <div className="eyebrow mb-2">Colour</div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button key={c.name} onClick={() => setColor(c.name)} aria-label={c.name}
                    className={`flex items-center gap-2 border px-2.5 py-1.5 text-[11px] uppercase tracking-widest ${color === c.name ? "border-foreground" : "border-border"}`}>
                    <span className="inline-block h-3 w-3 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <div className="eyebrow mb-2">Size</div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={`border px-3 py-1.5 text-[11px] uppercase tracking-widest ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>
            {requiresSize && !size && <div className="mt-2 text-[11px] text-muted-foreground">Select a size to add to bag.</div>}
          </div>

          <div className="mt-auto pt-6 flex gap-3">
            <button onClick={submit} disabled={!canAdd || pending || added}
              className="flex-1 bg-foreground py-3.5 text-[11px] tracking-[0.2em] uppercase text-background disabled:opacity-40 disabled:cursor-not-allowed">
              {added ? "Added" : pending ? "Adding…" : "Add to bag"}
            </button>
            <Link to="/product/$id" params={{ id: product.id }} onClick={onClose}
              className="border border-border px-4 py-3.5 text-[11px] tracking-[0.2em] uppercase hover:border-foreground">
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
