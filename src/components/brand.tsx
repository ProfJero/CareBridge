import { cn } from "@/lib/cn";

export type BrandKind = "care" | "shop";

const ICON: Record<BrandKind, { src: string; w: number; h: number; alt: string }> = {
  care: { src: "/brand/care-logo.webp", w: 320, h: 293, alt: "JonnyBee Son and Daughter Home Care Services logo" },
  shop: { src: "/brand/shop-logo.webp", w: 320, h: 303, alt: "JonnyBee Son and Daughter Online Trading Platform logo" },
};

/** The extracted logo artwork. On dark backgrounds it sits on a white badge so the edges stay clean. */
export function LogoMark({ kind = "care", className, badge = false }: { kind?: BrandKind; className?: string; badge?: boolean }) {
  const icon = ICON[kind];
  const img = (
    <img
      src={icon.src}
      width={icon.w}
      height={icon.h}
      alt={icon.alt}
      className={cn("block h-full w-auto object-contain", !badge && className)}
      decoding="async"
    />
  );
  if (!badge) return img;
  return <span className={cn("inline-flex items-center rounded-xl bg-white px-2 py-1.5", className)}>{img}</span>;
}

/** "JonnyBee" wordmark in the logo blues: Jonny in deep blue, Bee in bright blue. */
export function JonnyBee({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("font-display font-extrabold tracking-tight", className)}>
      <span className={light ? "text-white" : "text-navy"}>Jonny</span>
      <span className={light ? "text-[#ffd23f]" : "text-sea"}>Bee</span>
    </span>
  );
}

export function Wordmark({ kind = "care", light = false, compact = false }: { kind?: BrandKind; light?: boolean; compact?: boolean }) {
  const line2 = kind === "shop" ? "Son & Daughter Online Trading" : "Son & Daughter Home Care";
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className={cn("flex shrink-0 items-center", "h-11 sm:h-12")}>
        <LogoMark kind={kind} badge={light} className="h-full" />
      </span>
      <span className="min-w-0 leading-none">
        <JonnyBee light={light} className="block text-xl sm:text-2xl" />
        <span
          className={cn(
            "mt-0.5 block truncate text-[11px] font-bold tracking-wide uppercase sm:text-xs",
            light ? "text-navy-muted" : "text-sea",
            compact && "hidden min-[400px]:block",
          )}
        >
          {line2}
        </span>
      </span>
    </span>
  );
}
