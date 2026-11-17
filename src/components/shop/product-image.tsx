import { useState } from "react";
import { Accessibility, Activity, Apple, BedDouble, Cross, Droplets, Gift, Package, Shirt, type LucideIcon } from "lucide-react";
import { cdnImage } from "@/lib/cloudinary";
import { cn } from "@/lib/cn";

const ICONS: Record<string, LucideIcon> = {
  accessibility: Accessibility,
  activity: Activity,
  apple: Apple,
  bed: BedDouble,
  cross: Cross,
  droplets: Droplets,
  gift: Gift,
  shirt: Shirt,
  package: Package,
};

const TONES = ["bg-mint text-sea", "bg-sky text-navy", "bg-gold-bg text-gold", "bg-[#f3ecf7] text-[#6b3f86]"];

export function categoryIcon(name?: string | null): LucideIcon {
  return ICONS[name ?? "package"] ?? Package;
}

export function ProductImage({
  src,
  alt,
  icon,
  seed = "",
  width = 600,
  className,
}: {
  src?: string | null;
  alt: string;
  icon?: string | null;
  seed?: string;
  width?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={cdnImage(src, width)}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn("size-full object-cover", className)}
      />
    );
  }
  const Icon = categoryIcon(icon);
  const tone = TONES[[...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TONES.length];
  return (
    <div className={cn("grid size-full place-items-center", tone, className)} role="img" aria-label={alt}>
      <Icon className="size-1/3 opacity-80" strokeWidth={1.4} aria-hidden />
    </div>
  );
}
