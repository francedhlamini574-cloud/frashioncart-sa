import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BRANDS } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-store";
import { useAuth } from "@/lib/auth-store";
import { BadgeCheck, ArrowRight, Star } from "lucide-react";

export const Route = createFileRoute("/brands")({
  head: () => ({ meta: [{ title: "Brands — FrashionCart S.A" }] }),
  component: BrandsPage,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function BrandsPage() {
  const { all } = useProducts();
  const { users } = useAuth();

  const userBrands = users
    .filter(u => u.role === "brand" && u.brandName)
    .map(u => ({
      slug: slugify(u.brandName!),
      name: u.brandName!,
      location: u.brandLocation || "South Africa",
      tagline: u.brandTagline || "Independent designer",
      verified: false,
      followers: Math.floor(200 + Math.random() * 900),
      rating: 4.4 + Math.random() * 0.5,
      createdAt: u.createdAt,
    }));

  const seedBrands = BRANDS.map(b => ({ ...b, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() }));

  const merged = [...userBrands, ...seedBrands].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10">
        <div className="eyebrow mb-3">The ateliers</div>
        <h1 className="font-display text-5xl md:text-6xl mb-12">Brands.</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {merged.map(b => {
            const products = all.filter(p => p.brandSlug === b.slug);
            const cover = products[0]?.image;
            return (
              <Link key={b.slug + b.name} to="/brand/$slug" params={{ slug: b.slug }} className="group block border border-border bg-background overflow-hidden hover-lift">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  {cover ? (
                    <img src={cover} alt={b.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-secondary via-muted to-background" />
                  )}
                  <div className="absolute left-4 top-4 grid h-12 w-12 place-items-center bg-background font-display text-xl border border-border">
                    {b.name[0]}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5">
                    <div className="font-display text-2xl">{b.name}</div>
                    {b.verified && <BadgeCheck className="h-4 w-4" aria-label="Verified" />}
                  </div>
                  <div className="eyebrow mt-1">{b.location}</div>
                  <p className="mt-3 text-sm text-muted-foreground">{b.tagline}</p>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                    <Stat label="Products" value={String(products.length)} />
                    <Stat label="Rating" value={<span className="inline-flex items-center gap-1">{b.rating.toFixed(1)} <Star className="h-3 w-3 fill-foreground" /></span>} />
                    <Stat label="Followers" value={b.followers.toLocaleString("en-ZA")} />
                  </div>
                  <div className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-widest uppercase border-b border-foreground pb-0.5">
                    Visit store <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow text-[9px]">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
