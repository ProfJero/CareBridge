import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, ChevronRight, Play, Heart, MapPin, MessageCircle, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { ProductCard, Stars } from "@/components/shop/product-card";
import { ProductImage } from "@/components/shop/product-image";
import { Button, EmptyState, ErrorNote, Spinner, controlClass } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { ghs, shortDate, waLink } from "@/lib/format";
import { trackView, useProducts } from "@/lib/queries";
import { useSession } from "@/lib/session";
import { errText, must, sb } from "@/lib/supabase";
import { PRODUCT_SELECT, type Product, type Review } from "@/lib/types";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/shop/product/$id")({
  component: ProductPage,
  head: () => ({ meta: [{ title: "Product — SamBee Online Trading Center" }] }),
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const add = useCart((state) => state.add);
  const { userId, profile } = useSession();
  const queryClient = useQueryClient();
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: async () => must(await sb().from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle()) as Product | null,
  });
  const product = productQuery.data;
  useEffect(() => {
    if (product?.id) trackView("product", product.id);
  }, [product?.id]);

  const reviews = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () =>
      must(await sb().from("reviews").select("*").eq("product_id", id).order("created_at", { ascending: false })) as Review[],
  });

  const wish = useQuery({
    queryKey: ["wish", id, userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      Boolean(must(await sb().from("wishlists").select("product_id").eq("product_id", id).eq("user_id", userId!).maybeSingle())),
  });

  const related = useProducts({ category: product?.category?.slug, limit: 5 }, product?.category ? [{ ...product.category, sort: 0 }] : undefined);

  const toggleWish = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Sign in to save items to your wishlist.");
      if (wish.data) {
        must(await sb().from("wishlists").delete().eq("product_id", id).eq("user_id", userId));
      } else {
        must(await sb().from("wishlists").insert({ product_id: id, user_id: userId }));
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wish", id] });
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(wish.data ? "Removed from wishlist" : "Saved to wishlist");
    },
    onError: (error) => toast.error(errText(error)),
  });

  if (productQuery.isLoading) {
    return (
      <SiteShell>
        <div className="grid min-h-[50vh] place-items-center text-sea">
          <Spinner className="size-8" />
        </div>
      </SiteShell>
    );
  }

  if (!product) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-5 py-16">
          <EmptyState
            title="This product is not available"
            action={
              <Link to="/shop" className="font-semibold text-sea">
                Back to the shop
              </Link>
            }
          >
            It may have been removed or sold out.
          </EmptyState>
        </div>
      </SiteShell>
    );
  }

  const images = product.images.length ? product.images : [null];
  const discount =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
      ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
      : 0;
  const soldOut = product.stock <= 0;
  const line = {
    productId: product.id,
    title: product.title,
    price: Number(product.price),
    image: product.images[0] ?? null,
    storeId: product.store_id,
    storeName: product.store?.name ?? "Seller",
    stock: product.stock,
  };
  const sellerContact = product.store?.whatsapp || product.store?.phone;

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-5 py-6 sm:py-8">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-faint [&_a]:inline-flex [&_a]:min-h-7 [&_a]:items-center" aria-label="Breadcrumb">
          <Link to="/shop" className="hover:text-sea">Shop</Link>
          {product.category ? (
            <>
              <ChevronRight className="size-4" aria-hidden />
              <Link to="/shop" search={{ cat: product.category.slug }} className="hover:text-sea">
                {product.category.name}
              </Link>
            </>
          ) : null}
          <ChevronRight className="size-4" aria-hidden />
          <span className="truncate text-muted">{product.title}</span>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="aspect-square overflow-hidden rounded-3xl border border-line bg-card">
              {imageIndex === -1 && product.video_url ? (
                <video src={product.video_url} controls autoPlay muted playsInline loop className="size-full bg-black object-contain" />
              ) : (
                <ProductImage src={images[Math.max(0, imageIndex)]} alt={product.title} icon={product.category?.icon} seed={product.id} width={1000} />
              )}
            </div>
            {images.length > 1 || product.video_url ? (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={cn(
                      "size-20 shrink-0 overflow-hidden rounded-xl border-2",
                      index === imageIndex ? "border-sea" : "border-transparent",
                    )}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <ProductImage src={src} alt="" icon={product.category?.icon} seed={product.id} width={160} />
                  </button>
                ))}
                {product.video_url ? (
                  <button
                    type="button"
                    onClick={() => setImageIndex(-1)}
                    className={cn(
                      "relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border-2 bg-navy text-white",
                      imageIndex === -1 ? "border-sea" : "border-transparent",
                    )}
                    aria-label="Play product video"
                  >
                    <Play className="size-7 fill-current" aria-hidden />
                    <span className="absolute bottom-1 text-[10px] font-bold uppercase">Video</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div>
            {product.category ? (
              <p className="text-sm font-bold tracking-widest text-sea uppercase">{product.category.name}</p>
            ) : null}
            <h1 className="mt-2 font-display text-3xl leading-tight font-bold text-ink sm:text-4xl">{product.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-base text-faint">
              {product.rating_count > 0 ? (
                <a href="#reviews" className="inline-flex items-center gap-2">
                  <Stars value={product.rating_avg} size="md" />
                  {Number(product.rating_avg).toFixed(1)} · {product.rating_count} reviews
                </a>
              ) : (
                <span>No reviews yet</span>
              )}
              {product.sold_count > 0 ? <span>· {product.sold_count} sold</span> : null}
            </div>

            <div className="mt-5 flex items-end gap-3">
              <p className="text-3xl font-bold text-ink tabular-nums">{ghs(product.price)}</p>
              {discount > 0 ? (
                <>
                  <p className="pb-1 text-lg text-faint line-through tabular-nums">{ghs(product.compare_at_price)}</p>
                  <span className="mb-1 rounded-full bg-gold px-2.5 py-0.5 text-sm font-bold text-white">Save {discount}%</span>
                </>
              ) : null}
            </div>
            <p className={cn("mt-2 text-base font-semibold", soldOut ? "text-danger" : product.stock <= 5 ? "text-gold" : "text-sea")}>
              {soldOut ? "Sold out" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
            </p>

            {!soldOut ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex h-13 items-center rounded-xl border border-line bg-card">
                  <button type="button" className="grid h-full w-12 place-items-center text-navy" onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Decrease quantity">
                    <Minus className="size-4" />
                  </button>
                  <span className="w-10 text-center text-lg font-semibold tabular-nums" aria-live="polite">{qty}</span>
                  <button
                    type="button"
                    className="grid h-full w-12 place-items-center text-navy"
                    onClick={() => setQty((n) => Math.min(product.stock, n + 1))}
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Button
                  className="h-13 flex-1 px-6"
                  onClick={() => {
                    add(line, qty);
                    toast.success("Added to cart", { description: `${qty} × ${product.title}` });
                  }}
                >
                  <ShoppingBag className="size-5" aria-hidden /> Add to cart
                </Button>
                <Button
                  tone="secondary"
                  className="h-13 flex-1 px-6"
                  onClick={() => {
                    add(line, qty);
                    void navigate({ to: "/shop/checkout" });
                  }}
                >
                  Buy now
                </Button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => toggleWish.mutate()}
              className="mt-4 inline-flex h-11 items-center gap-2 font-semibold text-navy"
            >
              <Heart className={cn("size-5", wish.data && "fill-danger text-danger")} aria-hidden />
              {wish.data ? "Saved to wishlist" : "Save to wishlist"}
            </button>

            <ul className="mt-6 grid gap-3 rounded-2xl bg-card p-5 text-base ring-1 ring-line">
              <li className="flex items-start gap-3">
                <Truck className="mt-0.5 size-5 shrink-0 text-sea" aria-hidden />
                <span>
                  <strong className="font-semibold">Free delivery</strong> — in Assin Foso and across Ghana. Free pickup is also available.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-sea" aria-hidden />
                <span>
                  <strong className="font-semibold">Pay your way</strong> — Mobile Money or cash on delivery.
                </span>
              </li>
            </ul>

            {product.store ? (
              <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-5">
                <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-mint text-xl font-bold text-sea">
                  {product.store.logo_url ? <img src={product.store.logo_url} alt="" className="size-full object-cover" /> : product.store.name[0]}
                </span>
                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm text-faint">Sold by</p>
                  <Link
                    to="/shop/store/$slug"
                    params={{ slug: product.store.slug }}
                    className="flex items-center gap-1 text-lg font-semibold text-ink hover:text-sea"
                  >
                    {product.store.name}
                    {product.store.verified ? <BadgeCheck className="size-5 text-sea" aria-label="Verified seller" /> : null}
                  </Link>
                  <p className="flex items-center gap-1 text-sm text-faint">
                    <MapPin className="size-3.5" aria-hidden /> {product.store.town}
                  </p>
                </div>
                {sellerContact ? (
                  <a
                    href={waLink(sellerContact, `Hello, I'm interested in "${product.title}" on the SamBee Online Trading Center.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#137a3e] px-4 font-semibold text-white"
                  >
                    <MessageCircle className="size-4" aria-hidden /> Ask seller
                  </a>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-ink">About this item</h2>
              <p className="mt-2 text-base leading-relaxed whitespace-pre-line text-muted">
                {product.description || "The seller has not added a description yet."}
              </p>
              {product.tags.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Link key={tag} to="/shop" search={{ q: tag }} className="rounded-full bg-paper px-3 py-1 text-sm text-muted ring-1 ring-line">
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <section id="reviews" className="mt-14 grid scroll-mt-24 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink">Customer reviews</h2>
            {product.rating_count > 0 ? (
              <div className="mt-3 flex items-center gap-3">
                <p className="text-5xl font-bold text-ink">{Number(product.rating_avg).toFixed(1)}</p>
                <div>
                  <Stars value={product.rating_avg} size="md" />
                  <p className="text-base text-faint">{product.rating_count} reviews</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-base text-muted">Be the first to review this product after your order arrives.</p>
            )}
            <ReviewForm
              productId={product.id}
              userId={userId}
              authorName={profile?.full_name ?? ""}
              existing={reviews.data?.find((review) => review.user_id === userId)}
            />
          </div>
          <ul className="grid gap-3 self-start">
            {(reviews.data ?? []).map((review) => (
              <li key={review.id} className="rounded-2xl border border-line bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars value={review.rating} />
                  <span className="text-sm text-faint">{shortDate(review.created_at)}</span>
                </div>
                <p className="mt-2 font-semibold text-ink">{review.author_name || "Verified buyer"}</p>
                {review.comment ? <p className="mt-1 text-base leading-relaxed text-muted">{review.comment}</p> : null}
              </li>
            ))}
          </ul>
        </section>

        {related.data && related.data.products.filter((item) => item.id !== product.id).length > 0 ? (
          <section className="mt-14">
            <h2 className="font-display text-3xl font-bold text-ink">You may also need</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {related.data.products
                .filter((item) => item.id !== product.id)
                .slice(0, 4)
                .map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
            </div>
          </section>
        ) : null}
      </div>
    </SiteShell>
  );
}

function ReviewForm({
  productId,
  userId,
  authorName,
  existing,
}: {
  productId: string;
  userId: string | null;
  authorName: string;
  existing?: Review;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      const row = { product_id: productId, user_id: userId!, rating, comment: comment.trim(), author_name: authorName || "Verified buyer" };
      const result = existing
        ? await sb().from("reviews").update({ rating: row.rating, comment: row.comment }).eq("id", existing.id)
        : await sb().from("reviews").insert(row);
      if (result.error) {
        if (/row-level security/i.test(result.error.message)) throw new Error("Only customers who ordered this product can review it.");
        throw new Error(result.error.message);
      }
    },
    onSuccess: () => {
      setError("");
      toast.success("Thank you for your review");
      void queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      void queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (err) => setError(errText(err)),
  });

  if (!userId) {
    return (
      <p className="mt-6 rounded-2xl bg-paper p-4 text-base text-muted">
        <Link to="/account" className="font-semibold text-sea">Sign in</Link> to review a product you have ordered.
      </p>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl border border-line bg-card p-5">
      <p className="font-semibold text-ink">{existing ? "Update your review" : "Write a review"}</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            onClick={() => setRating(n)}
            className={cn("grid size-10 place-items-center rounded-lg text-2xl", n <= rating ? "text-gold" : "text-line")}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className={`${controlClass} h-24 py-3`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you like? How has it helped?"
        maxLength={1500}
      />
      <ErrorNote>{error}</ErrorNote>
      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? "Saving…" : existing ? "Update review" : "Post review"}
      </Button>
    </form>
  );
}
