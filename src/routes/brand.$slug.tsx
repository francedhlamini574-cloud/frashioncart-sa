import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/lib/products-store";
import { BRANDS } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";
import { BadgeCheck, Star, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/brand/$slug")({
  component: BrandStore,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function BrandStore() {
  const { slug } = Route.useParams();
  const { byBrandSlug } = useProducts();
  const { users } = useAuth();
  const products = byBrandSlug(slug);

  const seed = BRANDS.find(b => b.slug === slug);
  const owner = users.find(u => u.role === "brand" && u.brandName && slugify(u.brandName) === slug);

  const brand = seed || (owner ? {
    slug,
    name: owner.brandName!,
    location: owner.brandLocation || "South Africa",
    tagline: owner.brandTagline || "Independent designer",
    verified: false,
    followers: 300,
    rating: 4.6,
  } : null);

  if (!brand) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <div className="eyebrow mb-3">Brand not found</div>
          <h1 className="font-display text-4xl">We can't find this atelier.</h1>
          <Link to="/brands" className="mt-6 inline-block border-b border-foreground pb-0.5 text-xs uppercase tracking-widest">All brands</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-6 py-8 md:px-10">
        <Link to="/brands" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All brands
        </Link>

        <header className="mt-8 border-b border-border pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="grid h-20 w-20 place-items-center bg-secondary font-display text-3xl border border-border">{brand.name[0]}</div>
            <div>
              <div className="eyebrow mb-2">{brand.location}</div>
              <h1 className="font-display text-5xl md:text-6xl flex items-center gap-3">
                {brand.name}
                {brand.verified && <BadgeCheck className="h-6 w-6" aria-label="Verified" />}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-lg">{brand.tagline}</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <div className="eyebrow">Rating</div>
              <div className="mt-1 inline-flex items-center gap-1">{brand.rating.toFixed(1)} <Star className="h-3.5 w-3.5 fill-foreground" /></div>
            </div>
            <div>
              <div className="eyebrow">Followers</div>
              <div className="mt-1">{brand.followers.toLocaleString("en-ZA")}</div>
            </div>
            <div>
              <div className="eyebrow">Products</div>
              <div className="mt-1">{products.length}</div>
            </div>
          </div>
        </header>

        <div className="mt-12">
          {products.length === 0 ? (
            <div className="py-24 text-center text-sm text-muted-foreground">This brand hasn't listed any pieces yet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
