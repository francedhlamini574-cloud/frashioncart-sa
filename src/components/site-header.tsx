import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, LogOut, Heart, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { count: wishCount } = useWishlist();
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const accountLink = user
    ? (user.role === "brand" ? "/seller" as const : "/account" as const)
    : "/login" as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-8 min-w-0">
          <button className="md:hidden -ml-1 p-1" aria-label="Open menu" onClick={() => setMobile(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Wordmark />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[13px]" aria-label="Primary">
            <Link to="/shop" className="hover:opacity-60 transition-opacity">Shop</Link>
            <Link to="/shop" hash="women" className="hover:opacity-60">Women</Link>
            <Link to="/shop" hash="men" className="hover:opacity-60">Men</Link>
            <Link to="/shop" hash="unisex" className="hover:opacity-60">Unisex</Link>
            <Link to="/brands" className="hover:opacity-60">Brands</Link>
            <Link to="/sell" className="hover:opacity-60">Sell</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-[13px]">
          <button aria-label="Search" className="hover:opacity-60"><Search className="h-[18px] w-[18px]" /></button>

          <Link to="/wishlist" aria-label={`Wishlist${wishCount ? ` (${wishCount})` : ""}`} className="relative hover:opacity-60 hidden sm:inline-flex">
            <Heart className="h-[18px] w-[18px]" />
            {wishCount > 0 && (
              <span className="absolute -right-2 -top-1 min-w-[16px] rounded-full bg-foreground px-1 text-center text-[10px] leading-4 text-background">{wishCount}</span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenu(v => !v)} className="flex items-center gap-2 hover:opacity-60" aria-label="Account menu" aria-expanded={menu}>
                <div className="hidden md:grid h-7 w-7 place-items-center rounded-full bg-foreground text-background text-[11px] uppercase leading-none">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <User className="h-[18px] w-[18px] md:hidden" />
              </button>
              {menu && (
                <div className="absolute right-0 mt-3 w-60 border border-border bg-background shadow-lg" role="menu">
                  <div className="border-b border-border px-4 py-3">
                    <div className="text-sm">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    <div className="mt-2 inline-block bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-widest">
                      {user.role === "brand" ? user.brandName ?? "Brand" : "Customer"}
                    </div>
                  </div>
                  <Link to={accountLink} onClick={() => setMenu(false)} className="block px-4 py-2.5 text-sm hover:bg-secondary">
                    {user.role === "brand" ? "Seller dashboard" : "My account"}
                  </Link>
                  <Link to="/wishlist" onClick={() => setMenu(false)} className="block px-4 py-2.5 text-sm hover:bg-secondary">Wishlist</Link>
                  <Link to="/cart" onClick={() => setMenu(false)} className="block px-4 py-2.5 text-sm hover:bg-secondary">My bag</Link>
                  <button onClick={() => { logout(); setMenu(false); }} className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm hover:bg-secondary">
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

          <Link to="/cart" className="relative hover:opacity-60" aria-label={`Bag${count ? ` (${count})` : ""}`}>
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1 min-w-[16px] rounded-full bg-foreground px-1 text-center text-[10px] leading-4 text-background">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobile && (
        <div className="fixed inset-0 z-50 bg-foreground/40 md:hidden" onClick={() => setMobile(false)}>
          <div className="absolute inset-y-0 left-0 w-72 bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <Wordmark size="sm" />
              <button onClick={() => setMobile(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
            </div>
            <nav className="grid gap-4 text-sm">
              <Link to="/shop" onClick={() => setMobile(false)}>Shop</Link>
              <Link to="/shop" onClick={() => setMobile(false)}>Women</Link>
              <Link to="/shop" onClick={() => setMobile(false)}>Men</Link>
              <Link to="/shop" onClick={() => setMobile(false)}>Unisex</Link>
              <Link to="/brands" onClick={() => setMobile(false)}>Brands</Link>
              <Link to="/sell" onClick={() => setMobile(false)}>Sell on FrashionCart</Link>
              <Link to="/wishlist" onClick={() => setMobile(false)}>Wishlist</Link>
              <Link to={accountLink} onClick={() => setMobile(false)}>{user ? (user.role === "brand" ? "Seller dashboard" : "My account") : "Sign in"}</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
