import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, BadgeCheck, Truck, Instagram, Facebook } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { loginSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { Wordmark } from "@/components/wordmark";
import stillLife from "@/assets/login-stilllife.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — FrashionCart S.A" },
      { name: "description", content: "Sign in to FrashionCart S.A, South Africa's premier marketplace for independent fashion brands." },
      { property: "og:title", content: "Sign in — FrashionCart S.A" },
      { property: "og:description", content: "Independent. Authentic. You. Sign in to South Africa's premier fashion marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

/** Small South African flag, drawn rather than emoji so it renders identically everywhere. */
function SAFlag({ className = "h-3 w-[1.15rem]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 24" className={`${className} shrink-0 rounded-[1px] shadow-sm`} role="img" aria-label="South Africa">
      <rect width="36" height="24" fill="#fff" />
      <path d="M0 0h36v9H0z" fill="#E03C31" />
      <path d="M0 15h36v9H0z" fill="#002395" />
      <path d="M0 9h36v6H0z" fill="#fff" />
      <path d="M0 0l16 12L0 24z" fill="#fff" />
      <path d="M0 2.4l12.8 9.6L0 21.6z" fill="#FFB915" />
      <path d="M0 5.2l9 6.8L0 18.8z" fill="#007A4D" />
      <path d="M9.6 9.6H36v4.8H9.6z" fill="#007A4D" />
    </svg>
  );
}

const ROLE_HOME: Record<string, string> = {
  brand: "/seller",
  admin: "/admin",
  customer: "/account",
};

function LoginPage() {
  const { login, users } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending || success) return; // prevent duplicate submissions
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) return setErrors(toFieldErrors(parsed.error));
    setErrors({});
    setPending(true);
    setTimeout(() => {
      const res = login(parsed.data.email, parsed.data.password);
      setPending(false);
      // Generic message only — never reveal whether the account exists.
      if (!res.ok) return setErrors({ _form: "We couldn't sign you in. Check your details and try again." });
      setSuccess(true);
      const found = users.find(u => u.email === parsed.data.email);
      const to = ROLE_HOME[found?.role ?? "customer"] ?? "/account";
      setTimeout(() => navigate({ to }), 550);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[56fr_44fr]">
      {/* ---------------- LEFT · brand experience ---------------- */}
      <section className="relative isolate overflow-hidden bg-[oklch(0.22_0.012_60)] px-6 py-10 md:px-12 lg:min-h-screen lg:py-14">
        <img
          src={stillLife}
          alt="FrashionCart S.A branded shopping bag, ribboned gift box, folded linen and a protea in a ceramic vase"
          width={1024}
          height={1536}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/80" />

        <div className="relative flex min-h-[22rem] flex-col justify-between gap-10 lg:min-h-[calc(100vh-7rem)]">
          <header className="animate-in fade-in slide-in-from-top-2 duration-700">
            <div className="flex min-w-0 items-center gap-3">
              <Wordmark size="md" className="text-white" />
              <SAFlag />
            </div>
            <p className="mt-4 text-[10px] uppercase leading-relaxed tracking-[0.34em] text-white/75 md:text-[11px]">
              South Africa&apos;s Premier
              <br />
              Fashion Marketplace
            </p>
            <div className="mt-5 h-px w-24 bg-[#B18A45]" />
            <p className="mt-6 max-w-xs font-display text-lg leading-snug text-white/85 md:text-xl">
              Empowering South African fashion brands, creating opportunities and building the future of South African fashion.
            </p>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-3 rounded-md border border-[#B18A45]/45 bg-black/55 p-6 backdrop-blur-sm duration-1000 md:p-8 lg:max-w-md">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#D8C5AD]">
              Empowering South African fashion brands
            </div>
            <p className="mt-4 font-display text-xl leading-snug text-white/90 md:text-2xl">
              &ldquo;We connect authentic brands with customers, creating opportunities and building the future of South African fashion.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- RIGHT · login ---------------- */}
      <section className="flex flex-col bg-[#F8F5EF] dark:bg-background">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-14 md:px-10 md:py-20">
          <div className="animate-in fade-in duration-700">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#B18A45]/70">
              <span className="font-display text-lg tracking-tight text-[#111111] dark:text-foreground">FC</span>
            </div>
            <h1 className="mt-8 text-center font-display text-4xl text-[#111111] dark:text-foreground md:text-5xl">Welcome back</h1>
            <p className="mx-auto mt-3 max-w-[16rem] text-center text-sm leading-relaxed text-muted-foreground">
              Sign in to your FrashionCart account to continue
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="mt-10 space-y-6">
            <label className="block">
              <div className="eyebrow mb-2">Email address</div>
              <input
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                className={`w-full border-b bg-transparent py-2.5 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/60 focus:border-[#B18A45] ${errors.email ? "border-destructive" : "border-[#D8C5AD]"}`}
              />
              {errors.email && <div className="mt-1.5 text-xs text-destructive">{errors.email}</div>}
            </label>

            <label className="block">
              <div className="eyebrow mb-2">Password</div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  className={`w-full border-b bg-transparent py-2.5 pr-10 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/60 focus:border-[#B18A45] ${errors.password ? "border-destructive" : "border-[#D8C5AD]"}`}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <div className="mt-1.5 text-xs text-destructive">{errors.password}</div>}
            </label>

            <div className="flex justify-end">
              <Link to="/signup" className="text-xs tracking-wide text-[#B18A45] transition-opacity hover:opacity-70">
                Forgot password?
              </Link>
            </div>

            {errors._form && (
              <div role="alert" className="animate-in fade-in border-l-2 border-destructive bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {errors._form}
              </div>
            )}
            {success && (
              <div role="status" className="animate-in fade-in border-l-2 border-[#B18A45] bg-[#B18A45]/10 px-3 py-2 text-xs text-[#8a6a33]">
                Signed in — taking you to your dashboard…
              </div>
            )}

            <button
              type="submit"
              disabled={pending || success}
              className="w-full rounded-md bg-[#111111] py-4 text-[11px] uppercase tracking-[0.24em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f1f1f] hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
            >
              {pending ? "Signing in…" : success ? "Success" : "Sign in"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#D8C5AD]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-[#D8C5AD]" />
          </div>

          <button
            type="button"
            onClick={() => setErrors({ _form: "Google sign-in isn't enabled on this account yet." })}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-[#D8C5AD] bg-white py-3.5 text-sm text-[#111111] transition-colors duration-300 hover:bg-[#EFE7DA]"
          >
            <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.5 2.4 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.2 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8.4h12.5c-.3 2.1-1.7 5.2-4.9 7.3l7.7 6c4.5-4.2 6.8-10.4 6.8-17.6z" />
              <path fill="#FBBC05" d="M10.5 28.7A14.6 14.6 0 019.7 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.4-8.2 2.4-6.3 0-11.6-3.7-13.5-9l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="border-b border-[#B18A45] pb-0.5 text-[#B18A45] transition-opacity hover:opacity-70">
              Create an account
            </Link>
          </p>

          {/* subtle SA skyline line-art + tagline */}
          <div className="mt-14">
            <svg viewBox="0 0 320 48" className="mx-auto h-10 w-full max-w-xs text-[#111111] opacity-[0.13] dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <path d="M0 47h320" />
              <path d="M8 47V33h16v14M30 47V26h12v21M48 47V36h10v11M64 47V20h14v27M84 47V29h9v18M99 47V16h11v31M116 47V34h13v13M135 47V22h10v25M151 47V12h8v35M159 12l4-8 4 8M165 47V25h12v22M183 47V31h11v16M200 47V18h13v29M219 47V35h9v12M234 47V24h11v23M251 47V30h14v17M271 47V21h10v26M287 47V37h12v10M305 47V28h9v19" />
            </svg>
            <p className="mt-4 text-center font-display text-xl italic tracking-wide text-[#111111] dark:text-foreground">
              Independent. Authentic. You.
            </p>
          </div>
        </main>

        <footer className="border-t border-[#D8C5AD] px-6 py-6 md:px-10">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
            <div className="text-xs text-muted-foreground">
              www.frashioncart.co.za
              <span className="mx-2 text-[#D8C5AD]">·</span>
              hello@frashioncart.co.za
            </div>
            <div className="flex items-center gap-5 text-muted-foreground">
              <Instagram className="h-4 w-4" aria-label="Instagram" />
              <Facebook className="h-4 w-4" aria-label="Facebook" />
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="TikTok" role="img">
                <path d="M16.6 5.8a5.3 5.3 0 01-3.3-1.2v7.8a4.9 4.9 0 11-4.9-4.9c.3 0 .5 0 .8.1v2.5a2.4 2.4 0 101.7 2.3V2h2.4a5.3 5.3 0 003.3 3.3v2.5z" />
              </svg>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="X" role="img">
                <path d="M18.9 2H22l-6.8 7.8L23 22h-7l-5-6.6L4.8 22H2l7.3-8.3L1.5 2h7.1l4.6 6.1L18.9 2zm-1.2 18h1.7L7.3 3.8H5.5L17.7 20z" />
              </svg>
            </div>
          </div>
        </footer>
      </section>

      {/* ---------------- TRUST BAR ---------------- */}
      <div className="bg-[#111111] px-6 py-6 md:px-10 lg:col-span-2">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
          <Trust icon={<ShieldCheck className="h-5 w-5" strokeWidth={1} />} title="Secure Payments" note="100% Protected" />
          <Trust icon={<BadgeCheck className="h-5 w-5" strokeWidth={1} />} title="Verified Brands" note="Quality You Can Trust" />
          <Trust icon={<Truck className="h-5 w-5" strokeWidth={1} />} title="Complimentary Shipping" note="On Orders Over R1,500" />
          <Trust icon={<SAFlag className="h-3.5 w-[1.3rem]" />} title="Proudly South African" note="Made in Mzansi" />
        </div>
      </div>
    </div>
  );
}

function Trust({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="shrink-0 text-[#B18A45]">{icon}</span>
      <div className="min-w-0">
        <div className="truncate text-[11px] uppercase tracking-[0.18em] text-[#EFE7DA]">{title}</div>
        <div className="truncate text-[11px] text-white/50">{note}</div>
      </div>
    </div>
  );
}
