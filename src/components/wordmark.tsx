/** FrashionCart S.A wordmark with subtle South African flag accent on "S.A". */
export function Wordmark({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "text-lg md:text-xl",
    md: "text-xl md:text-2xl",
    lg: "text-3xl md:text-4xl",
  } as const;
  return (
    <span className={`font-display tracking-tight whitespace-nowrap ${sizes[size]} ${className}`}>
      FrashionCart{" "}
      <span aria-label="South Africa" className="inline-flex items-baseline">
        <span style={{ color: "var(--sa-green)" }}>S</span>
        <span style={{ color: "var(--sa-gold)" }}>.</span>
        <span style={{ color: "var(--sa-red)" }}>A</span>
      </span>
    </span>
  );
}
