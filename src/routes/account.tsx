import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth, type Address } from "@/lib/auth-store";
import { addressSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { RequireRole } from "@/components/require-role";
import { MapPin, Plus, Trash2, LogOut } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My account — FrashionCart S.A" }] }),
  component: () => <RequireRole roles={["customer"]}><AccountPage /></RequireRole>,
});

const EMPTY: Omit<Address, "id"> = {
  label: "Home", fullName: "", street: "", suburb: "", city: "", province: "Gauteng", postalCode: "", phone: "",
};

const PROVINCES = ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"];

function AccountPage() {
  const { user, addAddress, removeAddress, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  if (!user) return null;

  const set = <K extends keyof typeof form>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) return setErrors(toFieldErrors(parsed.error));
    setErrors({});
    setPending(true);
    setTimeout(() => {
      addAddress(form);
      setForm(EMPTY);
      setShowForm(false);
      setPending(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-6 py-16 md:px-10">
        <div className="eyebrow mb-3">Account</div>
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <h1 className="font-display text-5xl md:text-6xl">Hello, {user.firstName}.</h1>
          <button onClick={() => { logout(); navigate({ to: "/" }); }}
            className="flex items-center gap-2 text-[11px] uppercase tracking-widest hover:opacity-70">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <div className="border border-border p-6">
              <div className="eyebrow mb-2">Profile</div>
              <div className="text-sm">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              <div className="mt-3 inline-block bg-secondary px-2 py-1 text-[10px] uppercase tracking-widest">Customer</div>
            </div>
            <div className="border border-border p-6">
              <div className="eyebrow mb-3">Quick links</div>
              <div className="space-y-2 text-sm">
                <Link to="/shop" className="block hover:opacity-60">Continue shopping</Link>
                <Link to="/wishlist" className="block hover:opacity-60">My wishlist</Link>
                <Link to="/cart" className="block hover:opacity-60">My bag</Link>
              </div>
            </div>
          </aside>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl">Shipping addresses</h2>
              <button onClick={() => setShowForm(v => !v)}
                className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[11px] uppercase tracking-widest text-background">
                <Plus className="h-3.5 w-3.5" /> {showForm ? "Cancel" : "Add address"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={submit} className="mb-10 border border-border p-6 space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Label (Home, Work…)" value={form.label} onChange={set("label")} error={errors.label} />
                  <Field label="Full name" value={form.fullName} onChange={set("fullName")} required error={errors.fullName} />
                </div>
                <Field label="Street address" value={form.street} onChange={set("street")} required error={errors.street} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Suburb" value={form.suburb} onChange={set("suburb")} error={errors.suburb} />
                  <Field label="City" value={form.city} onChange={set("city")} required error={errors.city} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <div className="eyebrow mb-2">Province</div>
                    <select value={form.province} onChange={set("province")}
                      className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground">
                      {PROVINCES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </label>
                  <Field label="Postal code" value={form.postalCode} onChange={set("postalCode")} required error={errors.postalCode} />
                </div>
                <Field label="Phone" value={form.phone} onChange={set("phone")} required error={errors.phone} />
                <button type="submit" disabled={pending} className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background disabled:opacity-50">
                  {pending ? "Saving…" : "Save address"}
                </button>
              </form>
            )}

            {user.addresses.length === 0 ? (
              <div className="border border-dashed border-border py-16 text-center">
                <MapPin className="h-6 w-6 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No shipping addresses yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {user.addresses.map(a => (
                  <div key={a.id} className="border border-border p-5">
                    <div className="flex items-start justify-between">
                      <div className="eyebrow">{a.label}</div>
                      <button onClick={() => removeAddress(a.id)} aria-label="Remove address"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="mt-3 text-sm">{a.fullName}</div>
                    <div className="text-sm text-muted-foreground">{a.street}</div>
                    <div className="text-sm text-muted-foreground">{a.suburb ? `${a.suburb}, ` : ""}{a.city}, {a.province} {a.postalCode}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{a.phone}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
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
