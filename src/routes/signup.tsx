import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth, type Role } from "@/lib/auth-store";
import { signupSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const parsed = signupSchema.safeParse({ ...form, role });
    if (!parsed.success) return setErrors(toFieldErrors(parsed.error));
    setErrors({});
    setPending(true);
    setTimeout(() => {
      const res = signup({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        password: parsed.data.password,
        role,
        brandName: role === "brand" ? parsed.data.brandName : undefined,
        brandTagline: role === "brand" ? parsed.data.brandTagline : undefined,
        brandLocation: role === "brand" ? parsed.data.brandLocation : undefined,
      });
      setPending(false);
      if (!res.ok) return setErrors({ _form: res.error });
      navigate({ to: role === "brand" ? "/seller" : "/account" });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-16">
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

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" required error={errors.firstName} />
            <Input label="Last name" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" required error={errors.lastName} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" required error={errors.email} />
          <Input label="Password" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" required error={errors.password} />
          <p className="text-[11px] text-muted-foreground">Minimum 8 characters with at least one letter and one number.</p>

          {role === "brand" && (
            <div className="mt-8 space-y-5 border-t border-border pt-6">
              <div className="eyebrow">Your label</div>
              <Input label="Brand name" value={form.brandName} onChange={set("brandName")} required error={errors.brandName} />
              <Input label="Tagline" value={form.brandTagline} onChange={set("brandTagline")} placeholder="Tailored essentials, made in Cape Town." error={errors.brandTagline} />
              <Input label="Location" value={form.brandLocation} onChange={set("brandLocation")} placeholder="Cape Town, ZA" error={errors.brandLocation} />
            </div>
          )}

          {errors._form && <div role="alert" className="text-xs text-destructive">{errors._form}</div>}
          <button type="submit" disabled={pending} className="w-full bg-foreground py-4 text-[11px] tracking-[0.2em] uppercase text-background disabled:opacity-50">
            {pending ? "Creating…" : `Create ${role === "brand" ? "brand account" : "account"}`}
          </button>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="border-b border-foreground pb-0.5 text-foreground">Sign in</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function Input({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="eyebrow mb-2">{label}</div>
      <input {...props} aria-invalid={!!error} className={`w-full border-b bg-transparent py-2 text-sm outline-none focus:border-foreground ${error ? "border-destructive" : "border-border"}`} />
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </label>
  );
}
