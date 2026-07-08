import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function SiteHeader() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-8">
          <button className="md:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <Link to="/" className="font-display text-2xl tracking-tight">Frashion</Link>
          <nav className="hidden md:flex items-center gap-7 text-[13px]">
            <Link to="/shop" className="hover:opacity-60 transition-opacity">Shop</Link>
            <Link to="/shop" className="hover:opacity-60">Women</Link>
            <Link to="/shop" className="hover:opacity-60">Men</Link>
            <Link to="/shop" className="hover:opacity-60">Accessories</Link>
            <Link to="/sell" className="hover:opacity-60">Sell on Frashion</Link>
          </nav>
        </div>
        <div className="flex items-center gap-5 text-[13px]">
          <button aria-label="Search" className="hover:opacity-60"><Search className="h-[18px] w-[18px]" /></button>
          <Link to="/seller" className="hidden md:inline hover:opacity-60"><User className="h-[18px] w-[18px]" /></Link>
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
