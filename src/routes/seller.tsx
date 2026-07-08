import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PRODUCTS, formatZAR } from "@/lib/mock-data";
import { LayoutGrid, Package, ShoppingBag, TrendingUp, Settings, LogOut, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/seller")({
  head: () => ({ meta: [{ title: "Seller dashboard — Frashion" }] }),
  component: SellerDashboard,
});

const MOCK_ORDERS = [
  { id: "FR-24098", customer: "L. van Rensburg", city: "Cape Town", items: 2, total: 5730, status: "New", date: "Today" },
  { id: "FR-24097", customer: "N. Mbatha",       city: "Johannesburg", items: 1, total: 2890, status: "Packed", date: "Today" },
  { id: "FR-24096", customer: "T. Molefe",       city: "Pretoria", items: 3, total: 8940, status: "Shipped", date: "Yesterday" },
  { id: "FR-24094", customer: "S. Adams",        city: "Durban", items: 1, total: 4200, status: "Delivered", date: "2 days ago" },
];

type Tab = "overview" | "products" | "orders" | "earnings" | "settings";

function SellerDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const products = PRODUCTS.filter(p => p.brandSlug === "maison-noir" || p.brandSlug === "isilo-atelier");
  const grossSales = 148_320;
  const commission = grossSales * 0.1;
  const net = grossSales - commission;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-border p-6 md:min-h-screen">
          <Link to="/" className="font-display text-2xl block mb-10">Frashion</Link>
          <div className="mb-6">
            <div className="eyebrow mb-2">Seller</div>
            <div className="font-medium">Maison Noir</div>
            <div className="text-xs text-muted-foreground">Cape Town · Verified</div>
          </div>
          <nav className="space-y-1 text-sm">
            {([
              ["overview", LayoutGrid, "Overview"],
              ["products", Package, "Products"],
              ["orders", ShoppingBag, "Orders"],
              ["earnings", TrendingUp, "Earnings"],
              ["settings", Settings, "Settings"],
            ] as const).map(([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${tab === key ? "bg-foreground text-background" : "hover:bg-secondary"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
          <Link to="/" className="mt-10 flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </Link>
        </aside>

        {/* Main */}
        <main className="p-8 md:p-12">
          {tab === "overview" && (
            <>
              <div className="eyebrow mb-3">Dashboard</div>
              <h1 className="font-display text-5xl mb-10">Welcome back, Maison Noir.</h1>
              <div className="grid gap-4 md:grid-cols-4 mb-12">
                {[
                  ["Gross sales", formatZAR(grossSales), "+12% vs last month"],
                  ["Net earnings", formatZAR(net), "After 10% platform fee"],
                  ["Orders", "42", "8 pending fulfilment"],
                  ["Products", `${products.length}`, "2 low on stock"],
                ].map(([l, v, s]) => (
                  <div key={l} className="border border-border p-6">
                    <div className="eyebrow mb-3">{l}</div>
                    <div className="font-display text-3xl">{v}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{s}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-10 md:grid-cols-3">
                <div className="md:col-span-2 border border-border">
                  <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div className="eyebrow">Recent orders</div>
                    <button onClick={() => setTab("orders")} className="text-[11px] uppercase tracking-widest underline underline-offset-4">View all</button>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {MOCK_ORDERS.map(o => (
                        <tr key={o.id} className="border-b border-border last:border-0">
                          <td className="px-6 py-4">{o.id}</td>
                          <td className="px-6 py-4">{o.customer}</td>
                          <td className="px-6 py-4">{formatZAR(o.total)}</td>
                          <td className="px-6 py-4"><StatusPill s={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border border-border p-6">
                  <div className="eyebrow mb-4">Next payout</div>
                  <div className="font-display text-4xl">{formatZAR(net)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Estimated · Friday</div>
                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Gross</span><span>{formatZAR(grossSales)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Platform fee (10%)</span><span>−{formatZAR(commission)}</span></div>
                    <div className="flex justify-between border-t border-border pt-2"><span>You receive</span><span>{formatZAR(net)}</span></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "products" && (
            <>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="eyebrow mb-3">Catalogue</div>
                  <h1 className="font-display text-4xl">Products</h1>
                </div>
                <button className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-[11px] uppercase tracking-widest text-background">
                  <Plus className="h-3.5 w-3.5" /> New product
                </button>
              </div>
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input placeholder="Search products" className="w-full bg-transparent text-sm outline-none" />
              </div>
              <div className="border border-border">
                <div className="grid grid-cols-[80px_1fr_120px_100px_120px_80px] items-center gap-4 border-b border-border px-4 py-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <div></div><div>Product</div><div>Price</div><div>Stock</div><div>Status</div><div></div>
                </div>
                {products.map(p => (
                  <div key={p.id} className="grid grid-cols-[80px_1fr_120px_100px_120px_80px] items-center gap-4 border-b border-border px-4 py-3 last:border-0">
                    <img src={p.image} alt={p.name} className="h-16 w-14 object-cover" />
                    <div>
                      <div className="text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.category}</div>
                    </div>
                    <div className="text-sm">{formatZAR(p.price)}</div>
                    <div className={`text-sm ${p.stock < 8 ? "text-destructive" : ""}`}>{p.stock}</div>
                    <div><StatusPill s={p.stock > 0 ? "Live" : "Sold out"} /></div>
                    <button className="text-xs uppercase tracking-widest underline underline-offset-4">Edit</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "orders" && (
            <>
              <div className="eyebrow mb-3">Fulfilment</div>
              <h1 className="font-display text-4xl mb-10">Orders</h1>
              <div className="border border-border">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_140px] gap-4 border-b border-border px-6 py-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <div>Order</div><div>Customer</div><div>City</div><div>Total</div><div>Status</div><div>Action</div>
                </div>
                {MOCK_ORDERS.map(o => (
                  <div key={o.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_140px] gap-4 border-b border-border px-6 py-4 last:border-0 text-sm">
                    <div>{o.id}<div className="text-xs text-muted-foreground">{o.date}</div></div>
                    <div>{o.customer}</div>
                    <div>{o.city}</div>
                    <div>{formatZAR(o.total)}</div>
                    <div><StatusPill s={o.status} /></div>
                    <button className="text-xs uppercase tracking-widest underline underline-offset-4 text-left">
                      {o.status === "New" ? "Mark packed" : o.status === "Packed" ? "Mark shipped" : "Details"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "earnings" && (
            <>
              <div className="eyebrow mb-3">Payouts</div>
              <h1 className="font-display text-4xl mb-10">Earnings</h1>
              <div className="grid gap-4 md:grid-cols-3 mb-12">
                <StatBox l="Lifetime gross" v={formatZAR(524_890)} />
                <StatBox l="Platform fees" v={`−${formatZAR(52_489)}`} />
                <StatBox l="Paid out to you" v={formatZAR(472_401)} highlight />
              </div>
              <div className="border border-border">
                <div className="border-b border-border px-6 py-4 eyebrow">Recent payouts</div>
                {[
                  ["Jul 5, 2026", formatZAR(23_400), "Paid"],
                  ["Jun 28, 2026", formatZAR(18_920), "Paid"],
                  ["Jun 21, 2026", formatZAR(31_140), "Paid"],
                  ["Jun 14, 2026", formatZAR(15_670), "Paid"],
                ].map(([d, a, s]) => (
                  <div key={d} className="flex items-center justify-between border-b border-border px-6 py-3 last:border-0 text-sm">
                    <div>{d}</div><div>{a}</div><StatusPill s={s} />
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "settings" && (
            <>
              <div className="eyebrow mb-3">Storefront</div>
              <h1 className="font-display text-4xl mb-10">Settings</h1>
              <div className="max-w-xl space-y-6">
                <Field label="Brand name" value="Maison Noir" />
                <Field label="Tagline" value="Tailored essentials, made in Cape Town." />
                <Field label="Location" value="Cape Town, ZA" />
                <Field label="Payout email" value="payouts@maisonnoir.co.za" />
                <button className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background">Save changes</button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    New: "bg-accent/40 text-foreground",
    Packed: "bg-secondary text-foreground",
    Shipped: "bg-foreground text-background",
    Delivered: "border border-border text-muted-foreground",
    Paid: "border border-border text-muted-foreground",
    Live: "bg-foreground text-background",
    "Sold out": "border border-destructive text-destructive",
  };
  return <span className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-widest ${map[s] ?? "border border-border"}`}>{s}</span>;
}

function StatBox({ l, v, highlight }: { l: string; v: string; highlight?: boolean }) {
  return (
    <div className={`border p-6 ${highlight ? "border-foreground bg-foreground text-background" : "border-border"}`}>
      <div className={`eyebrow mb-3 ${highlight ? "text-background/60" : ""}`}>{l}</div>
      <div className="font-display text-3xl">{v}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <div className="eyebrow mb-2">{label}</div>
      <input defaultValue={value} className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
