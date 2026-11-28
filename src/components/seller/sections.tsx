import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import QRCode from "qrcode";
import {
  Banknote,
  CheckCircle2,
  Circle,
  Copy,
  Download,
  Eye,
  Facebook,
  MessageCircle,
  Package,
  Phone,
  Printer,
  Share2,
  ShoppingCart,
  Star,
  TicketPercent,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Btn,
  Card,
  Empty,
  ExportButton,
  Field,
  FilterTabs,
  Kpi,
  PageHeader,
  SearchInput,
  Select,
  Table,
  downloadCsv,
  inputCls,
  orderTone,
  payTone,
  relTime,
  td,
  th,
} from "@/components/manage/kit";
import { ProductImage } from "@/components/shop/product-image";
import { VideoCard, VideoEmbed } from "@/components/video-player";
import { Modal } from "@/components/ui";
import type { SellerSection } from "@/components/seller/layout";
import { SHOP } from "@/lib/config";
import { STATUS_LABEL, dateTime, ghs, waLink } from "@/lib/format";
import { usePlatformSettings, useTutorials } from "@/lib/queries";
import { errText, must, sb } from "@/lib/supabase";
import type { Coupon, Order, OrderItem, OrderStatus, Product, Review, Store, Video } from "@/lib/types";
import { cn } from "@/lib/cn";

// ───────────────────────── data ─────────────────────────

export type SellerItem = OrderItem & { order: Order | null };

export function useSellerData(storeId: string) {
  const items = useQuery({
    queryKey: ["seller", "items", storeId],
    queryFn: async () =>
      must(await sb().from("order_items").select("*, order:orders(*)").eq("store_id", storeId).order("created_at", { ascending: false }).limit(2000)) as SellerItem[],
  });
  const products = useQuery({
    queryKey: ["seller", "products", storeId],
    queryFn: async () =>
      must(
        await sb()
          .from("products")
          .select("id,title,price,stock,status,images,video_url,view_count,sold_count,rating_avg,rating_count,created_at")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false }),
      ) as Product[],
  });
  return { items, products };
}

export const shopUrl = (store: Store) => (typeof window === "undefined" ? `/shop/store/${store.slug}` : `${window.location.origin}/shop/store/${store.slug}`);
const productUrl = (id: string) => (typeof window === "undefined" ? `/shop/product/${id}` : `${window.location.origin}/shop/product/${id}`);

async function copy(text: string, what = "Link") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`);
  } catch {
    window.prompt("Copy this:", text);
  }
}

// ───────────────────────── overview ─────────────────────────

export function SellerOverview({ store, onSection }: { store: Store; onSection: (s: SellerSection) => void }) {
  const { items, products } = useSellerData(store.id);
  const [days, setDays] = useState("30");
  const coupons = useQuery({
    queryKey: ["seller", "coupons", store.id],
    queryFn: async () => must(await sb().from("coupons").select("id").eq("store_id", store.id)) as { id: string }[],
  });

  const stats = useMemo(() => {
    const since = Date.now() - Number(days) * 86400_000;
    const rows = (items.data ?? []).filter((i) => new Date(i.created_at).getTime() >= since && i.status !== "cancelled");
    const delivered = rows.filter((i) => i.status === "delivered");
    const revenue = delivered.reduce((s, i) => s + i.quantity * Number(i.unit_price), 0);
    const gross = rows.reduce((s, i) => s + i.quantity * Number(i.unit_price), 0);
    const orders = new Set(rows.map((i) => i.order_id)).size;
    const buyers = new Set(rows.map((i) => i.order?.buyer_id).filter(Boolean)).size;
    const productViews = (products.data ?? []).reduce((s, p) => s + p.view_count, 0);
    const byDay = new Map<string, number>();
    for (let d = Number(days) - 1; d >= 0; d--) byDay.set(new Date(Date.now() - d * 86400_000).toISOString().slice(0, 10), 0);
    for (const i of rows) {
      const k = i.created_at.slice(0, 10);
      if (byDay.has(k)) byDay.set(k, (byDay.get(k) ?? 0) + i.quantity * Number(i.unit_price));
    }
    return {
      revenue,
      gross,
      orders,
      buyers,
      productViews,
      conversion: productViews ? (orders / productViews) * 100 : 0,
      pending: (items.data ?? []).filter((i) => i.status === "pending").length,
      series: [...byDay.entries()].map(([date, total]) => ({ label: new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }), total })),
    };
  }, [items.data, products.data, days]);

  const list = products.data ?? [];
  const checklist = [
    { done: list.length > 0, label: "Add your first product", action: () => onSection("products") },
    { done: Boolean(store.logo_url), label: "Upload a shop logo", action: () => onSection("settings") },
    { done: Boolean(store.whatsapp), label: "Add your WhatsApp number", action: () => onSection("settings") },
    { done: Boolean(store.facebook_url || store.youtube_url), label: "Link Facebook or YouTube", action: () => onSection("settings") },
    { done: Boolean(store.video_url) || list.some((p) => p.video_url), label: "Add a short product video", action: () => onSection(list.length ? "products" : "settings") },
    { done: (coupons.data?.length ?? 0) > 0, label: "Create a promo code", action: () => onSection("promos") },
    { done: store.view_count > 0, label: "Share your shop link", action: () => onSection("marketing") },
  ];
  const done = checklist.filter((c) => c.done).length;

  return (
    <>
      <PageHeader
        title={`Welcome back to ${store.name}`}
        description="Your shop at a glance."
        actions={
          <Select
            label="Date range"
            value={days}
            onChange={setDays}
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 90 days" },
              { value: "365", label: "Last 12 months" },
            ]}
          />
        }
      />

      {done < checklist.length ? (
        <Card title={`Set up your shop — ${done} of ${checklist.length} done`} className="mb-4">
          <div className="mb-3 h-2 rounded-full bg-paper">
            <div className="h-2 rounded-full bg-leaf transition-all" style={{ width: `${(done / checklist.length) * 100}%` }} />
          </div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {checklist.map((c) => (
              <li key={c.label}>
                <button type="button" onClick={c.action} disabled={c.done} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-paper disabled:cursor-default">
                  {c.done ? <CheckCircle2 className="size-5 shrink-0 text-leaf" aria-hidden /> : <Circle className="size-5 shrink-0 text-line" aria-hidden />}
                  <span className={cn("font-semibold", c.done ? "text-faint line-through" : "text-ink")}>{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {stats.pending ? (
        <button type="button" onClick={() => onSection("orders")} className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold-bg px-3 py-2 text-sm font-bold text-gold">
          <ShoppingCart className="size-4" aria-hidden /> {stats.pending} new order item{stats.pending === 1 ? "" : "s"} waiting for you to accept
        </button>
      ) : null}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="Delivered sales" value={ghs(stats.revenue)} hint={`${ghs(stats.gross)} ordered`} icon={<Banknote className="size-4" />} tone="green" />
        <Kpi label="Orders" value={stats.orders} hint={`${stats.buyers} customer${stats.buyers === 1 ? "" : "s"}`} icon={<ShoppingCart className="size-4" />} />
        <Kpi label="Shop & product views" value={(store.view_count + stats.productViews).toLocaleString()} hint={`${store.view_count} shop · ${stats.productViews} product (all time)`} icon={<Eye className="size-4" />} />
        <Kpi label="Conversion" value={`${stats.conversion.toFixed(1)}%`} hint="orders per product view" icon={<TrendingUp className="size-4" />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Sales over time" action={<span className="text-xs text-faint">GH₵ per day, excludes cancelled</span>}>
          <div className="h-64" role="img" aria-label="Chart of your sales per day">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="sellerFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a45d8" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#1a45d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e8ecf6" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#5e6a88", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#dce3f3" }} minTickGap={24} />
                <YAxis tick={{ fill: "#5e6a88", fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #dce3f3", fontSize: 13 }} formatter={(v: number) => [ghs(v), "Sales"]} />
                <Area type="monotone" dataKey="total" stroke="#1a45d8" strokeWidth={2} fill="url(#sellerFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Top products" flush action={<button type="button" onClick={() => onSection("products")} className="inline-flex min-h-7 items-center px-1 text-xs font-bold text-sea">All products</button>}>
          <ul>
            {[...list].sort((a, b) => b.sold_count - a.sold_count || b.view_count - a.view_count).slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-sm last:border-0">
                <span className="size-9 shrink-0 overflow-hidden rounded-lg border border-line"><ProductImage src={p.images[0]} alt="" seed={p.id} width={80} /></span>
                <span className="min-w-0 flex-1 truncate font-semibold">{p.title}</span>
                <span className="text-xs text-faint"><Eye className="inline size-3.5" aria-hidden /> {p.view_count}</span>
                <span className="text-xs font-bold">{p.sold_count} sold</span>
              </li>
            ))}
            {list.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-faint">
                No products yet. <button type="button" className="font-bold text-sea" onClick={() => onSection("products")}>Add your first product</button>
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
    </>
  );
}

// ───────────────────────── orders ─────────────────────────

const NEXT: Record<OrderStatus, { to: OrderStatus; label: string }[]> = {
  pending: [{ to: "confirmed", label: "Accept" }],
  confirmed: [{ to: "shipped", label: "Mark sent" }],
  shipped: [{ to: "delivered", label: "Mark delivered" }],
  delivered: [],
  cancelled: [],
};

export function SellerOrders({ store }: { store: Store }) {
  const queryClient = useQueryClient();
  const { items } = useSellerData(store.id);
  const [tab, setTab] = useState<"open" | OrderStatus | "all">("open");
  const [q, setQ] = useState("");
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => must(await sb().rpc("set_order_item_status", { p_item: id, p_status: status })),
    onSuccess: () => {
      toast.success("Order updated");
      void queryClient.invalidateQueries({ queryKey: ["seller"] });
    },
    onError: (e) => toast.error(errText(e)),
  });

  const groups = useMemo(() => {
    const map = new Map<string, { order: Order; items: SellerItem[] }>();
    for (const it of items.data ?? []) {
      if (!it.order) continue;
      const g = map.get(it.order_id) ?? { order: it.order, items: [] };
      g.items.push(it);
      map.set(it.order_id, g);
    }
    return [...map.values()];
  }, [items.data]);
  const statusOf = (g: { items: SellerItem[] }): OrderStatus => {
    const s = g.items.map((i) => i.status);
    if (s.every((x) => x === "cancelled")) return "cancelled";
    if (s.every((x) => x === "delivered" || x === "cancelled")) return "delivered";
    if (s.some((x) => x === "pending")) return "pending";
    if (s.some((x) => x === "confirmed")) return "confirmed";
    return "shipped";
  };
  const rows = groups.filter((g) => {
    const st = statusOf(g);
    const okTab = tab === "all" || (tab === "open" ? st === "pending" || st === "confirmed" || st === "shipped" : st === tab);
    const needle = q.trim().toLowerCase();
    return okTab && (!needle || `${g.order.order_number} ${g.order.shipping_name} ${g.order.shipping_phone}`.toLowerCase().includes(needle));
  });
  const count = (fn: (s: OrderStatus) => boolean) => groups.filter((g) => fn(statusOf(g))).length;

  return (
    <>
      <PageHeader
        title="Orders"
        description="Accept new orders, send them out and mark them delivered. Customers see every update."
        actions={
          <ExportButton
            onClick={() =>
              downloadCsv(
                "my-orders.csv",
                rows.flatMap((g) => g.items.map((i) => ({ order: g.order.order_number, date: i.created_at, customer: g.order.shipping_name, phone: g.order.shipping_phone, item: i.title, qty: i.quantity, price: i.unit_price, status: i.status, payment: g.order.payment_method }))),
              )
            }
          />
        }
      />
      <Card flush>
        <FilterTabs
          tabs={[
            { id: "open", label: "Needs action", count: count((s) => s === "pending" || s === "confirmed" || s === "shipped") },
            { id: "pending", label: "New", count: count((s) => s === "pending") },
            { id: "delivered", label: "Delivered", count: count((s) => s === "delivered") },
            { id: "cancelled", label: "Cancelled", count: count((s) => s === "cancelled") },
            { id: "all", label: "All", count: groups.length },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="p-3"><SearchInput value={q} onChange={setQ} placeholder="Order no., name or phone" /></div>
        {items.isLoading ? (
          <div className="h-40 animate-pulse bg-paper" />
        ) : rows.length === 0 ? (
          <Empty icon={<ShoppingCart className="size-5" />} title={groups.length ? "Nothing here" : "No orders yet"}>
            {groups.length ? "Try another tab." : "Share your shop link from Marketing to get your first order."}
          </Empty>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {rows.map((g) => (
              <li key={g.order.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-bold">
                      {g.order.order_number} <Badge tone={orderTone(statusOf(g))}>{STATUS_LABEL[statusOf(g)]}</Badge>
                      <Badge tone={payTone(g.order.payment_status)}>{g.order.payment_method === "momo" ? "MoMo" : "Cash"} · {g.order.payment_status}</Badge>
                    </p>
                    <p className="text-xs text-faint">{dateTime(g.order.created_at)}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold">{g.order.shipping_name}</p>
                    <p className="text-faint">{g.order.delivery_method === "pickup" ? "Pickup" : `${g.order.shipping_address}, ${g.order.shipping_town}`}</p>
                    <div className="mt-1 flex justify-end gap-1.5">
                      <a href={`tel:${g.order.shipping_phone}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2 text-xs font-bold"><Phone className="size-3.5" aria-hidden /> Call</a>
                      <a href={waLink(g.order.shipping_phone, `Hello ${g.order.shipping_name}, this is ${store.name} about your JonnyBee order ${g.order.order_number}.`)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#137a3e] px-2 text-xs font-bold text-white">
                        <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
                {g.order.notes ? <p className="mt-2 rounded-lg bg-gold-bg px-3 py-2 text-sm">Note: {g.order.notes}</p> : null}
                <ul className="mt-3 grid gap-2">
                  {g.items.map((i) => (
                    <li key={i.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-2.5">
                      <span className="size-10 shrink-0 overflow-hidden rounded-lg"><ProductImage src={i.image} alt="" seed={i.product_id ?? i.id} width={80} /></span>
                      <span className="min-w-[9rem] flex-1 text-sm">
                        <strong className="block">{i.title}</strong>
                        <span className="text-faint">{i.quantity} × {ghs(i.unit_price)} = {ghs(i.quantity * Number(i.unit_price))}</span>
                      </span>
                      <Badge tone={orderTone(i.status)}>{STATUS_LABEL[i.status]}</Badge>
                      {NEXT[i.status].map((n) => (
                        <Btn key={n.to} size="sm" tone="primary" disabled={update.isPending} onClick={() => update.mutate({ id: i.id, status: n.to })}>{n.label}</Btn>
                      ))}
                      {i.status === "pending" || i.status === "confirmed" ? (
                        <Btn size="sm" tone="danger" disabled={update.isPending} onClick={() => window.confirm("Cancel this item? Stock goes back to your shop.") && update.mutate({ id: i.id, status: "cancelled" })}>Cancel</Btn>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

// ───────────────────────── customers ─────────────────────────

export function SellerCustomers({ store }: { store: Store }) {
  const { items } = useSellerData(store.id);
  const [q, setQ] = useState("");
  const customers = useMemo(() => {
    const m = new Map<string, { name: string; phone: string; town: string; orders: Set<string>; spent: number; last: string }>();
    for (const i of items.data ?? []) {
      if (!i.order || i.status === "cancelled") continue;
      const key = i.order.buyer_id;
      const c = m.get(key) ?? { name: i.order.shipping_name, phone: i.order.shipping_phone, town: i.order.shipping_town, orders: new Set(), spent: 0, last: "" };
      c.orders.add(i.order_id);
      c.spent += i.quantity * Number(i.unit_price);
      if (i.created_at > c.last) c.last = i.created_at;
      m.set(key, c);
    }
    return [...m.values()].sort((a, b) => b.spent - a.spent);
  }, [items.data]);
  const rows = customers.filter((c) => !q.trim() || `${c.name} ${c.phone} ${c.town}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <PageHeader
        title="Customers"
        description="People who have bought from your shop. Message them about new stock and promo codes."
        actions={<ExportButton onClick={() => downloadCsv("my-customers.csv", rows.map((c) => ({ name: c.name, phone: c.phone, town: c.town, orders: c.orders.size, spent: c.spent.toFixed(2), last_order: c.last })))} />}
      />
      <Card flush>
        <div className="p-3"><SearchInput value={q} onChange={setQ} placeholder="Name, phone or town" /></div>
        {rows.length === 0 ? (
          <Empty icon={<Users className="size-5" />} title="No customers yet">Your buyers appear here after their first order.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th className={th}>Customer</th>
                <th className={th}>Town</th>
                <th className={th}>Orders</th>
                <th className={th}>Spent</th>
                <th className={th}>Last order</th>
                <th className={th}><span className="sr-only">Contact</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={`${c.name}-${c.phone}`} className="hover:bg-paper">
                  <td className={td}><p className="font-bold">{c.name}</p><p className="text-xs text-faint">{c.phone}</p></td>
                  <td className={td}>{c.town}</td>
                  <td className={td}>{c.orders.size}</td>
                  <td className={`${td} font-bold tabular-nums`}>{ghs(c.spent)}</td>
                  <td className={`${td} text-faint`}>{relTime(c.last)}</td>
                  <td className={`${td} text-right`}>
                    <a href={waLink(c.phone, `Hello ${c.name}, thank you for shopping at ${store.name} on JonnyBee!`)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#137a3e] px-2.5 text-xs font-bold text-white">
                      <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}

// ───────────────────────── reviews ─────────────────────────

export function SellerReviews({ store }: { store: Store }) {
  const { products } = useSellerData(store.id);
  const ids = (products.data ?? []).map((p) => p.id);
  const reviews = useQuery({
    queryKey: ["seller", "reviews", store.id, ids.length],
    enabled: ids.length > 0,
    queryFn: async () => must(await sb().from("reviews").select("*, product:products(id,title)").in("product_id", ids).order("created_at", { ascending: false })) as (Review & { product: { id: string; title: string } | null })[],
  });
  const list = reviews.data ?? [];
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  return (
    <>
      <PageHeader title="Reviews" description={list.length ? `${list.length} reviews · average ★ ${avg.toFixed(1)}` : "What customers say about your products."} />
      <Card flush>
        {list.length === 0 ? (
          <Empty icon={<Star className="size-5" />} title="No reviews yet">Customers can review a product after they have ordered it.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((r) => (
              <li key={r.id} className="p-4">
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`size-4 ${n <= r.rating ? "fill-gold text-gold" : "text-line"}`} aria-hidden />)}</span>
                  <strong>{r.author_name || "Buyer"}</strong>
                  <span className="text-faint">· {relTime(r.created_at)}</span>
                </p>
                {r.product ? <Link to="/shop/product/$id" params={{ id: r.product.id }} className="text-sm font-bold text-sea">{r.product.title}</Link> : null}
                {r.comment ? <p className="mt-1 text-sm text-muted">{r.comment}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

// ───────────────────────── marketing ─────────────────────────

function useQr(text: string) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!text) return;
    void QRCode.toDataURL(text, { width: 480, margin: 1, color: { dark: "#0b1f8f", light: "#ffffff" } }).then(setUrl);
  }, [text]);
  return url;
}

function openPoster(store: Store, qr: string, url: string) {
  const w = window.open("", "_blank", "width=820,height=1100");
  if (!w) return toast.error("Allow pop-ups to print your poster.");
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(store.name)} — JonnyBee poster</title>
<style>body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#0a1440}.p{width:180mm;margin:10mm auto;border:6px solid #0b1f8f;border-radius:16px;padding:14mm;text-align:center}
h1{font-size:34px;margin:8px 0}h2{font-size:20px;margin:0;color:#1a45d8}.qr{width:120mm;height:120mm}.s{font-size:18px;margin-top:10px}.u{font-size:14px;color:#3b4766;word-break:break-all}
.b{display:inline-block;background:#0b1f8f;color:#fff;border-radius:999px;padding:6px 16px;font-weight:bold}@media print{.p{margin:0 auto}}</style></head>
<body><div class="p"><img src="${location.origin}/brand/shop-logo.webp" style="height:70px" alt=""><h2>JonnyBee Son and Daughter Online Trading Platform</h2><h1>${esc(store.name)}</h1>
<p class="b">Scan to shop · Free delivery</p><img class="qr" src="${qr}" alt="QR code"><p class="s"><strong>${esc(SHOP.slogan)}</strong></p>
<p class="u">${esc(url)}</p>${store.whatsapp ? `<p class="s">WhatsApp: ${esc(store.whatsapp)}</p>` : ""}<p class="u">${esc(store.town)}, Ghana</p></div>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
  w.document.close();
}

export function SellerMarketing({ store }: { store: Store }) {
  const { products } = useSellerData(store.id);
  const url = shopUrl(store);
  const qr = useQr(url);
  const message = `Shop ${store.name} on JonnyBee Online Trading Platform — free delivery! ${url}`;
  const live = (products.data ?? []).filter((p) => p.status === "active");

  async function nativeShare(title: string, text: string, link: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: link });
        return;
      } catch {
        return;
      }
    }
    await copy(link);
  }

  return (
    <>
      <PageHeader title="Marketing & sharing" description="Bring customers to your shop: share your link, print a QR poster and post your products on WhatsApp and Facebook." />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Your shop link">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className={inputCls} readOnly value={url} aria-label="Shop link" onFocus={(e) => e.currentTarget.select()} />
            <Btn tone="primary" onClick={() => void copy(url)}><Copy className="size-4" aria-hidden /> Copy</Btn>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#137a3e] px-3 text-sm font-bold text-white">
              <MessageCircle className="size-4" aria-hidden /> Share on WhatsApp
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#1565d8] px-3 text-sm font-bold text-white">
              <Facebook className="size-4" aria-hidden /> Share on Facebook
            </a>
            <Btn onClick={() => void nativeShare(store.name, message, url)}><Share2 className="size-4" aria-hidden /> More…</Btn>
          </div>
          <div className="mt-5 rounded-lg bg-paper p-3 text-sm">
            <p className="font-bold">WhatsApp status message (copy & post)</p>
            <p className="mt-1 text-muted">{message}</p>
            <Btn size="sm" className="mt-2" onClick={() => void copy(message, "Message")}><Copy className="size-3.5" aria-hidden /> Copy message</Btn>
          </div>
        </Card>
        <Card title="QR code & poster">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            {qr ? <img src={qr} alt={`QR code linking to ${store.name}`} className="size-40 rounded-lg border border-line" /> : <div className="size-40 animate-pulse rounded-lg bg-paper" />}
            <div className="grid gap-2 text-sm">
              <p className="text-muted">Customers scan this with their phone camera to open your shop. Put it on your stall, receipts or flyers.</p>
              <a href={qr} download={`${store.slug}-qr.png`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 font-bold">
                <Download className="size-4" aria-hidden /> Download QR code
              </a>
              <Btn tone="primary" onClick={() => qr && openPoster(store, qr, url)} disabled={!qr}><Printer className="size-4" aria-hidden /> Print shop poster</Btn>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Share individual products" className="mt-4" flush>
        {live.length === 0 ? (
          <Empty icon={<Package className="size-5" />} title="No live products to share yet" />
        ) : (
          <ul className="divide-y divide-line">
            {live.map((p) => {
              const link = productUrl(p.id);
              const text = `${p.title} — ${ghs(p.price)} at ${store.name} on JonnyBee. Free delivery! ${link}`;
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-3 p-3">
                  <span className="size-11 shrink-0 overflow-hidden rounded-lg border border-line"><ProductImage src={p.images[0]} alt="" seed={p.id} width={90} /></span>
                  <span className="min-w-[10rem] flex-1">
                    <strong className="block text-sm">{p.title}</strong>
                    <span className="text-xs text-faint">{ghs(p.price)} · <Eye className="inline size-3" aria-hidden /> {p.view_count} views</span>
                  </span>
                  <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#137a3e] px-2.5 text-xs font-bold text-white">
                    <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#1565d8] px-2.5 text-xs font-bold text-white">
                    <Facebook className="size-3.5" aria-hidden /> Facebook
                  </a>
                  <Btn size="sm" onClick={() => void copy(link)}><Copy className="size-3.5" aria-hidden /> Link</Btn>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Tips to sell more" className="mt-4">
        <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
          <li>📸 Use 3 or more clear photos in daylight for every product.</li>
          <li>🎬 Add a 10–20 second video — products with video get more attention.</li>
          <li>💬 Reply to WhatsApp messages quickly; buyers often order the same day.</li>
          <li>🏷️ Create a promo code for first-time buyers and share it on your status.</li>
          <li>📦 Keep stock numbers up to date so orders never fail.</li>
          <li>⭐ Ask happy customers to leave a review after delivery.</li>
        </ul>
      </Card>
    </>
  );
}

// ───────────────────────── promo codes ─────────────────────────

export function SellerPromos({ store }: { store: Store }) {
  const queryClient = useQueryClient();
  const coupons = useQuery({
    queryKey: ["seller", "coupons-full", store.id],
    queryFn: async () => must(await sb().from("coupons").select("*").eq("store_id", store.id).order("created_at", { ascending: false })) as Coupon[],
  });
  const [code, setCode] = useState("");
  const [pct, setPct] = useState("10");
  const [min, setMin] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expires, setExpires] = useState("");
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["seller"] });
  const create = useMutation({
    mutationFn: async () => {
      const c = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (c.length < 3) throw new Error("Use 3–20 letters or numbers for the code.");
      const n = Number(pct);
      if (!Number.isInteger(n) || n < 1 || n > 90) throw new Error("Discount must be a whole number from 1 to 90%.");
      const res = await sb()
        .from("coupons")
        .insert({
          store_id: store.id,
          code: c,
          percent_off: n,
          min_order: min ? Number(min) : 0,
          max_uses: maxUses ? Number(maxUses) : null,
          expires_at: expires ? new Date(`${expires}T23:59:59`).toISOString() : null,
        });
      if (res.error) throw new Error(/duplicate|unique/i.test(res.error.message) ? "That code is already used on JonnyBee — try another." : res.error.message);
    },
    onSuccess: () => {
      toast.success("Promo code created");
      setCode("");
      refresh();
    },
    onError: (e) => toast.error(errText(e)),
  });
  const toggle = useMutation({
    mutationFn: async (c: Coupon) => must(await sb().from("coupons").update({ active: !c.active }).eq("id", c.id)),
    onSuccess: refresh,
    onError: (e) => toast.error(errText(e)),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => must(await sb().from("coupons").delete().eq("id", id)),
    onSuccess: refresh,
    onError: (e) => toast.error(errText(e)),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  return (
    <>
      <PageHeader title="Promo codes" description="Give customers a percentage off your products. They enter the code at checkout." />
      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Card title="Create a promo code">
          <form onSubmit={submit} className="grid gap-3">
            <Field label="Code" hint="Letters and numbers, e.g. WELCOME10">
              <input className={`${inputCls} uppercase`} value={code} onChange={(e) => setCode(e.target.value)} maxLength={20} placeholder="WELCOME10" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount (%)"><input className={inputCls} value={pct} onChange={(e) => setPct(e.target.value)} inputMode="numeric" /></Field>
              <Field label="Minimum spend (GH₵)" hint="Optional"><input className={inputCls} value={min} onChange={(e) => setMin(e.target.value)} inputMode="decimal" /></Field>
              <Field label="Max uses" hint="Optional"><input className={inputCls} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} inputMode="numeric" /></Field>
              <Field label="Expires" hint="Optional"><input className={inputCls} type="date" value={expires} onChange={(e) => setExpires(e.target.value)} /></Field>
            </div>
            <Btn type="submit" tone="primary" disabled={create.isPending}><TicketPercent className="size-4" aria-hidden /> {create.isPending ? "Creating…" : "Create code"}</Btn>
          </form>
        </Card>
        <Card title="Your codes" flush>
          {(coupons.data ?? []).length === 0 ? (
            <Empty icon={<TicketPercent className="size-5" />} title="No promo codes yet">Create one and share it on WhatsApp to bring buyers in.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {(coupons.data ?? []).map((c) => {
                const expired = c.expires_at && new Date(c.expires_at) < new Date();
                const usedUp = c.max_uses !== null && c.used_count >= c.max_uses;
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-3 p-3">
                    <span className="rounded-lg border-2 border-dashed border-sea bg-mint px-2.5 py-1 font-mono text-sm font-extrabold text-sea-2">{c.code}</span>
                    <span className="min-w-[10rem] flex-1 text-sm">
                      <strong>{c.percent_off}% off</strong>
                      <span className="text-faint">
                        {Number(c.min_order) ? ` · min ${ghs(c.min_order)}` : ""} · used {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}
                        {c.expires_at ? ` · until ${new Date(c.expires_at).toLocaleDateString("en-GB")}` : ""}
                      </span>
                    </span>
                    <Badge tone={!c.active ? "gray" : expired || usedUp ? "amber" : "green"}>{!c.active ? "Off" : expired ? "Expired" : usedUp ? "Used up" : "Active"}</Badge>
                    <Btn size="sm" onClick={() => void copy(`Use code ${c.code} for ${c.percent_off}% off at ${store.name} on JonnyBee: ${shopUrl(store)}`, "Promo message")}><Copy className="size-3.5" aria-hidden /> Share</Btn>
                    <Btn size="sm" onClick={() => toggle.mutate(c)}>{c.active ? "Turn off" : "Turn on"}</Btn>
                    <Btn size="sm" tone="danger" onClick={() => window.confirm(`Delete ${c.code}?`) && remove.mutate(c.id)}>Delete</Btn>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

// ───────────────────────── plan ─────────────────────────

export function SellerPlan({ store }: { store: Store }) {
  const { data: platform } = usePlatformSettings();
  const { items } = useSellerData(store.id);
  const fees = (items.data ?? []).filter((i) => i.status !== "cancelled").reduce((s, i) => s + Number(i.platform_fee ?? 0), 0);
  const charging = Boolean(platform?.fees_enabled && Number(platform.seller_fee_percent) > 0);
  return (
    <>
      <PageHeader title="Plan & fees" description="What it costs to sell on JonnyBee." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Your plan">
          <p className="text-3xl font-extrabold text-ink">{charging ? `${platform?.seller_fee_percent}% per sale` : "Free"}</p>
          <p className="mt-1 text-muted">{platform?.fee_note ?? "Selling on JonnyBee is free for now."}</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {["Unlimited products", "Your own shop page with QR code", "Short product videos", "Promo codes", "Orders, customers and sales dashboard", "Free delivery for your customers"].map((f) => (
              <li key={f} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-leaf" aria-hidden /> {f}</li>
            ))}
          </ul>
        </Card>
        <Card title="Fees">
          <p className="text-sm text-faint">Platform fees recorded on your sales</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">{ghs(fees)}</p>
          <p className="mt-3 text-sm text-muted">
            {charging
              ? "Fees are calculated on each item when an order is placed. The JonnyBee team will contact you about settlement."
              : "You pay nothing right now. If JonnyBee introduces seller fees in future, you will be told in advance and fees will only apply to new orders."}
          </p>
        </Card>
      </div>
    </>
  );
}

// ───────────────────────── help ─────────────────────────

export function SellerHelp() {
  const tutorials = useTutorials();
  const [lang, setLang] = useState<"en" | "tw">("en");
  const [playing, setPlaying] = useState<Video | null>(null);
  const list = (tutorials.data ?? []).filter((v) => v.language === lang && (v.topic === "Selling" || v.topic === "Getting started"));
  return (
    <>
      <PageHeader
        title="Help & tutorials"
        description="Short videos on running your shop, in English and Twi."
        actions={<Link to="/tutorials" className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3 text-sm font-bold text-navy">All tutorials</Link>}
      />
      <div className="mb-4 inline-flex rounded-full bg-white p-1 ring-1 ring-line" role="tablist" aria-label="Language">
        {(["en", "tw"] as const).map((l) => (
          <button key={l} type="button" role="tab" aria-selected={lang === l} onClick={() => setLang(l)} className={cn("h-9 rounded-full px-4 text-sm font-bold", lang === l ? "bg-navy text-white" : "text-navy")}>
            {l === "en" ? "English" : "Twi"}
          </button>
        ))}
      </div>
      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((v) => <VideoCard key={v.id} video={v} onPlay={setPlaying} />)}</div>
      ) : (
        <Card>
          <p className="font-bold">Seller tutorial videos in {lang === "en" ? "English" : "Twi"} are coming soon.</p>
          <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-sm text-muted">
            <li>Go to <strong>Products → Add product</strong>. Add photos, a short video, price and stock.</li>
            <li>When an order arrives, open <strong>Orders</strong> and tap <strong>Accept</strong>.</li>
            <li>Send the item, then tap <strong>Mark sent</strong> and finally <strong>Mark delivered</strong>.</li>
            <li>Use <strong>Marketing</strong> to share your shop link and print your QR poster.</li>
            <li>Create a <strong>Promo code</strong> and post it on your WhatsApp status.</li>
          </ol>
        </Card>
      )}
      <Modal open={Boolean(playing)} onClose={() => setPlaying(null)} title={playing?.title ?? "Tutorial"} wide>
        {playing ? <VideoEmbed video={playing} /> : null}
      </Modal>
    </>
  );
}
