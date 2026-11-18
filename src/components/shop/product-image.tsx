import { useState } from "react";
import { Accessibility, Activity, Apple, BedDouble, Cross, Droplets, Gift, Home, Laptop, Package, Shirt, Smartphone, type LucideIcon } from "lucide-react";
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
  home: Home,
  smartphone: Smartphone,
  laptop: Laptop,
};

const TONES = ["bg-mint text-sea", "bg-sky text-navy", "bg-leaf-bg text-leaf", "bg-[#eef1fb] text-navy-2"];

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
