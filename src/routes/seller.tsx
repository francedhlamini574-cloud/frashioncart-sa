import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatZAR, CATEGORIES, type Product } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";
import { useProducts } from "@/lib/products-store";
import { LayoutGrid, Package, ShoppingBag, TrendingUp, Settings, LogOut, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/seller")({
  head: () => ({ meta: [{ title: "Seller dashboard — FrashionCart S.A" }] }),
  component: SellerDashboard,
});

type Tab = "overview" | "products" | "orders" | "earnings" | "settings";

const MOCK_ORDERS = [
  { id: "FR-24098", customer: "L. van Rensburg", city: "Cape Town", items: 2, total: 5730, status: "New", date: "Today" },
  { id: "FR-24097", customer: "N. Mbatha", city: "Johannesburg", items: 1, total: 2890, status: "Packed", date: "Today" },
  { id: "FR-24096", customer: "T. Molefe", city: "Pretoria", items: 3, total: 8940, status: "Shipped", date: "Yesterday" },
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function SellerDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const { byBrandOwner, addProduct, updateProduct, removeProduct } = useProducts();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem("frashioncart.session")) navigate({ to: "/login" });
    }, 50);
    return () => clearTimeout(t);
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-3xl mb-4">Brand sign-in required</h1>
          <Link to="/login" className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background inline-block">Sign in</Link>
        </div>
      </div>
    );
  }

  if (user.role !== "brand") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <div className="eyebrow mb-3">Seller area</div>
          <h1 className="font-display text-3xl mb-4">This section is for brand accounts.</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign up as a brand to list and price your products on FrashionCart S.A.</p>
          <div className="flex justify-center gap-3">
            <Link to="/signup" className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background">Create brand account</Link>
            <Link to="/account" className="border border-border px-6 py-3 text-[11px] uppercase tracking-widest">My account</Link>
          </div>
        </div>
      </div>
    );
  }

  const products = byBrandOwner(user.id);
  const grossSales = products.reduce((s, p) => s + p.price * Math.max(0, 24 - p.stock), 0);
  const commission = grossSales * 0.1;
  const net = grossSales - commission;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid md:grid-cols-[240px_1fr]">
        <aside className="border-r border-border p-6 md:min-h-screen">
          <Link to="/" className="font-display text-xl block mb-8">FrashionCart <span className="text-muted-foreground">S.A</span></Link>
          <div className="mb-6">
            <div className="eyebrow mb-2">Brand</div>
            <div className="font-medium">{user.brandName}</div>
            <div className="text-xs text-muted-foreground">{user.brandLocation || "South Africa"}</div>
          </div>
          <nav className="space-y-1 text-sm">
            {([
              ["overview", LayoutGrid, "Overview"],
              ["products", Package, "Products"],
              ["orders", ShoppingBag, "Orders"],
              ["earnings", TrendingUp, "Earnings"],
              ["settings", Settings, "Settings"],
            ] as const).map(([key, Icon, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left ${tab === key ? "bg-foreground text-background" : "hover:bg-secondary"}`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
          <button onClick={() => { logout(); navigate({ to: "/" }); }}
            className="mt-10 flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <main className="p-8 md:p-12">
          {tab === "overview" && (
            <>
              <div className="eyebrow mb-3">Dashboard</div>
              <h1 className="font-display text-5xl mb-10">Welcome back, {user.brandName}.</h1>
              <div className="grid gap-4 md:grid-cols-4 mb-12">
                <StatCard l="Products listed" v={String(products.length)} s="Active on marketplace" />
                <StatCard l="Est. gross sales" v={formatZAR(grossSales)} s="Simulated demo data" />
                <StatCard l="Net earnings" v={formatZAR(net)} s="After 10% platform fee" />
                <StatCard l="Orders (demo)" v="42" s="8 pending fulfilment" />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 border border-border p-6">
                  <div className="eyebrow mb-4">Get started</div>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3"><span className="font-display text-lg">01</span> Add your first product with a photo, price and stock quantity.</li>
                    <li className="flex items-start gap-3"><span className="font-display text-lg">02</span> Customise your brand settings — tagline, location, payout details.</li>
                    <li className="flex items-start gap-3"><span className="font-display text-lg">03</span> Share your storefront and start receiving orders across South Africa.</li>
                  </ol>
                  <button onClick={() => setTab("products")} className="mt-6 inline-flex items-center gap-2 bg-foreground px-5 py-3 text-[11px] uppercase tracking-widest text-background">
                    <Plus className="h-3.5 w-3.5" /> Add a product
                  </button>
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
            <ProductsTab
              brandName={user.brandName!}
              ownerId={user.id}
              products={products}
              onAdd={(p) => addProduct({
                ...p,
                brand: user.brandName!,
                brandSlug: slugify(user.brandName!),
                ownerId: user.id,
              })}
              onUpdate={updateProduct}
              onRemove={removeProduct}
            />
          )}

          {tab === "orders" && (
            <>
              <div className="eyebrow mb-3">Fulfilment</div>
              <h1 className="font-display text-4xl mb-10">Orders</h1>
              <div className="border border-border">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_120px] gap-4 border-b border-border px-6 py-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <div>Order</div><div>Customer</div><div>City</div><div>Total</div><div>Status</div>
                </div>
                {MOCK_ORDERS.map(o => (
                  <div key={o.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_120px] gap-4 border-b border-border px-6 py-4 last:border-0 text-sm">
                    <div>{o.id}<div className="text-xs text-muted-foreground">{o.date}</div></div>
                    <div>{o.customer}</div>
                    <div>{o.city}</div>
                    <div>{formatZAR(o.total)}</div>
                    <div className="text-xs uppercase tracking-widest">{o.status}</div>
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
                <StatCard l="Lifetime gross" v={formatZAR(grossSales)} s="From your listings" />
                <StatCard l="Platform fees" v={`−${formatZAR(commission)}`} s="10% commission" />
                <StatCard l="Paid out to you" v={formatZAR(net)} s="Weekly cadence" highlight />
              </div>
              <div className="border border-border p-6 text-sm text-muted-foreground">
                Payouts are processed every Friday to your linked South African bank account.
              </div>
            </>
          )}

          {tab === "settings" && (
            <SettingsTab
              initial={{
                brandName: user.brandName ?? "",
                brandTagline: user.brandTagline ?? "",
                brandLocation: user.brandLocation ?? "",
              }}
              onSave={(v) => updateProfile(v)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ l, v, s, highlight }: { l: string; v: string; s: string; highlight?: boolean }) {
  return (
    <div className={`p-6 border ${highlight ? "bg-foreground text-background border-foreground" : "border-border"}`}>
      <div className={`eyebrow mb-3 ${highlight ? "text-background/60" : ""}`}>{l}</div>
      <div className="font-display text-3xl">{v}</div>
      <div className={`mt-2 text-xs ${highlight ? "text-background/60" : "text-muted-foreground"}`}>{s}</div>
    </div>
  );
}

type NewProductInput = {
  name: string; price: number; category: string; stock: number; description: string; image?: string;
};

function ProductsTab({
  brandName, products, onAdd, onUpdate, onRemove,
}: {
  brandName: string;
  ownerId: string;
  products: Product[];
  onAdd: (p: NewProductInput) => void;
  onUpdate: (id: string, patch: Partial<Product>) => void;
  onRemove: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(products.length === 0);
  const [form, setForm] = useState({
    name: "", price: "", category: CATEGORIES[0] as string, stock: "10", description: "", image: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (!form.name || !price || price <= 0) return;
    onAdd({ name: form.name, price, category: form.category, stock: isNaN(stock) ? 0 : stock, description: form.description, image: form.image });
    setForm({ name: "", price: "", category: CATEGORIES[0], stock: "10", description: "", image: "" });
    setShowForm(false);
  };

  return (
    <>
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="eyebrow mb-3">Catalogue · {brandName}</div>
          <h1 className="font-display text-4xl">Products</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-[11px] uppercase tracking-widest text-background">
          <Plus className="h-3.5 w-3.5" /> {showForm ? "Cancel" : "New product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-10 border border-border p-6 grid gap-5 md:grid-cols-[220px_1fr]">
          <div>
            <div className="eyebrow mb-2">Product image</div>
            <label className="block aspect-[3/4] border border-dashed border-border overflow-hidden cursor-pointer bg-muted">
              {form.image ? (
                <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground text-center px-4">
                  Click to upload<br />JPG or PNG
                </div>
              )}
              <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            </label>
          </div>
          <div className="space-y-4">
            <Field label="Product name" value={form.name} onChange={set("name")} required placeholder="Ivory Cashmere Knit" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (ZAR)" value={form.price} onChange={set("price")} required type="number" min="0" placeholder="2890" />
              <Field label="Stock" value={form.stock} onChange={set("stock")} type="number" min="0" />
            </div>
            <label className="block">
              <div className="eyebrow mb-2">Category</div>
              <select value={form.category} onChange={set("category")}
                className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="block">
              <div className="eyebrow mb-2">Description</div>
              <textarea value={form.description} onChange={set("description")} rows={3}
                className="w-full border border-border bg-transparent p-3 text-sm outline-none focus:border-foreground" />
            </label>
            <button type="submit" className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background">
              Publish product
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="border border-dashed border-border py-20 text-center">
          <Package className="h-6 w-6 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No products yet. Add your first piece to start selling.</p>
        </div>
      ) : (
        <div className="border border-border">
          <div className="grid grid-cols-[80px_1fr_140px_100px_120px_80px] items-center gap-4 border-b border-border px-4 py-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div></div><div>Product</div><div>Price</div><div>Stock</div><div>Category</div><div></div>
          </div>
          {products.map(p => (
            <div key={p.id} className="grid grid-cols-[80px_1fr_140px_100px_120px_80px] items-center gap-4 border-b border-border px-4 py-3 last:border-0">
              <img src={p.image} alt={p.name} className="h-16 w-14 object-cover" />
              <div>
                <div className="text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
              </div>
              <input defaultValue={String(p.price)} type="number"
                onBlur={e => onUpdate(p.id, { price: parseFloat(e.target.value) || p.price })}
                className="border-b border-border bg-transparent py-1 text-sm outline-none focus:border-foreground" />
              <input defaultValue={String(p.stock)} type="number"
                onBlur={e => onUpdate(p.id, { stock: parseInt(e.target.value, 10) || 0 })}
                className="border-b border-border bg-transparent py-1 text-sm outline-none focus:border-foreground w-16" />
              <div className="text-xs text-muted-foreground">{p.category}</div>
              <button onClick={() => onRemove(p.id)} aria-label="Delete" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function SettingsTab({
  initial, onSave,
}: {
  initial: { brandName: string; brandTagline: string; brandLocation: string };
  onSave: (v: { brandName: string; brandTagline: string; brandLocation: string }) => void;
}) {
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <div className="eyebrow mb-3">Storefront</div>
      <h1 className="font-display text-4xl mb-10">Settings</h1>
      <form onSubmit={(e) => { e.preventDefault(); onSave(v); setSaved(true); setTimeout(() => setSaved(false), 1600); }}
        className="max-w-xl space-y-6">
        <Field label="Brand name" value={v.brandName} onChange={e => setV({ ...v, brandName: e.target.value })} />
        <Field label="Tagline" value={v.brandTagline} onChange={e => setV({ ...v, brandTagline: e.target.value })} />
        <Field label="Location" value={v.brandLocation} onChange={e => setV({ ...v, brandLocation: e.target.value })} />
        <button className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background">
          {saved ? "Saved" : "Save changes"}
        </button>
      </form>
    </>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="eyebrow mb-2">{label}</div>
      <input {...props} className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
