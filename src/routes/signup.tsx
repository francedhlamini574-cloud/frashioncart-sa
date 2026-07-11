import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth, type Role } from "@/lib/auth-store";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — FrashionCart S.A" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("customer");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    brandName: "", brandTagline: "", brandLocation: "",
  });
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "brand" && !form.brandName) return setError("Brand name is required.");
    const res = signup({
      firstName: form.firstName, lastName: form.lastName,
      email: form.email, password: form.password, role,
      brandName: role === "brand" ? form.brandName : undefined,
      brandTagline: role === "brand" ? form.brandTagline : undefined,
      brandLocation: role === "brand" ? form.brandLocation : undefined,
    });
    if (!res.ok) return setError(res.error);
    navigate({ to: role === "brand" ? "/seller" : "/account" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-lg px-6 py-16">
        <div className="eyebrow mb-3">Join FrashionCart S.A</div>
        <h1 className="font-display text-5xl mb-8">Create account.</h1>

        <div className="mb-8 grid grid-cols-2 gap-0 border border-border">
          {(["customer", "brand"] as Role[]).map(r => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`py-4 text-[11px] uppercase tracking-widest ${role === r ? "bg-foreground text-background" : "hover:bg-secondary"}`}>
              {r === "customer" ? "I'm a shopper" : "I'm a brand"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" value={form.firstName} onChange={set("firstName")} required />
            <Input label="Last name" value={form.lastName} onChange={set("lastName")} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={set("email")} required />
          <Input label="Password" type="password" value={form.password} onChange={set("password")} required />

          {role === "brand" && (
            <div className="mt-8 space-y-5 border-t border-border pt-6">
              <div className="eyebrow">Your label</div>
              <Input label="Brand name" value={form.brandName} onChange={set("brandName")} required />
              <Input label="Tagline" value={form.brandTagline} onChange={set("brandTagline")} placeholder="Tailored essentials, made in Cape Town." />
              <Input label="Location" value={form.brandLocation} onChange={set("brandLocation")} placeholder="Cape Town, ZA" />
            </div>
          )}

          {error && <div className="text-xs text-destructive">{error}</div>}
          <button type="submit" className="w-full bg-foreground py-4 text-[11px] tracking-[0.2em] uppercase text-background">
            Create {role === "brand" ? "brand account" : "account"}
          </button>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="border-b border-foreground pb-0.5 text-foreground">Sign in</Link>
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="eyebrow mb-2">{label}</div>
      <input {...props} className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
