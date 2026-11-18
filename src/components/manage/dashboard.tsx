import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Banknote, BriefcaseBusiness, HeartHandshake, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Badge, Card, Kpi, PageHeader, Select, orderTone, relTime, td, th, Table } from "@/components/manage/kit";
import type { AdminSection } from "@/components/manage/layout";
import { STATUS_LABEL, ghs } from "@/lib/format";
import { must, sb } from "@/lib/supabase";
import type { CareRequest, Order, OrderItem, Product } from "@/lib/types";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

export function Dashboard({ onOpen }: { onOpen: (section: AdminSection, q?: string) => void }) {
  const [days, setDays] = useState("30");
  const since = useMemo(() => new Date(Date.now() - Number(days) * 86400_000).toISOString(), [days]);

  const data = useQuery({
    queryKey: ["admin-dashboard", days],
    queryFn: async () => {
      const client = sb();
      const head = { count: "exact" as const, head: true };
      const [orders, items, lowStock, requests, customers, products, apps] = await Promise.all([
        client.from("orders").select("id,order_number,shipping_name,total,status,payment_status,payment_method,created_at,buyer_id").gte("created_at", since).order("created_at", { ascending: false }).limit(2000),
        client.from("order_items").select("product_id,title,quantity,unit_price,status,created_at").gte("created_at", since).limit(5000),
        client.from("products").select("id,title,stock,images").eq("status", "active").lte("stock", 3).order("stock").limit(8),
        client.from("care_requests").select("*").order("created_at", { ascending: false }).limit(5),
        client.from("profiles").select("id", head),
        client.from("products").select("id", head).eq("status", "active"),
        client.from("job_applications").select("id", head).eq("stage", "new"),
      ]);
      return {
        orders: must(orders) as Order[],
        items: must(items) as OrderItem[],
        lowStock: must(lowStock) as Pick<Product, "id" | "title" | "stock" | "images">[],
        requests: must(requests) as CareRequest[],
        customers: customers.count ?? 0,
        products: products.count ?? 0,
        apps: apps.count ?? 0,
      };
    },
  });

  const d = data.data;
  const stats = useMemo(() => {
    if (!d) return null;
    const live = d.orders.filter((o) => o.status !== "cancelled");
    const paid = d.orders.filter((o) => o.payment_status === "paid");
    const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
    const gross = live.reduce((s, o) => s + Number(o.total), 0);
    const byDay = new Map<string, number>();
    for (let i = Number(days) - 1; i >= 0; i--) {
      const key = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
      byDay.set(key, 0);
    }
    for (const o of live) {
      const key = o.created_at.slice(0, 10);
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + Number(o.total));
    }
    const series = [...byDay.entries()].map(([date, total]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      total,
    }));
    const statusCounts = STATUSES.map((s) => ({ status: s, count: d.orders.filter((o) => o.status === s).length }));
    const top = new Map<string, { title: string; qty: number; sales: number }>();
    for (const it of d.items) {
      if (it.status === "cancelled") continue;
      const key = it.product_id ?? it.title;
      const row = top.get(key) ?? { title: it.title, qty: 0, sales: 0 };
      row.qty += it.quantity;
      row.sales += it.quantity * Number(it.unit_price);
      top.set(key, row);
    }
    const buyers = new Set(live.map((o) => o.buyer_id)).size;
    return {
      revenue,
      gross,
      orders: live.length,
      aov: live.length ? gross / live.length : 0,
      buyers,
      pending: d.orders.filter((o) => o.status === "pending").length,
      unpaidMomo: d.orders.filter((o) => o.payment_method === "momo" && o.payment_status === "unpaid" && o.status !== "cancelled").length,
      series,
      statusCounts,
      top: [...top.values()].sort((a, b) => b.sales - a.sales).slice(0, 5),
    };
  }, [d, days]);

  const maxStatus = Math.max(1, ...(stats?.statusCounts.map((s) => s.count) ?? [1]));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="How the Online Trading Center and Home Care are doing."
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

      {stats && (stats.pending > 0 || stats.unpaidMomo > 0 || (d?.lowStock.length ?? 0) > 0) ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {stats.pending > 0 ? (
            <button type="button" onClick={() => onOpen("orders")} className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold-bg px-3 py-2 text-sm font-bold text-gold">
              <ShoppingCart className="size-4" aria-hidden /> {stats.pending} {stats.pending === 1 ? "order" : "orders"} waiting to be accepted
            </button>
          ) : null}
          {stats.unpaidMomo > 0 ? (
            <button type="button" onClick={() => onOpen("orders")} className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold-bg px-3 py-2 text-sm font-bold text-gold">
              <Banknote className="size-4" aria-hidden /> {stats.unpaidMomo} Mobile Money payments to confirm
            </button>
          ) : null}
          {d && d.lowStock.length > 0 ? (
            <button type="button" onClick={() => onOpen("products")} className="inline-flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-sm font-bold text-danger">
              <AlertTriangle className="size-4" aria-hidden /> {d.lowStock.length} {d.lowStock.length === 1 ? "product" : "products"} low on stock
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="Paid revenue" value={stats ? ghs(stats.revenue) : "—"} hint={stats ? `${ghs(stats.gross)} in orders` : " "} icon={<Banknote className="size-4" />} tone="green" />
        <Kpi label="Orders" value={stats?.orders ?? "—"} hint={stats ? `${stats.pending} pending` : " "} icon={<ShoppingCart className="size-4" />} />
        <Kpi label="Average order value" value={stats ? ghs(stats.aov) : "—"} hint={stats ? `${stats.buyers} buying customers` : " "} icon={<TrendingUp className="size-4" />} />
        <Kpi label="Customers" value={d?.customers ?? "—"} hint={d ? `${d.products} live products` : " "} icon={<Users className="size-4" />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Sales over time" action={<span className="text-xs text-faint">Order value per day, GH₵ (excludes cancelled)</span>}>
          <div className="h-72" role="img" aria-label="Area chart of order value per day">
            {stats ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a45d8" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#1a45d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e8ecf6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#5e6a88", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#dce3f3" }} minTickGap={24} />
                  <YAxis tick={{ fill: "#5e6a88", fontSize: 12 }} tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))} />
                  <Tooltip
                    cursor={{ stroke: "#0a1440", strokeWidth: 1, strokeDasharray: "3 3" }}
                    contentStyle={{ borderRadius: 10, border: "1px solid #dce3f3", fontSize: 13 }}
                    formatter={(value: number) => [ghs(value), "Order value"]}
                    labelFormatter={(label: string) => label}
                  />
                  <Area type="monotone" dataKey="total" stroke="#1a45d8" strokeWidth={2} fill="url(#salesFill)" activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full animate-pulse rounded-lg bg-paper" />
            )}
          </div>
        </Card>

        <Card title="Orders by status">
          <ul className="grid gap-3">
            {(stats?.statusCounts ?? STATUSES.map((s) => ({ status: s, count: 0 }))).map((row) => (
              <li key={row.status}>
                <button type="button" onClick={() => onOpen("orders", `status:${row.status}`)} className="block w-full text-left">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{STATUS_LABEL[row.status]}</span>
                    <span className="font-bold tabular-nums">{row.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-paper">
                    <div className="h-2 rounded-full bg-sea" style={{ width: `${(row.count / maxStatus) * 100}%`, minWidth: row.count ? 8 : 0 }} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <button type="button" onClick={() => onOpen("requests")} className="rounded-lg bg-paper p-3 text-left">
              <HeartHandshake className="size-4 text-sea" aria-hidden />
              <p className="mt-1 text-xl font-extrabold">{d?.requests.filter((r) => r.status === "new").length ?? "—"}</p>
              <p className="text-xs text-faint">New care requests</p>
            </button>
            <button type="button" onClick={() => onOpen("applications")} className="rounded-lg bg-paper p-3 text-left">
              <BriefcaseBusiness className="size-4 text-sea" aria-hidden />
              <p className="mt-1 text-xl font-extrabold">{d?.apps ?? "—"}</p>
              <p className="text-xs text-faint">New job applications</p>
            </button>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Recent orders" action={<button type="button" onClick={() => onOpen("orders")} className="text-xs font-bold text-sea">View all</button>} flush>
          <Table>
            <thead>
              <tr>
                <th className={th}>Order</th>
                <th className={th}>Customer</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(d?.orders ?? []).slice(0, 6).map((o) => (
                <tr key={o.id} className="cursor-pointer hover:bg-paper" onClick={() => onOpen("orders", o.order_number)}>
                  <td className={td}>
                    <p className="font-bold">{o.order_number}</p>
                    <p className="text-xs text-faint">{relTime(o.created_at)}</p>
                  </td>
                  <td className={td}>{o.shipping_name}</td>
                  <td className={td}><Badge tone={orderTone(o.status)}>{STATUS_LABEL[o.status]}</Badge></td>
                  <td className={`${td} text-right font-bold tabular-nums`}>{ghs(o.total)}</td>
                </tr>
              ))}
              {d && d.orders.length === 0 ? (
                <tr><td className={`${td} text-center text-faint`} colSpan={4}>No orders in this period yet.</td></tr>
              ) : null}
            </tbody>
          </Table>
        </Card>
        <div className="grid min-w-0 gap-4">
          <Card title="Top products" flush>
            <ul>
              {(stats?.top ?? []).map((p, i) => (
                <li key={p.title} className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-sm last:border-0">
                  <span className="grid size-6 place-items-center rounded-full bg-mint text-xs font-bold text-sea">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{p.title}</span>
                  <span className="text-faint">{p.qty} sold</span>
                  <span className="font-bold tabular-nums">{ghs(p.sales)}</span>
                </li>
              ))}
              {stats && stats.top.length === 0 ? <li className="px-4 py-6 text-center text-sm text-faint">No sales in this period yet.</li> : null}
            </ul>
          </Card>
          <Card title="Low stock" flush>
            <ul>
              {(d?.lowStock ?? []).map((p) => (
                <li key={p.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-sm last:border-0">
                  <Package className="size-4 text-faint" aria-hidden />
                  <span className="min-w-0 flex-1 truncate font-semibold">{p.title}</span>
                  <Badge tone={p.stock === 0 ? "red" : "amber"}>{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</Badge>
                </li>
              ))}
              {d && d.lowStock.length === 0 ? <li className="px-4 py-6 text-center text-sm text-faint">All products are well stocked.</li> : null}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
