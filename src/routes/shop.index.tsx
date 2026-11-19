import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Store, Truck, Wallet, X, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ProductCard, ProductGridSkeleton } from "@/components/shop/product-card";
import { categoryIcon } from "@/components/shop/product-image";
import { Button, EmptyState, controlClass } from "@/components/ui";
import { useCategories, useProducts, type ProductFilters } from "@/lib/queries";
import { SamBee } from "@/components/brand";
import { SHOP } from "@/lib/config";
import { cn } from "@/lib/cn";

type ShopSearch = {
  q?: string;
  cat?: string;
  sort?: ProductFilters["sort"];
  min?: number;
  max?: number;
  stock?: boolean;
};

const SORTS: { id: NonNullable<ProductFilters["sort"]>; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "popular", label: "Best selling" },
  { id: "rating", label: "Top rated" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
];

const num = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && value !== "" && value !== undefined ? n : undefined;
};

export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    cat: typeof search.cat === "string" && search.cat ? search.cat : undefined,
    sort: SORTS.some((s) => s.id === search.sort) ? (search.sort as ShopSearch["sort"]) : undefined,
    min: num(search.min),
    max: num(search.max),
    stock: search.stock === true || search.stock === "true" ? true : undefined,
  }),
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop — SamBee Son and Daughter Online Trading Center, Assin Foso" },
      {
        name: "description",
        content: "Shop Smart... Shop Online. Mobile accessories, electronics, fashion, home essentials, gifts and care supplies from Assin Foso, Ghana. Mobile Money or cash on delivery.",
      },
    ],
  }),
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop/" });
  const { data: categories } = useCategories();
  const [limit, setLimit] = useState(24);
  const [query, setQuery] = useState(search.q ?? "");
  const [min, setMin] = useState(search.min?.toString() ?? "");
  const [max, setMax] = useState(search.max?.toString() ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => setQuery(search.q ?? ""), [search.q]);
  useEffect(() => setLimit(24), [search.q, search.cat, search.sort, search.min, search.max, search.stock]);

  const products = useProducts(
    { q: search.q, category: search.cat, sort: search.sort, min: search.min, max: search.max, inStock: search.stock, limit },
    categories,
  );

  const set = (patch: Partial<ShopSearch>) => void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const activeCategory = categories?.find((item) => item.slug === search.cat);
  const filterCount = [search.min, search.max, search.stock].filter((v) => v !== undefined).length;

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    set({ q: query.trim() || undefined });
  }

  function applyPrice(event: FormEvent) {
    event.preventDefault();
    set({ min: num(min), max: num(max) });
    setFiltersOpen(false);
  }

  const filtersPanel = (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-bold tracking-widest text-faint uppercase">Categories</p>
        <ul className="mt-2 grid gap-1">
          <li>
            <button
              type="button"
              onClick={() => set({ cat: undefined })}
              className={cn(
                "flex h-11 w-full items-center rounded-xl px-3 text-left text-base font-semibold",
                !search.cat ? "bg-mint text-sea-2" : "text-navy hover:bg-sky",
              )}
            >
              All products
            </button>
          </li>
          {categories?.map((category) => {
            const Icon = categoryIcon(category.icon);
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => {
                    set({ cat: category.slug });
                    setFiltersOpen(false);
                  }}
                  className={cn(
                    "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-base font-semibold",
                    search.cat === category.slug ? "bg-mint text-sea-2" : "text-navy hover:bg-sky",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {category.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <form onSubmit={applyPrice}>
        <p className="text-sm font-bold tracking-widest text-faint uppercase">Price (GH₵)</p>
        <div className="mt-2 flex items-center gap-2">
          <input className={controlClass} inputMode="decimal" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} aria-label="Minimum price" />
          <span className="text-faint">–</span>
          <input className={controlClass} inputMode="decimal" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} aria-label="Maximum price" />
        </div>
        <Button type="submit" tone="secondary" className="mt-3 w-full">
          Apply price
        </Button>
      </form>
      <label className="flex cursor-pointer items-center gap-3 text-base font-semibold text-ink">
        <input
          type="checkbox"
          className="size-5 accent-sea"
          checked={Boolean(search.stock)}
          onChange={(e) => set({ stock: e.target.checked || undefined })}
        />
        In stock only
      </label>
      {filterCount > 0 || search.cat || search.q ? (
        <button
          type="button"
          className="text-left text-base font-semibold text-sea"
          onClick={() => {
            setMin("");
            setMax("");
            void navigate({ search: {}, replace: true });
            setFiltersOpen(false);
          }}
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl gap-4 px-3 pt-3 sm:px-5 sm:pt-5 lg:grid-cols-[1.15fr_1fr] lg:items-stretch">
        {!search.q && !search.cat ? (
          <Link to="/shop/about" className="block overflow-hidden rounded-2xl bg-white ring-1 ring-line sm:rounded-3xl" aria-label={`About ${SHOP.name}`}>
            <img
              src="/brand/banner-shop.webp"
              alt={`${SHOP.name} — online shopping, mobile accessories, electronics, fashion, home essentials and gifts. Quality products at affordable prices.`}
              width={1280}
              height={853}
              className="aspect-[3/2] w-full object-cover"
              fetchPriority="high"
            />
          </Link>
        ) : null}
        <div className={cn("flex flex-col justify-center rounded-2xl bg-navy p-4 text-on-navy sm:rounded-3xl sm:p-7", (search.q || search.cat) && "lg:col-span-2")}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
                <SamBee light /> Online Trading Center
              </h1>
              <p className="mt-1 font-semibold text-navy-muted italic">{SHOP.slogan}</p>
            </div>
            <Link to="/shop/about" className="text-sm font-bold text-white underline-offset-4 hover:underline">
              About us · Vision · Mission
            </Link>
          </div>
          <form onSubmit={submitSearch} className="mt-4 flex gap-2">
            <label className="flex h-13 min-w-0 flex-1 items-center gap-2 rounded-xl bg-card px-4 text-faint">
              <Search className="size-5 shrink-0" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search phones, chargers, clothing, walkers…"
                className="w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-faint"
                aria-label="Search products"
                type="search"
              />
            </label>
            <Button type="submit" className="h-13 bg-white px-5 text-navy hover:bg-mint">
              Search
            </Button>
          </form>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-muted">
            <li className="flex items-center gap-2"><Truck className="size-4 text-white" aria-hidden /> Free delivery</li>
            <li className="flex items-center gap-2"><Wallet className="size-4 text-white" aria-hidden /> Mobile Money or cash on delivery</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-white" aria-hidden /> Quality products at affordable prices</li>
          </ul>
        </div>
      </section>

      {/* Category chips */}
      <div className="mt-4 border-y border-line bg-card">
        <div className="scrollbar-none mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3">
          <button
            type="button"
            onClick={() => set({ cat: undefined })}
            className={cn(
              "h-10 shrink-0 rounded-full px-4 text-sm font-semibold",
              !search.cat ? "bg-navy text-on-navy" : "bg-paper text-navy hover:bg-sky",
            )}
          >
            All
          </button>
          {categories?.map((category) => {
            const Icon = categoryIcon(category.icon);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => set({ cat: category.slug })}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap",
                  search.cat === category.slug ? "bg-navy text-on-navy" : "bg-paper text-navy hover:bg-sky",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">{filtersPanel}</aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold text-ink">
                {search.q ? `Results for “${search.q}”` : (activeCategory?.name ?? "All products")}
              </h2>
              <p className="text-base text-faint">
                {products.data ? `${products.data.count} ${products.data.count === 1 ? "item" : "items"}` : "Loading…"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-card px-3 font-semibold text-navy lg:hidden"
              >
                <SlidersHorizontal className="size-4" aria-hidden /> Filters
                {filterCount ? <span className="rounded-full bg-sea px-1.5 text-xs text-on-sea">{filterCount}</span> : null}
              </button>
              <select
                className="h-11 rounded-xl border border-line bg-card px-3 text-base font-semibold text-navy"
                value={search.sort ?? "newest"}
                onChange={(e) => set({ sort: e.target.value === "newest" ? undefined : (e.target.value as ShopSearch["sort"]) })}
                aria-label="Sort products"
              >
                {SORTS.map((sort) => (
                  <option key={sort.id} value={sort.id}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            {products.isLoading ? (
              <ProductGridSkeleton />
            ) : products.isError ? (
              <EmptyState title="We could not load products">{products.error.message}</EmptyState>
            ) : products.data && products.data.products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {products.data.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {products.data.count > products.data.products.length ? (
                  <div className="mt-8 text-center">
                    <Button tone="secondary" onClick={() => setLimit((n) => n + 24)} disabled={products.isFetching}>
                      {products.isFetching ? "Loading…" : "Show more products"}
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyState
                icon={<Search className="size-6" />}
                title="No products match"
                action={
                  <Button tone="secondary" onClick={() => void navigate({ search: {} })}>
                    Clear search
                  </Button>
                }
              >
                Try a different word or category.
              </EmptyState>
            )}
          </div>

          <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl bg-mint p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-3 text-lg text-ink">
              <Store className="size-6 shrink-0 text-sea" aria-hidden />
              Sell your products to families in Assin Foso and beyond.
            </p>
            <Link to="/sell" className="inline-flex h-11 shrink-0 items-center rounded-xl bg-sea px-4 font-semibold text-on-sea">
              Open your shop — it's free
            </Link>
          </div>
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="absolute inset-0 bg-navy/60" aria-label="Close filters" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[min(22rem,90vw)] overflow-y-auto bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button type="button" onClick={() => setFiltersOpen(false)} className="grid size-10 place-items-center rounded-full bg-paper" aria-label="Close filters">
                <X className="size-5" />
              </button>
            </div>
            {filtersPanel}
          </div>
        </div>
      ) : null}
    </SiteShell>
  );
}
