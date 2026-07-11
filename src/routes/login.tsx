import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FrashionCart S.A" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) return setError(res.error);
    const raw = localStorage.getItem("frashioncart.users");
    const users = raw ? JSON.parse(raw) : [];
    const found = users.find((u: { email: string }) => u.email === email.trim().toLowerCase());
    navigate({ to: found?.role === "brand" ? "/seller" : "/account" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto grid max-w-md px-6 py-20">
        <div className="eyebrow mb-3">Welcome back</div>
        <h1 className="font-display text-5xl mb-10">Sign in.</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <div className="eyebrow mb-2">Email</div>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground" />
          </div>
          <div>
            <div className="eyebrow mb-2">Password</div>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground" />
          </div>
          {error && <div className="text-xs text-destructive">{error}</div>}
          <button type="submit" className="w-full bg-foreground py-4 text-[11px] tracking-[0.2em] uppercase text-background">Sign in</button>
        </form>
        <p className="mt-8 text-sm text-muted-foreground">
          New to FrashionCart? <Link to="/signup" className="border-b border-foreground pb-0.5 text-foreground">Create an account</Link>
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}
