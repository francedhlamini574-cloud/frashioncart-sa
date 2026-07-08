import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS, formatZAR } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-store";
import { Heart, Truck, RotateCcw, Shield } from "lucide-react";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = PRODUCTS.find(p => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-4xl">Piece not found</h1>
        <Link to="/shop" className="mt-6 inline-block border-b border-foreground pb-0.5 text-xs uppercase tracking-widest">Back to shop</Link>
      </div>
    </div>
  ),
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);
  const related = PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-6 py-8 md:px-10">
        <nav className="mb-6 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" width={900} height={1100} />
          </div>

          <div className="md:pl-6 lg:pl-12">
            <div className="eyebrow mb-3">{product.brand} · {product.category}</div>
            <h1 className="font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
            <div className="mt-6 text-xl">{formatZAR(product.price)}</div>

            <p className="mt-8 text-sm leading-relaxed text-muted-foreground max-w-md">{product.description}</p>

            <div className="mt-10">
              <div className="flex items-center justify-between mb-3">
                <div className="eyebrow">Size</div>
                <button className="text-[11px] uppercase tracking-widest underline underline-offset-4">Size guide</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {["XS", "S", "M", "L", "XL"].map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`border py-3 text-sm ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => { add(product.id); setAdded(true); setTimeout(() => setAdded(false), 1600); }}
                className="flex-1 bg-foreground py-4 text-[11px] tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
              >
                {added ? "Added to bag" : "Add to bag"}
              </button>
              <button aria-label="Wishlist" className="border border-border p-4 hover:border-foreground">
                <Heart className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              {product.stock > 5 ? "In stock — ready to ship" : `Only ${product.stock} left · shipped by ${product.brand}`}
            </div>

            <div className="mt-10 space-y-3 border-t border-border pt-6 text-sm">
              <div className="flex items-center gap-3"><Truck className="h-4 w-4" /> Shipped by the brand, from South Africa</div>
              <div className="flex items-center gap-3"><RotateCcw className="h-4 w-4" /> 14-day returns via seller</div>
              <div className="flex items-center gap-3"><Shield className="h-4 w-4" /> Frashion buyer protection</div>
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
