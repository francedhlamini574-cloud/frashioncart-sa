import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/403")({
  head: () => ({ meta: [{ title: "Access denied — FrashionCart S.A" }, { name: "robots", content: "noindex" }] }),
  component: Forbidden,
});

function Forbidden() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="eyebrow mb-3">403 · Forbidden</div>
        <h1 className="font-display text-6xl mb-4">Access denied.</h1>
        <p className="text-sm text-muted-foreground mb-8">You don't have permission to view this area.</p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-widest text-background">Home</Link>
          <Link to="/login" className="border border-border px-6 py-3 text-[11px] uppercase tracking-widest">Sign in</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
