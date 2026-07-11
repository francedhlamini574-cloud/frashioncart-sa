import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight, Check } from "lucide-react";
import brand1 from "@/assets/brand1.jpg";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell on FrashionCart — Open your storefront" },
      { name: "description", content: "Open a FrashionCart storefront and reach South Africa's most considered fashion shoppers. Keep 90% of every sale." },
      { property: "og:title", content: "Sell on FrashionCart" },
      { property: "og:description", content: "Open a storefront and keep 90% of every sale." },
    ],
  }),
  component: Sell,
});

function Sell() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-[1400px] grid gap-12 px-6 py-20 md:grid-cols-2 md:px-10 md:py-32">
        <div>
          <div className="eyebrow mb-4">For designers</div>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.02]">
            Sell your label on <em className="italic font-light">FrashionCart.</em>
          </h1>
          <p className="mt-8 text-base leading-relaxed text-muted-foreground max-w-md">
            A curated marketplace built for South Africa's independent fashion community. List your pieces, manage inventory, and ship on your terms — we handle discovery, checkout and payments.
          </p>

          <div className="mt-10 space-y-3">
            {[
              "Keep 90% of every sale — FrashionCart takes a flat 10%",
              "You control inventory, pricing and fulfilment",
              "Payouts weekly, in ZAR, directly to your account",
              "Dedicated onboarding + brand page",
            ].map(t => (
              <div key={t} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 mt-0.5 shrink-0" /> <span>{t}</span>
              </div>
            ))}
          </div>

          <Link to="/seller" className="mt-10 inline-flex items-center gap-3 bg-foreground px-7 py-4 text-[11px] tracking-[0.2em] uppercase text-background">
            Open a storefront <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="aspect-[3/4] overflow-hidden bg-muted">
          <img src={brand1} alt="Independent designers" className="h-full w-full object-cover" loading="lazy" />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 border-t border-border">
        <div className="eyebrow mb-3">How it works</div>
        <h2 className="font-display text-4xl md:text-5xl mb-16">Four steps, one afternoon.</h2>
        <div className="grid gap-10 md:grid-cols-4">
          {[
            ["01", "Apply", "Tell us about your label. We review within 3 business days."],
            ["02", "Onboard", "Set up your brand page, upload lookbook, connect payouts."],
            ["03", "List", "Add products, sizes and inventory from your dashboard."],
            ["04", "Ship & earn", "Fulfil orders on your terms. Payouts every Friday."],
          ].map(([n, t, d]) => (
            <div key={n}>
              <div className="font-display text-3xl text-muted-foreground">{n}</div>
              <div className="mt-4 font-medium">{t}</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
