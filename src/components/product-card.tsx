import { Link } from "@tanstack/react-router";
import { formatZAR, type Product } from "@/lib/mock-data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to="/product/$id" params={{ id: product.id }} className="group block hover-lift">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {product.isNew && (
          <div className="absolute left-3 top-3 bg-background px-2 py-1 text-[10px] tracking-widest uppercase">
            New
          </div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 text-sm">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{product.brand}</div>
          <div className="mt-0.5">{product.name}</div>
        </div>
        <div className="whitespace-nowrap">{formatZAR(product.price)}</div>
      </div>
    </Link>
  );
}
