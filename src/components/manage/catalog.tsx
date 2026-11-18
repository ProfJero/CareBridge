import { useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, ExternalLink, MessageSquare, Pencil, Plus, ShieldCheck, Star, Store as StoreIcon, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge, Btn, Card, Drawer, Empty, ExportButton, Field, FilterTabs, PageHeader, Pagination, SearchInput, Table, downloadCsv, inputCls, relTime, td, th } from "@/components/manage/kit";
import { categoryIcon } from "@/components/shop/product-image";
import { ghs, slugify } from "@/lib/format";
import { useSession } from "@/lib/session";
import { errText, must, sb } from "@/lib/supabase";
import type { Category, Order, Profile, Review, Store } from "@/lib/types";

const ICONS = ["package", "accessibility", "activity", "droplets", "apple", "home", "bed", "cross", "shirt", "gift", "smartphone", "laptop"];

// ───────────────────────── Categories ─────────────────────────

export function CategoriesAdmin() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const cats = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const [c, p] = await Promise.all([sb().from("categories").select("*").order("sort"), sb().from("products").select("category_id").limit(5000)]);
      const counts = new Map<number, number>();
      for (const row of (p.data ?? []) as { category_id: number | null }[]) if (row.category_id) counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
      return { list: must(c) as Category[], counts };
    },
  });
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  };
  const remove = useMutation({
    mutationFn: async (id: number) => must(await sb().from("categories").delete().eq("id", id)),
    onSuccess: () => {
      toast.success("Category deleted — its products are now uncategorised");
      refresh();
    },
    onError: (e) => toast.error(errText(e)),
  });

  return (
    <>
      <PageHeader title="Categories" description="Organise how customers browse the shop." actions={<Btn tone="primary" onClick={() => setEditing("new")}><Plus className="size-4" aria-hidden /> Add category</Btn>} />
      <Card flush>
        {cats.isLoading ? (
          <div className="h-40 animate-pulse bg-paper" />
        ) : (
          <Table>
            <thead>
              <tr>
                <th className={th}>Category</th>
                <th className={th}>Web address</th>
                <th className={th}>Products</th>
                <th className={th}>Order</th>
                <th className={th}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {(cats.data?.list ?? []).map((c) => {
                const Icon = categoryIcon(c.icon);
                return (
                  <tr key={c.id} className="hover:bg-paper">
                    <td className={td}>
                      <span className="flex items-center gap-2.5 font-bold">
                        <span className="grid size-8 place-items-center rounded-lg bg-mint text-sea"><Icon className="size-4" aria-hidden /></span>
                        {c.name}
                      </span>
                    </td>
                    <td className={`${td} text-faint`}>/shop?cat={c.slug}</td>
                    <td className={td}>{cats.data?.counts.get(c.id) ?? 0}</td>
                    <td className={td}>{c.sort}</td>
                    <td className={`${td} text-right whitespace-nowrap`}>
                      <button type="button" onClick={() => setEditing(c)} className="inline-grid size-8 place-items-center rounded-lg hover:bg-mint" aria-label={`Edit ${c.name}`}><Pencil className="size-4 text-faint" /></button>
                      <button type="button" onClick={() => window.confirm(`Delete “${c.name}”?`) && remove.mutate(c.id)} className="inline-grid size-8 place-items-center rounded-lg hover:bg-danger-bg" aria-label={`Delete ${c.name}`}><Trash2 className="size-4 text-danger" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
      <Drawer open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New category" : "Edit category"}>
        {editing !== null ? <CategoryForm category={editing === "new" ? null : editing} onDone={() => { setEditing(null); refresh(); }} /> : null}
      </Drawer>
    </>
  );
}

function CategoryForm({ category, onDone }: { category: Category | null; onDone: () => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "package");
  const [sort, setSort] = useState(String(category?.sort ?? 20));
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Enter a category name.");
    setBusy(true);
    const row = { name: name.trim(), slug: slugify(name), icon, sort: Number(sort) || 0 };
    const res = category ? await sb().from("categories").update(row).eq("id", category.id) : await sb().from("categories").insert(row);
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Category saved");
    onDone();
  }
  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Icon">
        <div className="flex flex-wrap gap-2">
          {ICONS.map((i) => {
            const Icon = categoryIcon(i);
            return (
              <button key={i} type="button" onClick={() => setIcon(i)} aria-pressed={icon === i} aria-label={i} className={`grid size-10 place-items-center rounded-lg border ${icon === i ? "border-sea bg-mint text-sea" : "border-line text-faint"}`}>
                <Icon className="size-5" />
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Display order" hint="Lower numbers show first."><input className={inputCls} value={sort} onChange={(e) => setSort(e.target.value)} inputMode="numeric" /></Field>
      <div className="flex justify-end"><Btn type="submit" tone="primary" disabled={busy}>{busy ? "Saving…" : "Save category"}</Btn></div>
    </form>
  );
}

// ───────────────────────── Sellers ─────────────────────────

export function SellersAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | "active" | "suspended" | "unverified">("all");
  const [q, setQ] = useState("");
  const data = useQuery({
    queryKey: ["admin-sellers"],
    queryFn: async () => {
      const [stores, products, items] = await Promise.all([
        sb().from("stores").select("*").order("created_at", { ascending: false }),
        sb().from("products").select("store_id,status").limit(5000),
        sb().from("order_items").select("store_id,quantity,unit_price,status").limit(10000),
      ]);
      const stats = new Map<string, { products: number; sales: number; orders: number }>();
      for (const p of (products.data ?? []) as { store_id: string; status: string }[]) {
        const s = stats.get(p.store_id) ?? { products: 0, sales: 0, orders: 0 };
        if (p.status === "active") s.products++;
        stats.set(p.store_id, s);
      }
      for (const i of (items.data ?? []) as { store_id: string | null; quantity: number; unit_price: number; status: string }[]) {
        if (!i.store_id) continue;
        const s = stats.get(i.store_id) ?? { products: 0, sales: 0, orders: 0 };
        s.orders++;
        if (i.status === "delivered") s.sales += i.quantity * Number(i.unit_price);
        stats.set(i.store_id, s);
      }
      return { stores: must(stores) as Store[], stats };
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Store> }) => must(await sb().from("stores").update(patch).eq("id", id)),
    onSuccess: () => {
      toast.success("Seller updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e) => toast.error(errText(e)),
  });
  const stores = data.data?.stores ?? [];
  const rows = stores.filter(
    (s) =>
      (tab === "all" || (tab === "unverified" ? !s.verified : s.status === tab)) &&
      (!q.trim() || `${s.name} ${s.town} ${s.phone}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  return (
    <>
      <PageHeader title="Sellers" description="Shops trading on the Online Trading Center. Verify trusted sellers or pause a shop." />
      <Card flush>
        <FilterTabs
          tabs={[
            { id: "all", label: "All", count: stores.length },
            { id: "active", label: "Active", count: stores.filter((s) => s.status === "active").length },
            { id: "unverified", label: "Not verified", count: stores.filter((s) => !s.verified).length },
            { id: "suspended", label: "Paused", count: stores.filter((s) => s.status === "suspended").length },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="p-3"><SearchInput value={q} onChange={setQ} placeholder="Search sellers" /></div>
        {rows.length === 0 ? (
          <Empty icon={<StoreIcon className="size-5" />} title="No sellers found" />
        ) : (
          <Table>
            <thead>
              <tr>
                <th className={th}>Shop</th>
                <th className={th}>Status</th>
                <th className={th}>Live products</th>
                <th className={th}>Order items</th>
                <th className={th}>Delivered sales</th>
                <th className={th}>Joined</th>
                <th className={th}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const st = data.data?.stats.get(s.id);
                return (
                  <tr key={s.id} className="hover:bg-paper">
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-mint font-bold text-sea">
                          {s.logo_url ? <img src={s.logo_url} alt="" className="size-full object-cover" /> : s.name[0]}
                        </span>
                        <div>
                          <p className="flex items-center gap-1 font-bold">{s.name}{s.verified ? <BadgeCheck className="size-4 text-sea" aria-label="Verified" /> : null}</p>
                          <p className="text-xs text-faint">{s.town} · {s.phone || "no phone"}{s.owner_id ? "" : " · managed by SamBee"}</p>
                        </div>
                      </div>
                    </td>
                    <td className={td}><Badge tone={s.status === "active" ? "green" : "red"}>{s.status === "active" ? "Active" : "Paused"}</Badge></td>
                    <td className={td}>{st?.products ?? 0}</td>
                    <td className={td}>{st?.orders ?? 0}</td>
                    <td className={`${td} font-bold tabular-nums`}>{ghs(st?.sales ?? 0)}</td>
                    <td className={`${td} text-faint`}>{relTime(s.created_at)}</td>
                    <td className={`${td} whitespace-nowrap text-right`}>
                      <div className="flex justify-end gap-1.5">
                        <Btn size="sm" onClick={() => update.mutate({ id: s.id, patch: { verified: !s.verified } })}>{s.verified ? "Unverify" : "Verify"}</Btn>
                        <Btn size="sm" tone={s.status === "active" ? "danger" : "secondary"} onClick={() => update.mutate({ id: s.id, patch: { status: s.status === "active" ? "suspended" : "active" } })}>
                          {s.status === "active" ? "Pause" : "Activate"}
                        </Btn>
                        <Link to="/shop/store/$slug" params={{ slug: s.slug }} target="_blank" className="inline-grid size-8 place-items-center rounded-lg hover:bg-mint" aria-label="View shop"><ExternalLink className="size-4 text-faint" /></Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}

// ───────────────────────── Customers ─────────────────────────

export function CustomersAdmin({ initialQuery }: { initialQuery?: string }) {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  const [q, setQ] = useState(initialQuery ?? "");
  const [tab, setTab] = useState<"all" | "buyers" | "admins">("all");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<Profile | null>(null);
  const data = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [profiles, orders, stores] = await Promise.all([
        sb().from("profiles").select("*").order("created_at", { ascending: false }).limit(5000),
        sb().from("orders").select("id,order_number,buyer_id,total,status,created_at").limit(10000),
        sb().from("stores").select("owner_id,name"),
      ]);
      return { profiles: must(profiles) as (Profile & { created_at: string })[], orders: must(orders) as Order[], stores: (stores.data ?? []) as { owner_id: string | null; name: string }[] };
    },
  });
  const stats = useMemo(() => {
    const m = new Map<string, { count: number; spent: number; last: string }>();
    for (const o of data.data?.orders ?? []) {
      if (o.status === "cancelled") continue;
      const s = m.get(o.buyer_id) ?? { count: 0, spent: 0, last: "" };
      s.count++;
      s.spent += Number(o.total);
      if (o.created_at > s.last) s.last = o.created_at;
      m.set(o.buyer_id, s);
    }
    return m;
  }, [data.data]);
  const shopOf = new Map((data.data?.stores ?? []).filter((s) => s.owner_id).map((s) => [s.owner_id!, s.name]));
  const profiles = data.data?.profiles ?? [];
  const rows = profiles.filter(
    (p) =>
      (tab === "all" || (tab === "admins" ? p.is_admin : stats.has(p.id))) &&
      (!q.trim() || `${p.full_name} ${p.email ?? ""} ${p.phone}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const setAdmin = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => must(await sb().from("profiles").update({ is_admin: value }).eq("id", id)),
    onSuccess: () => {
      toast.success("Access updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      setOpen(null);
    },
    onError: (e) => toast.error(errText(e)),
  });
  const PAGE = 25;
  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone with an account: shoppers, sellers and staff."
        actions={<ExportButton onClick={() => downloadCsv("customers.csv", rows.map((p) => ({ name: p.full_name, email: p.email, phone: p.phone, orders: stats.get(p.id)?.count ?? 0, spent: stats.get(p.id)?.spent ?? 0, admin: p.is_admin, shop: shopOf.get(p.id) ?? "" })))} />}
      />
      <Card flush>
        <FilterTabs
          tabs={[
            { id: "all", label: "All", count: profiles.length },
            { id: "buyers", label: "Have ordered", count: profiles.filter((p) => stats.has(p.id)).length },
            { id: "admins", label: "Admins", count: profiles.filter((p) => p.is_admin).length },
          ]}
          value={tab}
          onChange={(t) => {
            setTab(t);
            setPage(0);
          }}
        />
        <div className="p-3"><SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Name, email or phone" /></div>
        {rows.length === 0 ? (
          <Empty icon={<Users className="size-5" />} title="No customers found" />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th className={th}>Customer</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Orders</th>
                  <th className={th}>Total spent</th>
                  <th className={th}>Last order</th>
                  <th className={th}>Role</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(page * PAGE, page * PAGE + PAGE).map((p) => {
                  const s = stats.get(p.id);
                  return (
                    <tr key={p.id} className="cursor-pointer hover:bg-paper" onClick={() => setOpen(p)}>
                      <td className={td}>
                        <p className="font-bold">{p.full_name || "—"}</p>
                        <p className="text-xs text-faint">{p.email}</p>
                      </td>
                      <td className={td}>{p.phone || "—"}</td>
                      <td className={td}>{s?.count ?? 0}</td>
                      <td className={`${td} font-bold tabular-nums`}>{ghs(s?.spent ?? 0)}</td>
                      <td className={`${td} text-faint`}>{s?.last ? relTime(s.last) : "—"}</td>
                      <td className={td}>
                        <div className="flex flex-wrap gap-1">
                          {p.is_admin ? <Badge tone="navy">Admin</Badge> : null}
                          {shopOf.has(p.id) ? <Badge tone="blue">Seller</Badge> : null}
                          {!p.is_admin && !shopOf.has(p.id) ? <Badge>Customer</Badge> : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination page={page} pageSize={PAGE} total={rows.length} onPage={setPage} />
          </>
        )}
      </Card>
      <Drawer open={Boolean(open)} onClose={() => setOpen(null)} title={open?.full_name || open?.email || "Customer"} subtitle={open?.email}>
        {open ? (
          <div className="grid gap-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-paper p-3"><p className="text-xs text-faint">Orders</p><p className="text-xl font-extrabold">{stats.get(open.id)?.count ?? 0}</p></div>
              <div className="rounded-lg bg-paper p-3"><p className="text-xs text-faint">Total spent</p><p className="text-xl font-extrabold">{ghs(stats.get(open.id)?.spent ?? 0)}</p></div>
            </div>
            <p><strong>Phone:</strong> {open.phone || "—"}</p>
            {shopOf.has(open.id) ? <p><strong>Shop:</strong> {shopOf.get(open.id)}</p> : null}
            <div>
              <h3 className="mb-2 text-xs font-bold tracking-wide text-faint uppercase">Recent orders</h3>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {(data.data?.orders ?? []).filter((o) => o.buyer_id === open.id).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8).map((o) => (
                  <li key={o.id} className="flex justify-between gap-2 p-2.5"><span className="font-bold">{o.order_number}</span><span className="text-faint">{relTime(o.created_at)}</span><span className="font-bold">{ghs(o.total)}</span></li>
                ))}
                {!stats.has(open.id) ? <li className="p-3 text-faint">No orders yet.</li> : null}
              </ul>
            </div>
            <div className="rounded-lg border border-line p-3">
              <h3 className="flex items-center gap-1.5 font-bold"><ShieldCheck className="size-4 text-sea" aria-hidden /> Admin access</h3>
              <p className="mt-1 text-faint">Admins can see every order, customer and request, and change any product or seller.</p>
              <div className="mt-3">
                {open.is_admin ? (
                  <Btn tone="danger" disabled={open.id === userId} onClick={() => setAdmin.mutate({ id: open.id, value: false })}>
                    {open.id === userId ? "This is you" : "Remove admin access"}
                  </Btn>
                ) : (
                  <Btn tone="primary" onClick={() => window.confirm(`Give ${open.email} full admin access?`) && setAdmin.mutate({ id: open.id, value: true })}>Make admin</Btn>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

// ───────────────────────── Reviews ─────────────────────────

export function ReviewsAdmin() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [rating, setRating] = useState("all");
  const reviews = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => must(await sb().from("reviews").select("*, product:products(id,title)").order("created_at", { ascending: false }).limit(1000)) as (Review & { product: { id: string; title: string } | null })[],
  });
  const remove = useMutation({
    mutationFn: async (id: string) => must(await sb().from("reviews").delete().eq("id", id)),
    onSuccess: () => {
      toast.success("Review removed");
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (e) => toast.error(errText(e)),
  });
  const rows = (reviews.data ?? []).filter(
    (r) => (rating === "all" || String(r.rating) === rating) && (!q.trim() || `${r.author_name} ${r.comment} ${r.product?.title ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const avg = reviews.data?.length ? reviews.data.reduce((s, r) => s + r.rating, 0) / reviews.data.length : 0;
  return (
    <>
      <PageHeader title="Reviews" description={reviews.data?.length ? `${reviews.data.length} reviews · average ★ ${avg.toFixed(1)}` : "Product reviews from verified buyers."} />
      <Card flush>
        <div className="flex flex-wrap gap-2 p-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search reviews" />
          <select className="h-9 rounded-lg border border-line px-2.5 text-sm font-semibold" value={rating} onChange={(e) => setRating(e.target.value)} aria-label="Rating">
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </select>
        </div>
        {rows.length === 0 ? (
          <Empty icon={<MessageSquare className="size-5" />} title="No reviews yet">Customers can review products after ordering them.</Empty>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start gap-3 p-4">
                <div className="min-w-[14rem] flex-1">
                  <p className="flex items-center gap-2 text-sm">
                    <span className="inline-flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`size-4 ${n <= r.rating ? "fill-gold text-gold" : "text-line"}`} aria-hidden />)}</span>
                    <strong>{r.author_name || "Buyer"}</strong>
                    <span className="text-faint">· {relTime(r.created_at)}</span>
                  </p>
                  {r.product ? <Link to="/shop/product/$id" params={{ id: r.product.id }} className="text-sm font-bold text-sea">{r.product.title}</Link> : null}
                  {r.comment ? <p className="mt-1 text-sm text-muted">{r.comment}</p> : null}
                </div>
                <Btn size="sm" tone="danger" onClick={() => window.confirm("Remove this review?") && remove.mutate(r.id)}>
                  <Trash2 className="size-3.5" aria-hidden /> Remove
                </Btn>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}


