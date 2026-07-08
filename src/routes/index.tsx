import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { BRANDS, CATEGORIES, featured, newArrivals, trending } from "@/lib/mock-data";
import heroImg from "@/assets/hero.jpg";
import brand1 from "@/assets/brand1.jpg";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Announcement strip */}
      <div className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-[1400px] overflow-hidden px-6 py-2 md:px-10">
          <p className="text-center text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            Complimentary shipping on orders over R1,500 · Delivered across South Africa
          </p>
        </div>
      </div>

      {/* HERO */}
      <section className="relative">
        <div className="grid min-h-[86vh] md:grid-cols-12">
          <div className="md:col-span-5 flex items-center px-6 py-16 md:px-14">
            <div className="max-w-md">
              <div className="eyebrow mb-6">Autumn / Winter 26 · South Africa</div>
              <h1 className="font-display text-5xl leading-[1.02] md:text-7xl">
                The new<br/>ateliers of<br/><em className="italic font-light">South Africa.</em>
              </h1>
              <p className="mt-8 text-base leading-relaxed text-muted-foreground max-w-sm">
                Frashion is a marketplace for independent designers — from Cape Town ateliers to Joburg studios. Shipped by the makers themselves.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <Link to="/shop" className="group inline-flex items-center gap-3 bg-foreground px-6 py-3.5 text-[11px] tracking-[0.2em] uppercase text-background">
                  Shop the edit
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/sell" className="text-[11px] tracking-[0.2em] uppercase border-b border-foreground pb-0.5">
                  Sell on Frashion
                </Link>
              </div>
            </div>
          </div>
          <div className="md:col-span-7 relative overflow-hidden bg-muted min-h-[60vh]">
            <img
              src={heroImg}
              alt="Frashion Autumn Winter campaign"
              width={1600}
              height={1808}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-6 right-6 bg-background/90 backdrop-blur px-4 py-3 text-xs">
              <div className="eyebrow mb-1">Cover</div>
              <div>Isilo Atelier · Linen dress in bone</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid grid-cols-3 md:grid-cols-6">
            {CATEGORIES.map((c, i) => (
              <Link
                key={c}
                to="/shop"
                className={`py-8 text-center text-[11px] tracking-[0.2em] uppercase transition-colors hover:bg-secondary ${i > 0 ? "border-l border-border" : ""}`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="eyebrow mb-3">Just in</div>
            <h2 className="font-display text-4xl md:text-5xl">New arrivals.</h2>
          </div>
          <Link to="/shop" className="text-[11px] tracking-[0.2em] uppercase border-b border-foreground pb-0.5">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {newArrivals().map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* FEATURED BRAND */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={brand1} alt="Featured brand" loading="lazy" width={1200} height={800} className="h-full w-full object-cover" />
            </div>
            <div className="md:pl-12">
              <div className="eyebrow mb-4">Featured atelier</div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">Maison Noir</h2>
              <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
                Founded in a small Cape Town workshop, Maison Noir builds tailoring for the modern wardrobe — half-canvas construction, natural fibres, no seasons.
              </p>
              <Link to="/shop" className="mt-8 inline-block text-[11px] tracking-[0.2em] uppercase border-b border-foreground pb-0.5">
                Discover the atelier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="eyebrow mb-3">This week</div>
            <h2 className="font-display text-4xl md:text-5xl">Trending in the edit.</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {trending().map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* BRANDS MARQUEE */}
      <section className="border-y border-border py-16 overflow-hidden">
        <div className="eyebrow text-center mb-8">The brands</div>
        <div className="flex whitespace-nowrap marquee">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <div key={i} className="mx-12 flex items-baseline gap-3">
              <span className="font-display text-3xl md:text-4xl">{b.name}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{b.location}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
        <div className="eyebrow mb-3">Editor's picks</div>
        <h2 className="font-display text-4xl md:text-5xl mb-12">Objects of desire.</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
          {featured().slice(0, 3).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* SELLER CTA */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <div className="relative overflow-hidden bg-foreground text-background px-8 py-20 md:px-20 md:py-28">
          <div className="max-w-2xl">
            <div className="eyebrow text-background/60 mb-4">For designers</div>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05]">
              Your label, in front of the country's most considered shoppers.
            </h2>
            <p className="mt-6 text-background/70 max-w-lg">
              Open a Frashion storefront in minutes. You keep 90% of every sale — we handle discovery, checkout and payments. You ship to the customer, on your terms.
            </p>
            <Link to="/sell" className="mt-10 inline-flex items-center gap-3 bg-background px-6 py-3.5 text-[11px] tracking-[0.2em] uppercase text-foreground">
              Apply to sell
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
