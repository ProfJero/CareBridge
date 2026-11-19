import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Facebook, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ProductCard, ProductGridSkeleton } from "@/components/shop/product-card";
import { EmptyState, Spinner } from "@/components/ui";
import { shortDate, waLink } from "@/lib/format";
import { useProducts } from "@/lib/queries";
import { must, sb } from "@/lib/supabase";
import type { Store } from "@/lib/types";

export const Route = createFileRoute("/shop/store/$slug")({
  component: StorePage,
  head: () => ({ meta: [{ title: "Seller shop — SamBee Online Trading Center" }] }),
});

function StorePage() {
  const { slug } = Route.useParams();
  const store = useQuery({
    queryKey: ["store", slug],
    queryFn: async () => must(await sb().from("stores").select("*").eq("slug", slug).maybeSingle()) as Store | null,
  });
  const products = useProducts({ storeId: store.data?.id, limit: 60 }, undefined);

  if (store.isLoading) {
    return (
      <SiteShell>
        <div className="grid min-h-[50vh] place-items-center text-sea"><Spinner className="size-8" /></div>
      </SiteShell>
    );
  }
  if (!store.data) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-5 py-16">
          <EmptyState title="Shop not found" action={<Link to="/shop" className="font-semibold text-sea">Back to the marketplace</Link>}>
            This shop may be closed.
          </EmptyState>
        </div>
      </SiteShell>
    );
  }
  const s = store.data;
  const contact = s.whatsapp || s.phone;
  return (
    <SiteShell>
      <section className="relative bg-navy text-on-navy">
        {s.banner_url ? <img src={s.banner_url} alt="" className="absolute inset-0 size-full object-cover opacity-30" /> : null}
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-5 py-10">
          <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-mint text-3xl font-bold text-sea">
            {s.logo_url ? <img src={s.logo_url} alt="" className="size-full object-cover" /> : s.name[0]}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold sm:text-4xl">
              {s.name}
              {s.verified ? <BadgeCheck className="size-7 text-mint" aria-label="Verified seller" /> : null}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-navy-muted">
              <span className="inline-flex items-center gap-1"><MapPin className="size-4" aria-hidden /> {s.town}, {s.region}</span>
              <span>Selling since {shortDate(s.created_at)}</span>
            </p>
            {s.description ? <p className="mt-3 max-w-2xl text-base text-navy-muted">{s.description}</p> : null}
          </div>
          {contact || s.facebook_url || s.youtube_url ? (
            <div className="flex flex-wrap gap-2">
              {contact ? (
                <a href={waLink(contact, `Hello ${s.name}, I found your shop on the SamBee Online Trading Center.`)} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1f8f4e] px-4 font-semibold text-white">
                  <MessageCircle className="size-4" aria-hidden /> WhatsApp
                </a>
              ) : null}
              {s.facebook_url ? (
                <a href={s.facebook_url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1877f2] px-4 font-semibold text-white">
                  <Facebook className="size-4" aria-hidden /> Facebook
                </a>
              ) : null}
              {s.youtube_url ? (
                <a href={s.youtube_url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#d90000] px-4 font-semibold text-white">
                  <Youtube className="size-4" aria-hidden /> YouTube
                </a>
              ) : null}
              {s.phone ? (
                <a href={`tel:${s.phone}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-4 font-semibold">
                  <Phone className="size-4" aria-hidden /> Call
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-5 py-8">
        {s.video_url ? (
          <div className="mb-8 max-w-2xl overflow-hidden rounded-2xl bg-black ring-1 ring-line">
            <video src={s.video_url} controls playsInline muted preload="metadata" className="aspect-video w-full" />
          </div>
        ) : null}
        <h2 className="text-2xl font-semibold text-ink">Products ({products.data?.count ?? 0})</h2>
        <div className="mt-5">
          {products.isLoading ? (
            <ProductGridSkeleton />
          ) : products.data?.products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.data.products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <EmptyState title="No products yet">This seller has not listed anything yet.</EmptyState>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
