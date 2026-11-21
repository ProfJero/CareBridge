import { Link } from "@tanstack/react-router";
import { BadgeCheck, Play, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/shop/product-image";
import { useCart } from "@/lib/cart";
import { ghs } from "@/lib/format";
import type { Product } from "@/lib/types";

export function Stars({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "md" }) {
  const rounded = Math.round(Number(value));
  const cls = size === "sm" ? "size-4" : "size-5";
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`${Number(value).toFixed(1)} out of 5 stars`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={`${cls} ${n <= rounded ? "fill-gold text-gold" : "text-line"}`} aria-hidden />
        ))}
      </span>
      {count !== undefined ? <span className="text-sm text-faint">({count})</span> : null}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((state) => state.add);
  const discount =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
      ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
      : 0;
  const soldOut = product.stock <= 0;

  function addToCart() {
    add({
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images[0] ?? null,
      storeId: product.store_id,
      storeName: product.store?.name ?? "Seller",
      stock: product.stock,
    });
    toast.success("Added to cart", { description: product.title });
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-shadow hover:shadow-md">
      <Link to="/shop/product/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden bg-paper">
        <ProductImage
          src={product.images[0]}
          alt={product.title}
          icon={product.category?.icon}
          seed={product.id}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {discount > 0 ? (
          <span className="absolute top-3 left-3 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>
        ) : null}
        {product.video_url ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-navy/85 px-2 py-1 text-xs font-bold text-white">
            <Play className="size-3 fill-current" aria-hidden /> Video
          </span>
        ) : null}
        {soldOut ? (
          <span className="absolute inset-x-0 bottom-0 bg-navy/80 py-1.5 text-center text-sm font-semibold text-on-navy">Sold out</span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.store ? (
          <p className="flex items-center gap-1 truncate text-xs font-semibold tracking-wide text-faint uppercase">
            {product.store.name}
            {product.store.verified ? <BadgeCheck className="size-3.5 shrink-0 text-sea" aria-label="Verified seller" /> : null}
          </p>
        ) : null}
        <Link
          to="/shop/product/$id"
          params={{ id: product.id }}
          className="mt-1 line-clamp-2 text-base leading-snug font-semibold text-ink hover:text-sea"
        >
          {product.title}
        </Link>
        {product.rating_count > 0 ? (
          <div className="mt-1.5">
            <Stars value={product.rating_avg} count={product.rating_count} />
          </div>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink tabular-nums">{ghs(product.price)}</p>
            {discount > 0 ? <p className="text-sm text-faint line-through tabular-nums">{ghs(product.compare_at_price)}</p> : null}
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={soldOut}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-sea text-on-sea hover:bg-sea-2 disabled:bg-line disabled:text-faint"
            aria-label={`Add ${product.title} to cart`}
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-line bg-card">
          <div className="aspect-square bg-paper" />
          <div className="grid gap-2 p-4">
            <div className="h-3 w-1/2 rounded bg-paper" />
            <div className="h-4 w-4/5 rounded bg-paper" />
            <div className="h-5 w-1/3 rounded bg-paper" />
          </div>
        </div>
      ))}
    </div>
  );
}
