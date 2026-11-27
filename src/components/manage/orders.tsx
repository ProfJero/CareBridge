import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Phone, Printer, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Btn,
  Card,
  Drawer,
  Empty,
  ExportButton,
  FilterTabs,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  Table,
  downloadCsv,
  orderTone,
  payTone,
  relTime,
  td,
  th,
} from "@/components/manage/kit";
import { ProductImage } from "@/components/shop/product-image";
import { STATUS_LABEL, dateTime, ghs, waLink } from "@/lib/format";
import { errText, must, sb } from "@/lib/supabase";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

const TABS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Tab = (typeof TABS)[number];
const PAGE = 20;

const NEXT: Record<OrderStatus, { to: OrderStatus; label: string }[]> = {
  pending: [{ to: "confirmed", label: "Accept" }],
  confirmed: [{ to: "shipped", label: "Mark sent" }],
  shipped: [{ to: "delivered", label: "Mark delivered" }],
  delivered: [],
  cancelled: [],
};

export function OrdersAdmin({ initialQuery }: { initialQuery?: string }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("all");
  const [pay, setPay] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialQuery) return;
    if (initialQuery.startsWith("status:")) {
      setTab(initialQuery.slice(7) as Tab);
      setQ("");
    } else {
      setTab("all");
      setQ(initialQuery);
    }
  }, [initialQuery]);
  useEffect(() => setPage(0), [tab, pay, q]);

  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => must(await sb().from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false }).limit(1000)) as Order[],
  });

  useEffect(() => {
    if (initialQuery && !initialQuery.startsWith("status:") && orders.data) {
      const exact = orders.data.find((o) => o.order_number.toLowerCase() === initialQuery.toLowerCase());
      if (exact) setOpenId(exact.id);
    }
  }, [initialQuery, orders.data]);

  const all = useMemo(() => orders.data ?? [], [orders.data]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter(
      (o) =>
        (tab === "all" || o.status === tab) &&
        (pay === "all" || o.payment_status === pay || o.payment_method === pay) &&
        (!needle || `${o.order_number} ${o.shipping_name} ${o.shipping_phone} ${o.shipping_town}`.toLowerCase().includes(needle)),
    );
  }, [all, tab, pay, q]);
  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t, t === "all" ? all.length : all.filter((o) => o.status === t).length])), [all]);
  const open = all.find((o) => o.id === openId) ?? null;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-counts"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };
  const itemStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => must(await sb().rpc("set_order_item_status", { p_item: id, p_status: status })),
    onSuccess: () => {
      toast.success("Order updated");
      refresh();
    },
    onError: (e) => toast.error(errText(e)),
  });
  const advanceAll = useMutation({
    mutationFn: async ({ order, to }: { order: Order; to: OrderStatus }) => {
      const from = (Object.keys(NEXT) as OrderStatus[]).find((k) => NEXT[k].some((n) => n.to === to));
      for (const item of order.items ?? []) {
        if (item.status === from) must(await sb().rpc("set_order_item_status", { p_item: item.id, p_status: to }));
      }
    },
    onSuccess: () => {
      toast.success("Order updated");
      refresh();
    },
    onError: (e) => toast.error(errText(e)),
  });
  const payment = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => must(await sb().rpc("set_order_payment_status", { p_order: id, p_status: status })),
    onSuccess: () => {
      toast.success("Payment status saved");
      refresh();
    },
    onError: (e) => toast.error(errText(e)),
  });
  const cancel = useMutation({
    mutationFn: async (id: string) => must(await sb().rpc("cancel_order", { p_order: id })),
    onSuccess: () => {
      toast.success("Order cancelled and stock returned");
      refresh();
    },
    onError: (e) => toast.error(errText(e)),
  });

  function exportCsv() {
    downloadCsv(
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((o) => ({
        order: o.order_number,
        date: o.created_at,
        customer: o.shipping_name,
        phone: o.shipping_phone,
        town: o.shipping_town,
        delivery: o.delivery_method,
        items: (o.items ?? []).map((i) => `${i.quantity} x ${i.title}`).join("; "),
        subtotal: o.subtotal,
        delivery_fee: o.delivery_fee,
        total: o.total,
        status: o.status,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        momo_reference: o.momo_reference ?? "",
      })),
    );
  }

  return (
    <>
      <PageHeader title="Orders" description="Accept, dispatch and deliver orders. Confirm Mobile Money payments." actions={<ExportButton onClick={exportCsv} />} />
      <Card flush>
        <FilterTabs
          tabs={TABS.map((t) => ({ id: t, label: t === "all" ? "All" : STATUS_LABEL[t]!, count: counts[t] }))}
          value={tab}
          onChange={setTab}
        />
        <div className="flex flex-wrap items-center gap-2 p-3">
          <SearchInput value={q} onChange={setQ} placeholder="Order no., name, phone, town" />
          <Select
            label="Payment"
            value={pay}
            onChange={setPay}
            options={[
              { value: "all", label: "All payments" },
              { value: "unpaid", label: "Unpaid" },
              { value: "paid", label: "Paid" },
              { value: "momo", label: "Mobile Money" },
              { value: "cod", label: "Cash on delivery" },
            ]}
          />
        </div>
        {orders.isLoading ? (
          <div className="h-48 animate-pulse bg-paper" />
        ) : filtered.length === 0 ? (
          <Empty icon={<ShoppingCart className="size-5" />} title="No orders found">Orders placed in the shop appear here.</Empty>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Date</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Items</th>
                  <th className={th}>Payment</th>
                  <th className={th}>Fulfilment</th>
                  <th className={`${th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(page * PAGE, page * PAGE + PAGE).map((o) => (
                  <tr key={o.id} className="cursor-pointer hover:bg-paper" onClick={() => setOpenId(o.id)}>
                    <td className={`${td} font-bold text-sea`}>{o.order_number}</td>
                    <td className={`${td} whitespace-nowrap text-faint`}>{relTime(o.created_at)}</td>
                    <td className={td}>
                      <p className="font-semibold">{o.shipping_name}</p>
                      <p className="text-xs text-faint">{o.delivery_method === "pickup" ? "Pickup" : o.shipping_town}</p>
                    </td>
                    <td className={`${td} text-faint`}>{(o.items ?? []).reduce((s, i) => s + i.quantity, 0)} items</td>
                    <td className={td}>
                      <Badge tone={payTone(o.payment_status)}>{o.payment_status === "paid" ? "Paid" : o.payment_status === "refunded" ? "Refunded" : "Unpaid"}</Badge>
                      <p className="mt-0.5 text-xs text-faint">{o.payment_method === "momo" ? "MoMo" : "Cash"}</p>
                    </td>
                    <td className={td}><Badge tone={orderTone(o.status)}>{STATUS_LABEL[o.status]}</Badge></td>
                    <td className={`${td} text-right font-bold tabular-nums`}>{ghs(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} pageSize={PAGE} total={filtered.length} onPage={setPage} />
          </>
        )}
      </Card>

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open ? `Order ${open.order_number}` : "Order"}
        subtitle={
          open ? (
            <span className="flex flex-wrap items-center gap-2">
              {dateTime(open.created_at)} <Badge tone={orderTone(open.status)}>{STATUS_LABEL[open.status]}</Badge>
              <Badge tone={payTone(open.payment_status)}>{open.payment_status}</Badge>
            </span>
          ) : null
        }
        footer={
          open ? (
            <>
              <Btn onClick={() => window.print()}>
                <Printer className="size-4" aria-hidden /> Print
              </Btn>
              {open.status === "pending" || open.status === "confirmed" ? (
                <Btn tone="danger" onClick={() => window.confirm("Cancel the whole order and return stock?") && cancel.mutate(open.id)}>
                  Cancel order
                </Btn>
              ) : null}
              {NEXT[open.status].map((n) => (
                <Btn key={n.to} tone="primary" disabled={advanceAll.isPending} onClick={() => advanceAll.mutate({ order: open, to: n.to })}>
                  {n.label} (all items)
                </Btn>
              ))}
            </>
          ) : null
        }
      >
        {open ? <OrderDetail order={open} onItem={(id, status) => itemStatus.mutate({ id, status })} onPayment={(status) => payment.mutate({ id: open.id, status })} busy={itemStatus.isPending} /> : null}
      </Drawer>
    </>
  );
}

function OrderDetail({ order, onItem, onPayment, busy }: { order: Order; onItem: (id: string, s: OrderStatus) => void; onPayment: (s: string) => void; busy: boolean }) {
  return (
    <div className="grid gap-5 text-sm">
      <section>
        <h3 className="mb-2 text-xs font-bold tracking-wide text-faint uppercase">Items</h3>
        <ul className="divide-y divide-line rounded-lg border border-line">
          {(order.items ?? []).map((item: OrderItem) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 p-3">
              <span className="size-11 shrink-0 overflow-hidden rounded-lg">
                <ProductImage src={item.image} alt="" seed={item.product_id ?? item.id} width={90} />
              </span>
              <div className="min-w-[9rem] flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-faint">{item.quantity} × {ghs(item.unit_price)}</p>
              </div>
              <Badge tone={orderTone(item.status)}>{STATUS_LABEL[item.status]}</Badge>
              <div className="flex gap-1">
                {NEXT[item.status].map((n) => (
                  <Btn key={n.to} size="sm" tone="primary" disabled={busy} onClick={() => onItem(item.id, n.to)}>{n.label}</Btn>
                ))}
                {item.status === "pending" || item.status === "confirmed" ? (
                  <Btn size="sm" tone="danger" disabled={busy} onClick={() => window.confirm("Cancel this item?") && onItem(item.id, "cancelled")}>Cancel</Btn>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-3 grid gap-1">
          <div className="flex justify-between"><dt className="text-faint">Subtotal</dt><dd className="tabular-nums">{ghs(order.subtotal)}</dd></div>
          {Number(order.discount) > 0 ? (
            <div className="flex justify-between text-leaf"><dt>Promo {order.coupon_code}</dt><dd className="tabular-nums">−{ghs(order.discount)}</dd></div>
          ) : null}
          <div className="flex justify-between"><dt className="text-faint">Delivery</dt><dd className="tabular-nums">{ghs(order.delivery_fee)}</dd></div>
          <div className="flex justify-between text-base font-extrabold"><dt>Total</dt><dd className="tabular-nums">{ghs(order.total)}</dd></div>
        </dl>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-line p-3">
          <h3 className="mb-1.5 text-xs font-bold tracking-wide text-faint uppercase">Customer</h3>
          <p className="font-bold">{order.shipping_name}</p>
          <p>{order.shipping_phone}</p>
          <p className="mt-1 text-faint">
            {order.delivery_method === "pickup" ? "Pickup" : `${order.shipping_address}, ${order.shipping_town}, ${order.shipping_region}`}
          </p>
          <div className="mt-2 flex gap-2">
            <a href={`tel:${order.shipping_phone}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-bold"><Phone className="size-3.5" aria-hidden /> Call</a>
            <a href={waLink(order.shipping_phone, `Hello ${order.shipping_name}, this is JonnyBee Online Trading Platform about your order ${order.order_number}.`)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#137a3e] px-2.5 text-xs font-bold text-white">
              <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
            </a>
          </div>
        </div>
        <div className="rounded-lg border border-line p-3">
          <h3 className="mb-1.5 text-xs font-bold tracking-wide text-faint uppercase">Payment</h3>
          <p className="font-bold">{order.payment_method === "momo" ? "Mobile Money" : "Cash on delivery"}</p>
          {order.payment_method === "momo" ? (
            <p className="text-faint">
              {order.momo_network} · {order.momo_number}
              {order.momo_reference ? <><br />Transaction ID: <strong className="text-ink">{order.momo_reference}</strong></> : null}
            </p>
          ) : null}
          <label className="mt-2 grid gap-1 text-xs font-bold text-faint">
            Payment status
            <select className="h-9 rounded-lg border border-line px-2 text-sm font-semibold text-ink" value={order.payment_status} onChange={(e) => onPayment(e.target.value)}>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
        </div>
      </section>
      {order.notes ? (
        <section className="rounded-lg bg-gold-bg p-3">
          <h3 className="mb-1 text-xs font-bold tracking-wide text-gold uppercase">Customer note</h3>
          <p>{order.notes}</p>
        </section>
      ) : null}
    </div>
  );
}
