import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth, type Role } from "@/lib/auth-store";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

/** Client-side route guard. Redirects unauthenticated users to /login.
 *  Renders a 403 for users with the wrong role. */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <div className="animate-pulse text-sm text-muted-foreground">Loading…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="font-display text-3xl mb-4">Sign in required</h1>
          <p className="text-sm text-muted-foreground mb-6">Please sign in to continue.</p>
          <Link to="/login" className="inline-block bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background">Sign in</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <div className="eyebrow mb-3">403 · Forbidden</div>
          <h1 className="font-display text-5xl mb-4">Access denied.</h1>
          <p className="text-sm text-muted-foreground mb-8">
            This area is reserved for {roles.join(" or ")} accounts.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/" className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background">Home</Link>
            <Link to="/signup" className="border border-border px-6 py-3 text-[11px] uppercase tracking-widest">Create the right account</Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return <>{children}</>;
}
