import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { formatZAR, CATEGORIES, GENDERS, sizePresetFor, type Product, type Gender, type ProductColor } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";
import { useProducts } from "@/lib/products-store";
import { productSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { RequireRole } from "@/components/require-role";
import { LayoutGrid, Package, ShoppingBag, TrendingUp, Settings, LogOut, Plus, Trash2 } from "lucide-react";
import { Wordmark } from "@/components/wordmark";

export const Route = createFileRoute("/seller")({
  head: () => ({ meta: [{ title: "Seller dashboard — FrashionCart S.A" }] }),
  component: () => <RequireRole roles={["brand"]}><SellerDashboard /></RequireRole>,
});

type Tab = "overview" | "products" | "orders" | "earnings" | "settings";

const MOCK_ORDERS = [
  { id: "FR-24098", customer: "L. van Rensburg", city: "Cape Town", items: 2, total: 5730, status: "New", date: "Today" },
  { id: "FR-24097", customer: "N. Mbatha", city: "Johannesburg", items: 1, total: 2890, status: "Packed", date: "Today" },
  { id: "FR-24096", customer: "T. Molefe", city: "Pretoria", items: 3, total: 8940, status: "Shipped", date: "Yesterday" },
];

const PRESET_COLORS: ProductColor[] = [
  { name: "Black", hex: "#1a1614" },
  { name: "Cream", hex: "#f2ead6" },
  { name: "Bone", hex: "#e6dfd0" },
  { name: "Caramel", hex: "#b98a5a" },
  { name: "Gold", hex: "#c9a15a" },
  { name: "Olive", hex: "#5b6b3a" },
  { name: "Navy", hex: "#1c2b45" },
  { name: "Rust", hex: "#a24a2a" },
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function SellerDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const { byBrandOwner, addProduct, updateProduct, removeProduct } = useProducts();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  if (!user) return null;

  const products = byBrandOwner(user.id);
  const grossSales = products.reduce((s, p) => s + p.price * Math.max(0, 24 - p.stock), 0);
  const commission = grossSales * 0.1;
  const net = grossSales - commission;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid md:grid-cols-[240px_1fr]">
        <aside className="border-r border-border p-6 md:min-h-screen">
          <Link to="/" className="block mb-8"><Wordmark size="sm" /></Link>
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
                    <li className="flex items-start gap-3"><span className="font-display text-lg">01</span> Add your first product with sizes, colours and stock.</li>
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
  name: string;
  price: number;
  category: string;
  gender: Gender;
  stock: number;
  sizes: string[];
  colors: ProductColor[];
  discountPct?: number;
  description: string;
  image: string;
};

function ProductsTab({
  brandName, products, onAdd, onUpdate, onRemove,
}: {
  brandName: string;
  products: Product[];
  onAdd: (p: NewProductInput) => void;
  onUpdate: (id: string, patch: Partial<Product>) => void;
  onRemove: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(products.length === 0);
  const initialCategory = CATEGORIES[0];
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: initialCategory as string,
    gender: "Women" as Gender,
    stock: "10",
    description: "",
    image: "",
    discountPct: "",
    sizes: [] as string[],
    colors: [] as ProductColor[],
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const availableSizes = sizePresetFor(form.category);

  const set = <K extends keyof typeof form>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value as (typeof f)[K] }));

  const toggleSize = (s: string) => setForm(f => ({
    ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s],
  }));
  const toggleColor = (c: ProductColor) => setForm(f => ({
    ...f, colors: f.colors.some(x => x.name === c.name) ? f.colors.filter(x => x.name !== c.name) : [...f.colors, c],
  }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setErrors(er => ({ ...er, image: "Image must be under 4MB." })); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      price: form.price,
      category: form.category,
      gender: form.gender,
      stock: form.stock,
      sizes: form.sizes.length ? form.sizes : (availableSizes.length === 1 ? availableSizes : []),
      colors: form.colors,
      discountPct: form.discountPct === "" ? undefined : form.discountPct,
      description: form.description,
      image: form.image || undefined,
    };
    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) return setErrors(toFieldErrors(parsed.error));
    setErrors({});
    onAdd({
      name: parsed.data.name,
      price: parsed.data.price,
      category: parsed.data.category,
      gender: parsed.data.gender,
      stock: parsed.data.stock,
      sizes: parsed.data.sizes,
      colors: parsed.data.colors,
      discountPct: parsed.data.discountPct,
      description: parsed.data.description ?? "",
      image: parsed.data.image ?? "",
    });
    setForm({
      name: "", price: "", category: initialCategory, gender: "Women", stock: "10",
      description: "", image: "", discountPct: "", sizes: [], colors: [],
    });
    setShowForm(false);
  };

  return (
    <>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
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
        <form onSubmit={submit} className="mb-10 border border-border p-6 grid gap-6 md:grid-cols-[240px_1fr]" noValidate>
          <div>
            <div className="eyebrow mb-2">Product image</div>
            <label className="block aspect-[3/4] border border-dashed border-border overflow-hidden cursor-pointer bg-muted">
              {form.image ? (
                <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground text-center px-4">
                  Click to upload<br />JPG or PNG · max 4MB
                </div>
              )}
              <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            </label>
            {errors.image && <div className="mt-2 text-xs text-destructive">{errors.image}</div>}
          </div>
          <div className="space-y-5">
            <Field label="Product name" value={form.name} onChange={set("name")} required placeholder="Ivory Cashmere Knit" error={errors.name} />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (ZAR)" value={form.price} onChange={set("price")} required type="number" min="0" placeholder="2890" error={errors.price} />
              <Field label="Stock" value={form.stock} onChange={set("stock")} type="number" min="0" error={errors.stock} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <div className="eyebrow mb-2">Category</div>
                <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value, sizes: [] }))}
                  className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <div className="eyebrow mb-2">Gender</div>
                <select value={form.gender} onChange={set("gender")}
                  className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground">
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </label>
            </div>

            <div>
              <div className="eyebrow mb-2">Sizes</div>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map(s => (
                  <button key={s} type="button" onClick={() => toggleSize(s)}
                    className={`border px-3 py-1.5 text-[11px] uppercase tracking-widest ${form.sizes.includes(s) ? "border-foreground bg-foreground text-background" : "border-border"}`}>
                    {s}
                  </button>
                ))}
              </div>
              {errors.sizes && <div className="mt-2 text-xs text-destructive">{errors.sizes}</div>}
            </div>

            <div>
              <div className="eyebrow mb-2">Colours</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map(c => {
                  const active = form.colors.some(x => x.name === c.name);
                  return (
                    <button key={c.name} type="button" onClick={() => toggleColor(c)}
                      className={`flex items-center gap-2 border px-2.5 py-1.5 text-[11px] uppercase tracking-widest ${active ? "border-foreground bg-foreground text-background" : "border-border"}`}>
                      <span className="inline-block h-3 w-3 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  );
                })}
              </div>
              {errors.colors && <div className="mt-2 text-xs text-destructive">{errors.colors}</div>}
            </div>

            <Field label="Discount %" value={form.discountPct} onChange={set("discountPct")} type="number" min="0" max="90" placeholder="0" error={errors.discountPct} />

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
        <div className="border border-border overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-[80px_1fr_140px_100px_120px_80px] items-center gap-4 border-b border-border px-4 py-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div></div><div>Product</div><div>Price</div><div>Stock</div><div>Category</div><div></div>
          </div>
          {products.map(p => (
            <div key={p.id} className="grid min-w-[720px] grid-cols-[80px_1fr_140px_100px_120px_80px] items-center gap-4 border-b border-border px-4 py-3 last:border-0">
              <img src={p.image} alt={p.name} className="h-16 w-14 object-cover" />
              <div className="min-w-0">
                <div className="text-sm truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{p.gender} · {p.sizes.length} sizes · {p.colors.length} colours</div>
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
          {saved ? "Saved ✓" : "Save changes"}
        </button>
      </form>
    </>
  );
}

function Field({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="eyebrow mb-2">{label}</div>
      <input {...props} aria-invalid={!!error} className={`w-full border-b bg-transparent py-2 text-sm outline-none focus:border-foreground ${error ? "border-destructive" : "border-border"}`} />
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </label>
  );
}
