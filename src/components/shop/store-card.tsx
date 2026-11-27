import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Package, Sparkles } from "lucide-react";
import type { StoreWithCount } from "@/lib/queries";
import { cdnImage } from "@/lib/cloudinary";
import { cn } from "@/lib/cn";

export const isNewShop = (createdAt: string) => Date.now() - new Date(createdAt).getTime() < 21 * 86400_000;

export function StoreCard({ store, compact = false }: { store: StoreWithCount; compact?: boolean }) {
  const count = store.products?.[0]?.count ?? 0;
  return (
    <Link
      to="/shop/store/$slug"
      params={{ slug: store.slug }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-md",
        compact ? "w-64 shrink-0" : "",
      )}
    >
      <span className="relative block h-24 bg-gradient-to-br from-navy to-sea">
        {store.banner_url ? <img src={cdnImage(store.banner_url, 600)} alt="" className="size-full object-cover" loading="lazy" /> : null}
        {isNewShop(store.created_at) ? (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-sea">
            <Sparkles className="size-3" aria-hidden /> New
          </span>
        ) : null}
      </span>
      <span className="relative flex flex-1 flex-col px-4 pt-9 pb-4">
        <span className="absolute -top-7 left-4 grid size-14 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-mint text-xl font-extrabold text-sea shadow-sm">
          {store.logo_url ? <img src={cdnImage(store.logo_url, 120)} alt="" className="size-full object-cover" loading="lazy" /> : store.name[0]?.toUpperCase()}
        </span>
        <span className="flex items-center gap-1 text-lg font-bold text-ink group-hover:text-sea">
          <span className="truncate">{store.name}</span>
          {store.verified ? <BadgeCheck className="size-5 shrink-0 text-sea" aria-label="Verified seller" /> : null}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-sm text-faint">
          <MapPin className="size-3.5" aria-hidden /> {store.town}
        </span>
        {!compact && store.description ? <span className="mt-2 line-clamp-2 text-sm text-muted">{store.description}</span> : null}
        <span className="mt-auto flex items-center gap-1.5 pt-3 text-sm font-semibold text-navy">
          <Package className="size-4" aria-hidden />
          {count === 0 ? "Setting up — products coming soon" : `${count} product${count === 1 ? "" : "s"}`}
        </span>
      </span>
    </Link>
  );
}
