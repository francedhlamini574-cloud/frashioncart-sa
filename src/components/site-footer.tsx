import { Link } from "@tanstack/react-router";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Wordmark size="lg" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              A curated marketplace for independent South African fashion brands.
            </p>
          </div>
          <div>
            <div className="eyebrow mb-4">Shop</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop">All</Link></li>
              <li><Link to="/shop">Women</Link></li>
              <li><Link to="/shop">Men</Link></li>
              <li><Link to="/shop">Unisex</Link></li>
              <li><Link to="/brands">Brands</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">Company</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/sell">Become a seller</Link></li>
              <li><Link to="/seller">Seller dashboard</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><a>About</a></li>
              <li><a>Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">Newsletter</div>
            <p className="text-sm text-muted-foreground mb-3">The new arrivals, once a week.</p>
            <form className="flex border-b border-foreground/40" onSubmit={(e) => e.preventDefault()}>
              <label className="sr-only" htmlFor="footer-email">Email address</label>
              <input id="footer-email" placeholder="Email" className="w-full bg-transparent py-2 text-sm outline-none" />
              <button className="text-sm tracking-wider uppercase">Join</button>
            </form>
          </div>
        </div>
        <div className="mt-16 flex flex-col-reverse gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:justify-between">
          <div>© {new Date().getFullYear()} FrashionCart S.A. Shipped across South Africa.</div>
          <div className="flex gap-6">
            <a>Privacy</a><a>Terms</a><a>Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
