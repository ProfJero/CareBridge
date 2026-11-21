import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Package, Pencil, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge, Btn, Card, Empty, ExportButton, FilterTabs, PageHeader, Pagination, SearchInput, Select, Table, downloadCsv, td, th } from "@/components/manage/kit";
import { ProductEditor } from "@/components/seller/seller-centre";
import { ProductImage } from "@/components/shop/product-image";
import { Modal } from "@/components/ui";
import { ghs } from "@/lib/format";
import { useCategories } from "@/lib/queries";
import { errText, must, sb } from "@/lib/supabase";
import type { Product, Store } from "@/lib/types";
import { cn } from "@/lib/cn";

const PAGE = 25;
type Tab = "all" | "active" | "draft" | "archived" | "low";

/** Used by the admin dashboard (all products) and by each seller (scoped to their shop). */
export function ProductsAdmin({ storeId }: { storeId?: string } = {}) {
  const isSeller = Boolean(storeId);
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [store, setStore] = useState("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  const products = useQuery({
    queryKey: ["admin-products", storeId ?? "all"],
    queryFn: async () => {
      let query = sb()
          .from("products")
          .select("*, store:stores(id,name,slug,town,verified,whatsapp,phone,logo_url), category:categories(id,name,slug,icon)")
          .order("created_at", { ascending: false })
          .limit(2000);
      if (storeId) query = query.eq("store_id", storeId);
      return must(await query) as Product[];
    },
  });
  const stores = useQuery({
    queryKey: ["admin-stores"],
    enabled: !isSeller,
    queryFn: async () => must(await sb().from("stores").select("*").order("name")) as Store[],
  });
  const houseStore = stores.data?.find((s) => s.slug === "sambee-care-essentials") ?? stores.data?.find((s) => !s.owner_id);
  const [newStore, setNewStore] = useState<string>("");
  useEffect(() => {
    if (storeId) setNewStore(storeId);
    else if (!newStore && houseStore) setNewStore(houseStore.id);
  }, [houseStore, newStore, storeId]);

  useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [tab, q, cat, store]);

  const all = useMemo(() => products.data ?? [], [products.data]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter(
      (p) =>
        (tab === "all" || (tab === "low" ? p.status === "active" && p.stock <= 3 : p.status === tab)) &&
        (cat === "all" || String(p.category_id) === cat) &&
        (store === "all" || p.store_id === store) &&
        (!needle || `${p.title} ${p.store?.name ?? ""} ${p.tags.join(" ")}`.toLowerCase().includes(needle)),
    );
  }, [all, tab, q, cat, store]);
  const pageRows = filtered.slice(page * PAGE, page * PAGE + PAGE);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["seller"] });
  };
  const bulk = useMutation({
    mutationFn: async (patch: Partial<Product> | "delete") => {
      const ids = [...selected];
      if (patch === "delete") must(await sb().from("products").delete().in("id", ids));
      else must(await sb().from("products").update(patch).in("id", ids));
      return ids.length;
    },
    onSuccess: (n) => {
      toast.success(`${n} product${n === 1 ? "" : "s"} updated`);
      setSelected(new Set());
      refresh();
    },
    onError: (e) => toast.error(errText(e)),
  });
  const feature = useMutation({
    mutationFn: async (p: Product) => must(await sb().from("products").update({ featured: !p.featured }).eq("id", p.id)),
    onSuccess: refresh,
    onError: (e) => toast.error(errText(e)),
  });

  const allOnPage = pageRows.length > 0 && pageRows.every((p) => selected.has(p.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const counts: Record<Tab, number> = {
    all: all.length,
    active: all.filter((p) => p.status === "active").length,
    draft: all.filter((p) => p.status === "draft").length,
    archived: all.filter((p) => p.status === "archived").length,
    low: all.filter((p) => p.status === "active" && p.stock <= 3).length,
  };

  return (
    <>
      <PageHeader
        title="Products"
        description={isSeller ? "Everything you sell. Products go live in the shop as soon as you publish them." : "Everything listed on the Online Trading Center, from every seller."}
        actions={
          <>
            <ExportButton
              onClick={() =>
                downloadCsv(
                  "products.csv",
                  filtered.map((p) => ({ title: p.title, seller: p.store?.name ?? "", category: p.category?.name ?? "", price: p.price, stock: p.stock, status: p.status, featured: p.featured, sold: p.sold_count, rating: p.rating_avg })),
                )
              }
            />
            <Btn tone="primary" onClick={() => setEditing("new")}>
              <Plus className="size-4" aria-hidden /> Add product
            </Btn>
          </>
        }
      />
      <Card flush>
        <FilterTabs
          tabs={[
            { id: "all", label: "All", count: counts.all },
            { id: "active", label: "Live", count: counts.active },
            { id: "draft", label: "Draft", count: counts.draft },
            { id: "archived", label: "Archived", count: counts.archived },
            { id: "low", label: "Low stock", count: counts.low },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="flex flex-wrap items-center gap-2 p-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search products" />
          <Select label="Category" value={cat} onChange={setCat} options={[{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]} />
          {isSeller ? null : (
            <Select label="Seller" value={store} onChange={setStore} options={[{ value: "all", label: "All sellers" }, ...(stores.data ?? []).map((s) => ({ value: s.id, label: s.name }))]} />
          )}
        </div>
        {selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-y border-line bg-mint px-3 py-2 text-sm">
            <strong className="mr-2">{selected.size} selected</strong>
            <Btn size="sm" onClick={() => bulk.mutate({ status: "active" })}>Publish</Btn>
            <Btn size="sm" onClick={() => bulk.mutate({ status: "draft" })}>Move to draft</Btn>
            <Btn size="sm" onClick={() => bulk.mutate({ status: "archived" })}>Archive</Btn>
            {isSeller ? null : (
              <>
                <Btn size="sm" onClick={() => bulk.mutate({ featured: true })}>Feature</Btn>
                <Btn size="sm" onClick={() => bulk.mutate({ featured: false })}>Unfeature</Btn>
              </>
            )}
            <Btn size="sm" tone="danger" onClick={() => window.confirm(`Delete ${selected.size} products? This cannot be undone.`) && bulk.mutate("delete")}>Delete</Btn>
          </div>
        ) : null}
        {products.isLoading ? (
          <div className="h-48 animate-pulse bg-paper" />
        ) : filtered.length === 0 ? (
          <Empty icon={<Package className="size-5" />} title="No products found" />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th className={`${th} w-10`}>
                    <input
                      type="checkbox"
                      className="size-4 accent-sea"
                      checked={allOnPage}
                      aria-label="Select all on this page"
                      onChange={() =>
                        setSelected((s) => {
                          const n = new Set(s);
                          for (const p of pageRows) {
                            if (allOnPage) n.delete(p.id);
                            else n.add(p.id);
                          }
                          return n;
                        })
                      }
                    />
                  </th>
                  <th className={th}>Product</th>
                  <th className={th}>Status</th>
                  <th className={th}>Inventory</th>
                  {isSeller ? <th className={th}>Views</th> : <th className={th}>Seller</th>}
                  <th className={th}>Category</th>
                  <th className={`${th} text-right`}>Price</th>
                  <th className={th}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p) => (
                  <tr key={p.id} className={cn("hover:bg-paper", selected.has(p.id) && "bg-sky")}>
                    <td className={td}>
                      <input type="checkbox" className="size-4 accent-sea" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Select ${p.title}`} />
                    </td>
                    <td className={td}>
                      <button type="button" onClick={() => setEditing(p)} className="flex items-center gap-3 text-left">
                        <span className="size-10 shrink-0 overflow-hidden rounded-lg border border-line">
                          <ProductImage src={p.images[0]} alt="" icon={p.category?.icon} seed={p.id} width={80} />
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[18rem] truncate font-bold text-ink hover:text-sea">{p.title}</span>
                          <span className="text-xs text-faint">{p.sold_count} sold{p.rating_count ? ` · ★ ${Number(p.rating_avg).toFixed(1)}` : ""}</span>
                        </span>
                      </button>
                    </td>
                    <td className={td}>
                      <Badge tone={p.status === "active" ? "green" : p.status === "draft" ? "amber" : "gray"}>{p.status === "active" ? "Live" : p.status === "draft" ? "Draft" : "Archived"}</Badge>
                    </td>
                    <td className={cn(td, "whitespace-nowrap", p.stock <= 0 ? "font-bold text-danger" : p.stock <= 3 ? "font-bold text-gold" : "text-muted")}>
                      {p.stock <= 0 ? "Out of stock" : `${p.stock} in stock`}
                    </td>
                    {isSeller ? <td className={`${td} text-muted tabular-nums`}>{p.view_count}</td> : <td className={`${td} text-muted`}>{p.store?.name}</td>}
                    <td className={`${td} text-muted`}>{p.category?.name ?? "—"}</td>
                    <td className={`${td} text-right font-bold whitespace-nowrap tabular-nums`}>{ghs(p.price)}</td>
                    <td className={`${td} whitespace-nowrap text-right`}>
                      {isSeller ? null : <button type="button" onClick={() => feature.mutate(p)} className="inline-grid size-8 place-items-center rounded-lg hover:bg-mint" aria-label={p.featured ? "Remove from featured" : "Feature on home page"} title={p.featured ? "Featured" : "Feature"}>
                        <Star className={cn("size-4", p.featured ? "fill-gold text-gold" : "text-faint")} />
                      </button>}
                      <button type="button" onClick={() => setEditing(p)} className="inline-grid size-8 place-items-center rounded-lg hover:bg-mint" aria-label={`Edit ${p.title}`}>
                        <Pencil className="size-4 text-faint" />
                      </button>
                      <Link to="/shop/product/$id" params={{ id: p.id }} target="_blank" className="inline-grid size-8 place-items-center rounded-lg hover:bg-mint" aria-label="View in shop">
                        <ExternalLink className="size-4 text-faint" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} pageSize={PAGE} total={filtered.length} onPage={setPage} />
          </>
        )}
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add product" : "Edit product"} wide>
        {editing === "new" && !isSeller ? (
          <div className="mb-4">
            <label className="grid gap-1.5 text-base font-semibold">
              Sell under
              <select className="h-12 rounded-xl border border-line px-3" value={newStore} onChange={(e) => setNewStore(e.target.value)}>
                {(stores.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
          </div>
        ) : null}
        {editing !== null && categories.length && (editing !== "new" || newStore) ? (
          <ProductEditor
            key={editing === "new" ? `new-${newStore}` : editing.id}
            storeId={editing === "new" ? newStore : editing.store_id}
            product={editing === "new" ? null : editing}
            categories={categories}
            onClose={() => setEditing(null)}
          />
        ) : null}
      </Modal>
    </>
  );
}
