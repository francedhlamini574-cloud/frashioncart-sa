import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/lib/auth-store";
import { loginSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FrashionCart S.A" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, users } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) return setErrors(toFieldErrors(parsed.error));
    setErrors({});
    setPending(true);
    // Simulate async
    setTimeout(() => {
      const res = login(parsed.data.email, parsed.data.password);
      setPending(false);
      if (!res.ok) return setErrors({ _form: res.error });
      const found = users.find(u => u.email === parsed.data.email);
      navigate({ to: found?.role === "brand" ? "/seller" : "/account" });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto grid max-w-md px-6 py-20">
        <div className="eyebrow mb-3">Welcome back</div>
        <h1 className="font-display text-5xl mb-10">Sign in.</h1>
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <Field label="Email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
          <Field label="Password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
          {errors._form && <div role="alert" className="text-xs text-destructive">{errors._form}</div>}
          <button type="submit" disabled={pending} className="w-full bg-foreground py-4 text-[11px] tracking-[0.2em] uppercase text-background disabled:opacity-50">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-8 text-sm text-muted-foreground">
          New to FrashionCart? <Link to="/signup" className="border-b border-foreground pb-0.5 text-foreground">Create an account</Link>
        </p>
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
