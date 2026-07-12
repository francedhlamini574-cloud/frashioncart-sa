export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-muted" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-16 bg-muted" />
        <div className="h-3 w-32 bg-muted" />
        <div className="h-3 w-20 bg-muted" />
      </div>
    </div>
  );
}
