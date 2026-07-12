import { Link } from "@tanstack/react-router";
import { Heart, Eye, BadgeCheck } from "lucide-react";
import { formatZAR, priceAfterDiscount, type Product } from "@/lib/mock-data";
import { useWishlist } from "@/lib/wishlist-store";
import { BRANDS } from "@/lib/mock-data";
import { useState } from "react";
import { QuickView } from "./quick-view";

export function ProductCard({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const [quickOpen, setQuickOpen] = useState(false);
  const wished = has(product.id);
  const brandInfo = BRANDS.find(b => b.slug === product.brandSlug);
  const verified = brandInfo?.verified ?? true;
  const discounted = priceAfterDiscount(product);
  const hasDiscount = product.discountPct && product.discountPct > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <>
      <div className="group block hover-lift">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="relative block aspect-[3/4] overflow-hidden bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />

          {/* Badges — top-left */}
          <div className="absolute left-2 top-2 flex flex-col gap-1.5">
            {product.isNew && <Badge>New</Badge>}
            {product.trending && <Badge>Trending</Badge>}
            {hasDiscount && <Badge tone="dark">−{product.discountPct}%</Badge>}
            {product.gender === "Unisex" && <Badge tone="muted">Unisex</Badge>}
          </div>

          {/* Wishlist heart — top-right */}
          <button
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => { e.preventDefault(); toggle(product.id); }}
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center bg-background/85 backdrop-blur transition-transform hover:scale-105"
          >
            <Heart className={`h-4 w-4 ${wished ? "fill-foreground text-foreground" : ""}`} />
          </button>

          {/* Quick view — hover overlay */}
          <div className="absolute inset-x-2 bottom-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={(e) => { e.preventDefault(); setQuickOpen(true); }}
              className="w-full flex items-center justify-center gap-2 bg-background/95 py-2.5 text-[11px] tracking-[0.2em] uppercase backdrop-blur"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="h-3.5 w-3.5" /> Quick view
            </button>
          </div>

          {lowStock && (
            <div className="absolute bottom-2 left-2 bg-background/90 px-2 py-1 text-[10px] tracking-widest uppercase text-foreground group-hover:opacity-0 transition-opacity">
              Only {product.stock} left
            </div>
          )}
        </Link>

        <div className="mt-3 flex items-start justify-between gap-3 text-sm">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              <Link to="/brand/$slug" params={{ slug: product.brandSlug }} className="hover:text-foreground truncate">
                {product.brand}
              </Link>
              {verified && <BadgeCheck className="h-3 w-3 shrink-0 text-foreground/70" aria-label="Verified seller" />}
            </div>
            <div className="mt-0.5 truncate">{product.name}</div>
            {product.colors.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1" aria-label="Available colours">
                {product.colors.slice(0, 4).map((c, i) => (
                  <span key={i} title={c.name} className="inline-block h-2.5 w-2.5 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">+{product.colors.length - 4}</span>
                )}
              </div>
            )}
          </div>
          <div className="whitespace-nowrap text-right">
            {hasDiscount ? (
              <>
                <div>{formatZAR(discounted)}</div>
                <div className="text-[11px] text-muted-foreground line-through">{formatZAR(product.price)}</div>
              </>
            ) : (
              <div>{formatZAR(product.price)}</div>
            )}
          </div>
        </div>
      </div>

      <QuickView product={product} open={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  );
}

function Badge({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" | "muted" }) {
  const tones = {
    light: "bg-background text-foreground",
    dark: "bg-foreground text-background",
    muted: "bg-secondary text-foreground",
  } as const;
  return (
    <span className={`${tones[tone]} px-2 py-1 text-[10px] tracking-widest uppercase leading-none`}>
      {children}
    </span>
  );
}
