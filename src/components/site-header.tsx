import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, LogOut } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { useState } from "react";

export function SiteHeader() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);

  const accountLink = user
    ? (user.role === "brand" ? "/seller" as const : "/account" as const)
    : "/login" as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-8">
          <button className="md:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <Link to="/" className="font-display text-xl md:text-2xl tracking-tight whitespace-nowrap">
            FrashionCart <span className="text-muted-foreground">S.A</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[13px]">
            <Link to="/shop" className="hover:opacity-60 transition-opacity">Shop</Link>
            <Link to="/shop" className="hover:opacity-60">Women</Link>
            <Link to="/shop" className="hover:opacity-60">Men</Link>
            <Link to="/shop" className="hover:opacity-60">Accessories</Link>
            <Link to="/sell" className="hover:opacity-60">Sell on FrashionCart</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-[13px]">
          <button aria-label="Search" className="hover:opacity-60"><Search className="h-[18px] w-[18px]" /></button>

          {user ? (
            <div className="relative">
              <button onClick={() => setMenu(v => !v)} className="flex items-center gap-2 hover:opacity-60">
                <div className="hidden md:block h-7 w-7 rounded-full bg-foreground text-background text-[11px] uppercase flex items-center justify-center leading-7 text-center">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <User className="h-[18px] w-[18px] md:hidden" />
              </button>
              {menu && (
                <div className="absolute right-0 mt-3 w-56 border border-border bg-background shadow-lg">
                  <div className="border-b border-border px-4 py-3">
                    <div className="text-sm">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    <div className="mt-2 inline-block bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-widest">
                      {user.role === "brand" ? user.brandName ?? "Brand" : "Customer"}
                    </div>
                  </div>
                  <Link to={accountLink} onClick={() => setMenu(false)}
                    className="block px-4 py-2.5 text-sm hover:bg-secondary">
                    {user.role === "brand" ? "Seller dashboard" : "My account"}
                  </Link>
                  <Link to="/cart" onClick={() => setMenu(false)} className="block px-4 py-2.5 text-sm hover:bg-secondary">My bag</Link>
                  <button onClick={() => { logout(); setMenu(false); }}
                    className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm hover:bg-secondary">
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden md:inline text-[11px] tracking-[0.2em] uppercase border-b border-foreground pb-0.5">
              Sign in
            </Link>
          )}

          <Link to="/cart" className="relative hover:opacity-60" aria-label="Bag">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1 min-w-[16px] rounded-full bg-foreground px-1 text-center text-[10px] leading-4 text-background">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
