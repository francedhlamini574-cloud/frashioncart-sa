import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { BRANDS, CATEGORIES, featured, newArrivals } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-store";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import brand1 from "@/assets/brand1.jpg";
import { ArrowRight, Star, Sparkles, ShieldCheck, Truck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FrashionCart S.A — Independent South African fashion brands" },
      { name: "description", content: "Discover independent South African designers — womenswear, menswear, unisex, footwear, accessories and jewellery. Shipped by the makers." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { all } = useProducts();
  const newest = [...all].sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8);
  const bestSellers = all.slice(0, 4);
  const luxury = all.filter(p => p.price >= 4000).slice(0, 4);
  const streetwear = all.filter(p => p.category === "Footwear" || p.gender === "Unisex").slice(0, 4);
  const trendingNow = all.filter(p => p.trending).slice(0, 4);
  const flashSale = all.filter(p => p.discountPct && p.discountPct > 0).slice(0, 3);
  const seed = featured();
  const seedNew = newArrivals();
  const arrivals = newest.length ? newest : seedNew;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Announcement */}
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
                FrashionCart is a marketplace for independent designers — from Cape Town ateliers to Joburg studios. Shipped by the makers themselves.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link to="/shop" className="group inline-flex items-center gap-3 bg-foreground px-6 py-3.5 text-[11px] tracking-[0.2em] uppercase text-background">
                  Shop the edit
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/sell" className="text-[11px] tracking-[0.2em] uppercase border-b border-foreground pb-0.5">
                  Sell on FrashionCart
                </Link>
              </div>
            </div>
          </div>
          <div className="md:col-span-7 relative overflow-hidden bg-muted min-h-[60vh]">
            <img src={heroImg} alt="FrashionCart Autumn Winter campaign" width={1600} height={1808} className="h-full w-full object-cover" />
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
              <Link key={c} to="/shop" className={`py-8 text-center text-[11px] tracking-[0.2em] uppercase transition-colors hover:bg-secondary ${i > 0 ? "border-l border-border" : ""}`}>
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      {trendingNow.length > 0 && (
        <Section eyebrow="This week" title="Trending in the edit." viewAllTo="/shop">
          <ProductGrid products={trendingNow} />
        </Section>
      )}

      {/* NEW ARRIVALS */}
      <Section eyebrow="Just in" title="New arrivals." viewAllTo="/shop">
        <ProductGrid products={arrivals.slice(0, 4)} />
      </Section>

      {/* FEATURED BRANDS */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="eyebrow mb-3">Featured</div>
              <h2 className="font-display text-4xl md:text-5xl">The ateliers.</h2>
            </div>
            <Link to="/brands" className="text-[11px] tracking-[0.2em] uppercase border-b border-foreground pb-0.5">All brands</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {BRANDS.slice(0, 3).map((b, i) => (
              <Link key={b.slug} to="/brand/$slug" params={{ slug: b.slug }} className="group block border border-border bg-background overflow-hidden hover-lift">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={i === 0 ? brand1 : (i === 1 ? heroImg : brand1)} alt={b.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                </div>
                <div className="p-5">
                  <div className="eyebrow mb-2">{b.location}</div>
                  <div className="font-display text-2xl">{b.name}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{b.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AFRICAN DESIGNERS strip */}
      <Section eyebrow="Made on the continent" title="African designers.">
        <ProductGrid products={seed.slice(0, 4)} />
      </Section>

      {/* FLASH SALE */}
      {flashSale.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 pb-8 md:px-10">
          <div className="border border-foreground bg-foreground text-background px-6 py-10 md:px-10 md:py-14">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <div className="eyebrow text-background/60 mb-3 flex items-center gap-2"><Sparkles className="h-3 w-3" /> Flash edit · 48 hrs</div>
                <h2 className="font-display text-4xl md:text-5xl">The end of season.</h2>
              </div>
              <Countdown hours={48} />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 [&_a]:text-background [&_span]:text-background/70">
              {flashSale.map(p => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group block bg-background/5 p-4 hover-lift">
                  <div className="aspect-[3/4] overflow-hidden bg-muted mb-3">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <div className="text-[10px] tracking-widest uppercase text-background/60">{p.brand}</div>
                  <div className="mt-0.5 text-sm text-background">{p.name}</div>
                  <div className="mt-1 text-xs text-background">−{p.discountPct}% off</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BEST SELLERS */}
      <Section eyebrow="Loved by our customers" title="Best sellers.">
        <ProductGrid products={bestSellers} />
      </Section>

      {/* LUXURY / STREETWEAR split */}
      <section className="mx-auto max-w-[1400px] px-6 py-10 md:px-10">
        <div className="grid gap-6 md:grid-cols-2">
          <CollectionTile title="The luxury edit." tag="Refined, considered, forever." to="/shop" image={brand1} />
          <CollectionTile title="Off-duty streetwear." tag="Court sneakers, tailored joggers." to="/shop" image={heroImg} />
        </div>
      </section>

      {luxury.length > 0 && (
        <Section eyebrow="Luxury" title="Objects of desire.">
          <ProductGrid products={luxury} />
        </Section>
      )}

      {streetwear.length > 0 && (
        <Section eyebrow="Streetwear" title="Wear it every day.">
          <ProductGrid products={streetwear} />
        </Section>
      )}

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

      {/* REVIEWS */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
        <div className="eyebrow mb-3">In their words</div>
        <h2 className="font-display text-4xl md:text-5xl mb-12">Loved across the country.</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { q: "The Maison Noir suit fits like it was made for me. I keep going back for more.", n: "Thabo M., Johannesburg" },
            { q: "Beautifully packaged, shipped in three days from the atelier itself. Feels premium.", n: "Lerato V., Cape Town" },
            { q: "It's how e-commerce should feel — considered, quiet, quality.", n: "Nadia S., Durban" },
          ].map((r) => (
            <div key={r.n} className="border border-border p-8">
              <div className="flex gap-1 mb-4" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-foreground text-foreground" />)}
              </div>
              <p className="text-sm leading-relaxed">"{r.q}"</p>
              <div className="mt-6 eyebrow">{r.n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 md:grid-cols-3">
          {[
            { i: Truck, t: "Shipped by the brand", s: "3–5 business days across SA" },
            { i: ShieldCheck, t: "Buyer protection", s: "14-day returns, direct with seller" },
            { i: Sparkles, t: "Independent designers", s: "Every listing is verified" },
          ].map((f, i) => (
            <div key={i} className={`flex items-center gap-4 px-6 py-8 md:px-10 ${i > 0 ? "md:border-l border-border" : ""}`}>
              <f.i className="h-5 w-5" />
              <div>
                <div className="text-sm">{f.t}</div>
                <div className="text-xs text-muted-foreground">{f.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SELLER CTA */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
        <div className="relative overflow-hidden bg-foreground text-background px-8 py-20 md:px-20 md:py-28">
          <div className="max-w-2xl">
            <div className="eyebrow text-background/60 mb-4">For designers</div>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05]">
              Your label, in front of the country's most considered shoppers.
            </h2>
            <p className="mt-6 text-background/70 max-w-lg">
              Open a FrashionCart storefront in minutes. You keep 90% of every sale — we handle discovery, checkout and payments. You ship to the customer, on your terms.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup" className="inline-flex items-center gap-3 bg-background px-6 py-3.5 text-[11px] tracking-[0.2em] uppercase text-foreground">
                Apply to sell <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/sell" className="inline-flex items-center gap-3 border border-background/40 px-6 py-3.5 text-[11px] tracking-[0.2em] uppercase">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="eyebrow mb-3">The journal</div>
            <h2 className="font-display text-4xl md:text-5xl">Stories from the studios.</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "The rise of Cape Town tailoring", d: "How a new generation is redefining the suit." },
            { t: "Inside Isilo's Joburg atelier", d: "A studio visit with the founder." },
            { t: "The materials that matter", d: "Cashmere, linen, and vegetable-tanned leather." },
          ].map(a => (
            <article key={a.t} className="border border-border p-6 hover-lift">
              <div className="eyebrow mb-3">Journal</div>
              <h3 className="font-display text-2xl">{a.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{a.d}</p>
              <div className="mt-6 text-[11px] tracking-widest uppercase border-b border-foreground inline-block pb-0.5">Read more</div>
            </article>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 text-center">
          <div className="eyebrow mb-3">Stay in the loop</div>
          <h2 className="font-display text-4xl md:text-5xl">The new arrivals, once a week.</h2>
          <form className="mx-auto mt-8 flex max-w-md items-center border-b border-foreground" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="hp-newsletter" className="sr-only">Email address</label>
            <input id="hp-newsletter" type="email" placeholder="Your email" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground" />
            <button className="text-[11px] tracking-widest uppercase">Subscribe</button>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Section({ eyebrow, title, viewAllTo, children }: { eyebrow: string; title: string; viewAllTo?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="eyebrow mb-3">{eyebrow}</div>
          <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
        </div>
        {viewAllTo && <Link to={viewAllTo as "/shop"} className="text-[11px] tracking-[0.2em] uppercase border-b border-foreground pb-0.5">View all</Link>}
      </div>
      {children}
    </section>
  );
}

function ProductGrid({ products }: { products: import("@/lib/mock-data").Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

function CollectionTile({ title, tag, to, image }: { title: string; tag: string; to: string; image: string }) {
  return (
    <Link to={to as "/shop"} className="relative block aspect-[16/10] overflow-hidden group hover-lift">
      <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 p-8 text-background">
        <div className="eyebrow text-background/70 mb-2">{tag}</div>
        <h3 className="font-display text-3xl md:text-4xl">{title}</h3>
      </div>
    </Link>
  );
}

function Countdown({ hours }: { hours: number }) {
  const [remaining, setRemaining] = useState(hours * 3600);
  useEffect(() => {
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-2 font-display text-3xl md:text-4xl tabular-nums">
      <span>{h}</span><span className="text-background/40">:</span>
      <span>{m}</span><span className="text-background/40">:</span>
      <span>{s}</span>
    </div>
  );
}
