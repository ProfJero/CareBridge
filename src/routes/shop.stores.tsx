import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Store } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { StoreCard } from "@/components/shop/store-card";
import { EmptyState } from "@/components/ui";
import { useStores } from "@/lib/queries";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/shop/stores")({
  component: StoresPage,
  head: () => ({
    meta: [
      { title: "Shops — SamBee Online Trading Center" },
      { name: "description", content: "Browse every shop on the SamBee Online Trading Center in Assin Foso, Ghana." },
    ],
  }),
});

type Sort = "newest" | "products" | "popular";

function StoresPage() {
  const stores = useStores(500);
  const { store: myStore } = useSession();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = (stores.data ?? []).filter((s) => !needle || `${s.name} ${s.town} ${s.description}`.toLowerCase().includes(needle));
    return [...rows].sort((a, b) =>
      sort === "products"
        ? (b.products?.[0]?.count ?? 0) - (a.products?.[0]?.count ?? 0)
        : sort === "popular"
          ? b.view_count - a.view_count
          : b.created_at.localeCompare(a.created_at),
    );
  }, [stores.data, q, sort]);

  return (
    <SiteShell>
      <section className="bg-navy text-on-navy">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className="text-sm font-bold tracking-widest text-navy-muted uppercase">Online Trading Center</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Shops on SamBee</h1>
          <p className="mt-2 max-w-2xl text-lg text-navy-muted">Every seller trading on SamBee — from Assin Foso and beyond. Visit a shop to see its products, videos and contacts.</p>
          <div className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
            <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-4 text-faint">
              <Search className="size-5 shrink-0" aria-hidden />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search shops by name or town"
                aria-label="Search shops"
                className="w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-faint"
              />
            </label>
            {myStore ? (
              <Link to="/shop/store/$slug" params={{ slug: myStore.slug }} className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-5 font-bold text-navy">
                View my shop
              </Link>
            ) : (
              <Link to="/sell" className="inline-flex h-12 items-center justify-center rounded-xl bg-sea px-5 font-bold text-white">
                Open your shop — free
              </Link>
            )}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-base text-faint">{stores.data ? `${list.length} shop${list.length === 1 ? "" : "s"}` : "Loading…"}</p>
          <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-line" role="tablist" aria-label="Sort shops">
            {([
              ["newest", "Newest"],
              ["products", "Most products"],
              ["popular", "Most visited"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={sort === id}
                onClick={() => setSort(id)}
                className={cn("h-9 rounded-full px-3 text-sm font-bold", sort === id ? "bg-navy text-white" : "text-navy")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5">
          {stores.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-60 animate-pulse rounded-2xl bg-white" />)}
            </div>
          ) : list.length === 0 ? (
            <EmptyState icon={<Store className="size-6" />} title={q ? "No shops match" : "No shops yet"} action={<Link to="/sell" className="font-bold text-sea">Be the first to open a shop</Link>}>
              {q ? "Try another name or town." : "Sellers will appear here as soon as they open their shops."}
            </EmptyState>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((s) => <StoreCard key={s.id} store={s} />)}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
