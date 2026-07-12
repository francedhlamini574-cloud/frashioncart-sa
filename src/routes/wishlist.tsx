import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { useWishlist } from "@/lib/wishlist-store";
import { useProducts } from "@/lib/products-store";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — FrashionCart S.A" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids } = useWishlist();
  const { all } = useProducts();
  const items = all.filter(p => ids.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10">
        <div className="eyebrow mb-3">Loved</div>
        <h1 className="font-display text-5xl md:text-6xl mb-10">Wishlist <span className="text-muted-foreground">({items.length})</span></h1>

        {items.length === 0 ? (
          <div className="border-y border-border py-24 text-center">
            <Heart className="h-6 w-6 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-6">Your wishlist is empty.</p>
            <Link to="/shop" className="border-b border-foreground pb-0.5 text-xs uppercase tracking-widest">Discover pieces</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
