import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";

const ROLE_HOME: Record<string, string> = {
  brand: "/seller",
  admin: "/admin",
  customer: "/account",
};

function splitName(full: string | undefined) {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

/**
 * "Continue with Google" — managed Lovable Cloud OAuth.
 * On return, the Google identity is bridged into the local account store
 * so the rest of the prototype (roles, addresses, brand data) keeps working.
 */
export function GoogleButton({ className = "" }: { className?: string }) {
  const { signInWithIdentity } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bridge an existing / freshly-returned Google session into the local store.
  useEffect(() => {
    let cancelled = false;

    const bridge = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email || cancelled) return;
      const meta = (data.user?.user_metadata ?? {}) as { full_name?: string; name?: string };
      const { firstName, lastName } = splitName(meta.full_name ?? meta.name);
      const account = signInWithIdentity({ email, firstName, lastName });
      navigate({ to: ROLE_HOME[account.role] ?? "/account" });
    };

    void bridge();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void bridge();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClick = async () => {
    setError(null);
    setPending(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setPending(false);
      setError("We couldn't start Google sign-in. Please try again.");
      return;
    }
    if (result.redirected) return; // browser is navigating to Google
    // Tokens returned in-place — the auth listener above finishes the sign-in.
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-[#D8C5AD] bg-white py-3.5 text-sm text-[#111111] transition-colors duration-300 hover:bg-[#EFE7DA] disabled:opacity-60"
      >
        <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.5 2.4 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.2 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8.4h12.5c-.3 2.1-1.7 5.2-4.9 7.3l7.7 6c4.5-4.2 6.8-10.4 6.8-17.6z" />
          <path fill="#FBBC05" d="M10.5 28.7A14.6 14.6 0 019.7 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.4-8.2 2.4-6.3 0-11.6-3.7-13.5-9l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        {pending ? "Opening Google…" : "Continue with Google"}
      </button>
      {error && (
        <div role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
