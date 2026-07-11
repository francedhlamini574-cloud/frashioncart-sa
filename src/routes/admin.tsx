import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BRANDS, PRODUCTS, formatZAR } from "@/lib/mock-data";
import { LayoutGrid, Users, Package, TrendingUp, Settings, LogOut, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FrashionCart" }] }),
  component: AdminDashboard,
});

type Tab = "overview" | "sellers" | "products" | "customers" | "revenue";

const PENDING_SELLERS = [
  { name: "Nyeleti Studio", location: "Johannesburg", applied: "Today", category: "Womenswear" },
  { name: "Karoo Boot Co.", location: "Graaff-Reinet", applied: "Yesterday", category: "Footwear" },
  { name: "Fynn & Sons", location: "Cape Town", applied: "2 days ago", category: "Menswear" },
];

const CUSTOMERS = [
  { name: "Lerato Molefe", email: "lerato@…", city: "Pretoria", orders: 12, spent: 34_500 },
  { name: "Sipho Adams", email: "sipho@…", city: "Durban", orders: 7, spent: 18_940 },
  { name: "Nadia Mbatha", email: "nadia@…", city: "Johannesburg", orders: 4, spent: 9_800 },
];

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const gmv = 2_148_450;
  const commission = gmv * 0.1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid md:grid-cols-[240px_1fr]">
        <aside className="border-r border-border p-6 md:min-h-screen">
          <Link to="/" className="font-display text-2xl block mb-2">FrashionCart</Link>
          <div className="eyebrow mb-8">Admin</div>
          <nav className="space-y-1 text-sm">
            {([
              ["overview", LayoutGrid, "Overview"],
              ["sellers", Users, "Sellers"],
              ["products", Package, "Products"],
              ["customers", Users, "Customers"],
              ["revenue", TrendingUp, "Revenue"],
            ] as const).map(([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left ${tab === key ? "bg-foreground text-background" : "hover:bg-secondary"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
          <Link to="/" className="mt-10 flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </Link>
        </aside>

        <main className="p-8 md:p-12">
          {tab === "overview" && (
            <>
              <div className="eyebrow mb-3">Platform</div>
              <h1 className="font-display text-5xl mb-10">FrashionCart, at a glance.</h1>
              <div className="grid gap-4 md:grid-cols-4 mb-12">
                <MetricCard l="Gross merchandise" v={formatZAR(gmv)} sub="+18% MoM" />
                <MetricCard l="Platform revenue" v={formatZAR(commission)} sub="10% of GMV" highlight />
                <MetricCard l="Active brands" v={String(BRANDS.length)} sub="3 pending review" />
                <MetricCard l="Customers" v="4,218" sub="+312 this month" />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="border border-border">
                  <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div className="eyebrow">Pending seller applications</div>
                    <button onClick={() => setTab("sellers")} className="text-[11px] uppercase tracking-widest underline">Review all</button>
                  </div>
                  {PENDING_SELLERS.map(s => (
                    <div key={s.name} className="flex items-center justify-between border-b border-border px-6 py-4 last:border-0">
                      <div>
                        <div className="text-sm">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.location} · {s.category} · {s.applied}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 border border-border hover:bg-foreground hover:text-background"><Check className="h-3.5 w-3.5" /></button>
                        <button className="p-2 border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border border-border">
                  <div className="border-b border-border px-6 py-4 eyebrow">Top brands · this month</div>
                  {BRANDS.slice(0, 5).map((b, i) => (
                    <div key={b.slug} className="flex items-center justify-between border-b border-border px-6 py-4 last:border-0">
                      <div className="flex items-center gap-4">
                        <span className="font-display text-lg text-muted-foreground w-6">0{i+1}</span>
                        <div>
                          <div className="text-sm">{b.name}</div>
                          <div className="text-xs text-muted-foreground">{b.location}</div>
                        </div>
                      </div>
                      <div className="text-sm">{formatZAR(120_000 - i * 15_000)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "sellers" && (
            <>
              <div className="eyebrow mb-3">Manage</div>
              <h1 className="font-display text-4xl mb-10">Sellers</h1>
              <div className="mb-10">
                <div className="eyebrow mb-4">Pending review</div>
                <div className="border border-border">
                  {PENDING_SELLERS.map(s => (
                    <div key={s.name} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-border px-6 py-4 last:border-0 text-sm">
                      <div>{s.name}</div>
                      <div className="text-muted-foreground">{s.location}</div>
                      <div className="text-muted-foreground">{s.category}</div>
                      <div className="text-muted-foreground">{s.applied}</div>
                      <div className="flex gap-2">
                        <button className="bg-foreground px-4 py-2 text-[11px] uppercase tracking-widest text-background">Approve</button>
                        <button className="border border-border px-4 py-2 text-[11px] uppercase tracking-widest">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-4">Active brands</div>
                <div className="border border-border">
                  {BRANDS.map(b => (
                    <div key={b.slug} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-4 border-b border-border px-6 py-4 last:border-0 text-sm">
                      <div>{b.name}</div>
                      <div className="text-muted-foreground">{b.location}</div>
                      <div className="text-muted-foreground">{b.tagline}</div>
                      <button className="text-xs uppercase tracking-widest underline underline-offset-4">Suspend</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "products" && (
            <>
              <div className="eyebrow mb-3">Catalogue</div>
              <h1 className="font-display text-4xl mb-10">All products</h1>
              <div className="border border-border">
                <div className="grid grid-cols-[80px_1fr_1fr_100px_100px_100px] gap-4 border-b border-border px-4 py-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <div></div><div>Product</div><div>Brand</div><div>Price</div><div>Stock</div><div></div>
                </div>
                {PRODUCTS.map(p => (
                  <div key={p.id} className="grid grid-cols-[80px_1fr_1fr_100px_100px_100px] items-center gap-4 border-b border-border px-4 py-3 last:border-0">
                    <img src={p.image} alt={p.name} className="h-16 w-14 object-cover" />
                    <div className="text-sm">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.brand}</div>
                    <div className="text-sm">{formatZAR(p.price)}</div>
                    <div className="text-sm">{p.stock}</div>
                    <button className="text-xs uppercase tracking-widest underline underline-offset-4 text-left">Manage</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "customers" && (
            <>
              <div className="eyebrow mb-3">Community</div>
              <h1 className="font-display text-4xl mb-10">Customers</h1>
              <div className="border border-border">
                <div className="grid grid-cols-[1fr_1fr_1fr_100px_120px] gap-4 border-b border-border px-6 py-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <div>Name</div><div>Email</div><div>City</div><div>Orders</div><div>Spent</div>
                </div>
                {CUSTOMERS.map(c => (
                  <div key={c.name} className="grid grid-cols-[1fr_1fr_1fr_100px_120px] gap-4 border-b border-border px-6 py-4 last:border-0 text-sm">
                    <div>{c.name}</div>
                    <div className="text-muted-foreground">{c.email}</div>
                    <div className="text-muted-foreground">{c.city}</div>
                    <div>{c.orders}</div>
                    <div>{formatZAR(c.spent)}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "revenue" && (
            <>
              <div className="eyebrow mb-3">Financials</div>
              <h1 className="font-display text-4xl mb-10">Revenue</h1>
              <div className="grid gap-4 md:grid-cols-3 mb-10">
                <MetricCard l="GMV · YTD" v={formatZAR(gmv * 7)} sub="Gross merchandise volume" />
                <MetricCard l="Platform commission" v={formatZAR(commission * 7)} sub="10% of GMV" highlight />
                <MetricCard l="Payouts to brands" v={formatZAR(gmv * 7 * 0.9)} sub="Weekly cadence" />
              </div>
              <div className="border border-border">
                <div className="border-b border-border px-6 py-4 eyebrow">Recent transactions</div>
                {[
                  ["Jul 8, 2026", "Order FR-24098", formatZAR(5_730), formatZAR(573)],
                  ["Jul 8, 2026", "Order FR-24097", formatZAR(2_890), formatZAR(289)],
                  ["Jul 7, 2026", "Order FR-24096", formatZAR(8_940), formatZAR(894)],
                  ["Jul 6, 2026", "Order FR-24094", formatZAR(4_200), formatZAR(420)],
                ].map(([d, o, t, c]) => (
                  <div key={o} className="grid grid-cols-4 gap-4 border-b border-border px-6 py-3 last:border-0 text-sm">
                    <div className="text-muted-foreground">{d}</div>
                    <div>{o}</div>
                    <div>{t}</div>
                    <div className="text-right">Fee {c}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Settings className="hidden" />
        </main>
      </div>
    </div>
  );
}

function MetricCard({ l, v, sub, highlight }: { l: string; v: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`p-6 border ${highlight ? "bg-foreground text-background border-foreground" : "border-border"}`}>
      <div className={`eyebrow mb-3 ${highlight ? "text-background/60" : ""}`}>{l}</div>
      <div className="font-display text-3xl">{v}</div>
      <div className={`mt-2 text-xs ${highlight ? "text-background/60" : "text-muted-foreground"}`}>{sub}</div>
    </div>
  );
}
