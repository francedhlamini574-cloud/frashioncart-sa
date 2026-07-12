## Scope

Enhance the existing frontend without redesigning it. Preserve the "cream and ink" editorial system, Cormorant + Inter type, and current route structure. All persistence stays in `localStorage` (frontend-only MVP for investor demo).

## 1. Data model extensions (`src/lib/mock-data.ts`, `src/lib/products-store.tsx`)

Extend `Product` with:
- `gender: "Men" | "Women" | "Unisex" | "Kids"`
- `sizes: string[]` (e.g. `["S","M","L"]` or `["UK 7","UK 8"]`)
- `colors: { name: string; hex: string }[]`
- `discountPct?: number` (0–90)
- `rating?: number` (mocked 4.2–4.9)
- `trending?: boolean`
- `createdAt: string` (ISO, drives "newest first")

Seed existing 6 products with sensible defaults. Sort `all` by `createdAt desc` so new seller uploads appear first everywhere (shop, new arrivals, category grids, seller storefront) automatically.

Add size presets helper: `CLOTHING_SIZES`, `SHOE_SIZES_UK`, `SHOE_SIZES_EU`.

## 2. Security & robustness

- **Route guards**: pathless `_authenticated` behavior via a tiny `<RequireRole roles={[...]}>` wrapper used inside `seller.tsx`, `admin.tsx`, `account.tsx`. Unauthenticated → redirect to `/login?redirect=…`. Wrong role → render new `/403` page.
- **Zod validation** on signup, login, product-create, address forms. Show field errors, disable submit while pending, prevent duplicate submits with a `pending` state.
- **XSS**: audit — no `dangerouslySetInnerHTML` currently; keep it that way. Sanitize seller-uploaded image URLs (only allow `data:image/...`, `https:` schemes).
- **Session**: bump session shape to `{ id, issuedAt, expiresAt }` with a 7-day soft expiry; `AuthProvider` clears expired sessions on mount.
- **Password**: minimum length + basic strength check client-side (still not real security — note in code that this is demo-only).
- **Error boundaries**: keep root boundary; add per-route `errorComponent` + `notFoundComponent` on key routes.
- **403 page**: `src/routes/403.tsx` + already-present 404 root boundary.
- **Loading/skeleton**: lightweight `<ProductCardSkeleton />` shown during simulated fetch (200ms) on shop/brand pages to demonstrate loading UX.

## 3. Cart + wishlist + saved-for-later

Extend `cart-store.tsx`:
- Cart items carry `size` and `color`; same product with different size = separate line.
- New `saved` list with `moveToSaved`, `moveToCart`.
- Add `wishlist-store.tsx` (separate localStorage key).
- Cart page: show stock, estimated delivery ("3–5 business days"), subtotal, 10% platform fee line, total; block checkout if any line missing size.
- Product detail: require size selection before "Add to bag" (button disabled with helper text).

## 4. Brands directory (`src/routes/brands.tsx` + `src/routes/brand.$slug.tsx`)

- `/brands`: grid of brand cards (logo initial mark, banner gradient, tagline, verified check, product count, mock rating + followers, "Visit store"). Newest brands (registered brand-owners + seed BRANDS) first.
- `/brand/$slug`: brand storefront showing that brand's products (already partially implied by `brandSlug`).

## 5. Product cards (`src/components/product-card.tsx`)

Upgrade in place:
- Larger image, subtle hover zoom (kept), quick-view button overlay, wishlist heart toggle.
- Badges: New / Trending / -X% discount / Unisex.
- Small brand mark + verified tick.
- Color dots row, size chips on hover, stock indicator ("Only 3 left" when stock ≤ 5).
- Discounted price with strikethrough original.

## 6. Filters (`src/routes/shop.tsx`)

Left sidebar (desktop) / top drawer (mobile): brand, category, gender, price range slider, color swatches, size chips, min rating, sort (Newest / Best selling / Trending / Discount / Price asc/desc). All client-side over `useProducts().all`.

## 7. Seller dashboard (`src/routes/seller.tsx`)

Product form gains: gender select, size multi-select chips (auto-swaps between clothing vs shoe presets based on category), color multi-add with hex picker, discount %, multiple image URLs (first is cover), preview panel. Existing list gains edit/delete inline (edit opens a drawer).

## 8. Homepage (`src/routes/index.tsx`)

Add sections beneath existing hero (keeping current hero and typography): Trending This Week, Featured Brands (links to /brands), New Arrivals, African Designers (curated subset), Best Sellers (mock), Luxury Collection, Streetwear, Flash Sale (with countdown), Customer Reviews (3 quotes), Become a Seller CTA, Newsletter signup. Blog preview + Recommended For You included as compact rows to avoid over-length; Seasonal Collections merged with Luxury/Streetwear tiles.

## 9. Logo — SA flag accent

In `SiteHeader` (and footer wordmark), split "FrashionCart S.A" so `S.A` letters render with subtle SA flag colors: `S` in a muted green, `.` in gold, `A` in a deep red — using low-saturation tokens (`--sa-green`, `--sa-gold`, `--sa-red`) added to `styles.css`. Typography unchanged.

## 10. Accessibility & perf

- `aria-label` on every icon-only button (cart, wishlist, remove, quick view).
- Focus-visible ring via existing tokens.
- `loading="lazy"` already on images; add `decoding="async"`.
- `aspect-*` wrappers already used — keep.
- Semantic `<main>` once per route (via layout); single `<h1>` per page.

## What is intentionally deferred

- Real auth/CSRF tokens, real Stripe Connect, real image uploads to storage — all require Lovable Cloud; out of scope per "frontend only" instruction. Code is structured so swapping the stores for API calls later is a drop-in.
- Kids category surfaced in filters but no dedicated landing (future-ready per spec).

## Files touched (approx.)

New: `src/lib/wishlist-store.tsx`, `src/lib/validation.ts`, `src/components/require-role.tsx`, `src/components/product-card-skeleton.tsx`, `src/components/quick-view.tsx`, `src/routes/brands.tsx`, `src/routes/brand.$slug.tsx`, `src/routes/403.tsx`, `src/routes/saved.tsx`.

Edited: `src/lib/mock-data.ts`, `src/lib/products-store.tsx`, `src/lib/cart-store.tsx`, `src/lib/auth-store.tsx`, `src/components/product-card.tsx`, `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/routes/__root.tsx` (wishlist provider), `src/routes/index.tsx`, `src/routes/shop.tsx`, `src/routes/cart.tsx`, `src/routes/product.$id.tsx`, `src/routes/seller.tsx`, `src/routes/admin.tsx`, `src/routes/account.tsx`, `src/routes/login.tsx`, `src/routes/signup.tsx`, `src/styles.css`.

## Verification

- `tsgo` clean typecheck after each cluster of edits.
- Playwright smoke: signup as brand → add product with sizes/gender/discount → appears at top of `/shop`, in `/brand/$slug`, in New Arrivals on `/`, filterable by Unisex → customer signup → add to cart requiring size → save for later → move back → checkout blocked without size chosen elsewhere.
- Screenshot the homepage, shop with filters, brand page, seller product form, and updated logo for visual confirmation.

## Delivery order

1. Data model + stores (mock-data, products, cart, wishlist, validation).
2. Guards + 403 + skeletons.
3. Product card + quick view + brand pages.
4. Shop filters + homepage sections.
5. Seller form upgrade + cart/wishlist pages + product detail size gate.
6. Logo SA-flag accent + header/footer polish.
7. Typecheck + Playwright smoke + screenshots.

Approve and I'll execute in that order.
