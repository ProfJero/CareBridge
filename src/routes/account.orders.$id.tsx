import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, CircleCheck, Package, Star, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { ProductImage } from "@/components/shop/product-image";
import { Button, EmptyState, Spinner, StatusPill } from "@/components/ui";
import { SITE } from "@/lib/config";
import { STATUS_LABEL, dateTime, ghs, statusTone } from "@/lib/format";
import { useSession } from "@/lib/session";
import { errText, must, sb } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/account/orders/$id")({
  validateSearch: (search: Record<string, unknown>): { placed?: boolean } => ({
    placed: search.placed === true || search.placed === "true" ? true : undefined,
  }),
  component: OrderPage,
  head: () => ({ meta: [{ title: "Order details — SamBee Online Trading Center" }] }),
});

const STEPS = ["pending", "confirmed", "shipped", "delivered"] as const;

function OrderPage() {
  const { id } = Route.useParams();
  const { placed } = Route.useSearch();
  const { ready, userId } = useSession();
  const queryClient = useQueryClient();
  const order = useQuery({
    queryKey: ["order", id],
    enabled: Boolean(userId),
    queryFn: async () => must(await sb().from("orders").select("*, items:order_items(*)").eq("id", id).maybeSingle()) as Order | null,
  });
  const cancel = useMutation({
    mutationFn: async () => must(await sb().rpc("cancel_order", { p_order: id })),
    onSuccess: () => {
      toast.success("Order cancelled");
      void queryClient.invalidateQueries({ queryKey: ["order", id] });
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error) => toast.error(errText(error)),
  });

  if (!ready || (userId && order.isLoading)) {
    return (
      <SiteShell>
        <div className="grid min-h-[50vh] place-items-center text-sea"><Spinner className="size-8" /></div>
      </SiteShell>
    );
  }
  if (!userId || !order.data) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-5 py-16">
          <EmptyState title="Order not found" action={<Link to="/account" className="font-semibold text-sea">Go to my account</Link>}>
            Sign in with the account that placed this order.
          </EmptyState>
        </div>
      </SiteShell>
    );
  }

  const o = order.data;
  const stepIndex = STEPS.indexOf(o.status as (typeof STEPS)[number]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-5 py-8 sm:py-10">
        <Link to="/account" className="inline-flex items-center gap-2 font-semibold text-navy">
          <ArrowLeft className="size-4" aria-hidden /> My orders
        </Link>

        {placed ? (
          <div className="mt-5 flex items-start gap-4 rounded-2xl bg-mint p-5">
            <CircleCheck className="size-8 shrink-0 text-sea" aria-hidden />
            <div>
              <p className="text-xl font-semibold text-ink">Thank you — your order is placed!</p>
              <p className="mt-1 text-base text-muted">
                {o.payment_method === "momo"
                  ? SITE.momoMerchant
                    ? `If you have not paid yet, send ${ghs(o.total)} to ${SITE.momoMerchant} (${SITE.momoMerchantName}) with reference ${o.order_number}.`
                    : "Our team will call you shortly with Mobile Money payment details."
                  : "Please have the cash ready when your order arrives."}{" "}
                We will keep this page updated.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Order {o.order_number}</h1>
            <p className="text-base text-faint">Placed {dateTime(o.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</StatusPill>
            <StatusPill tone={o.payment_status === "paid" ? "sea" : "neutral"}>{o.payment_status === "paid" ? "Paid" : "Payment pending"}</StatusPill>
          </div>
        </div>

        {o.status === "cancelled" ? (
          <p className="mt-6 flex items-center gap-2 rounded-2xl bg-danger-bg p-4 text-base text-danger">
            <XCircle className="size-5" aria-hidden /> This order was cancelled.
          </p>
        ) : (
          <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Order progress">
            {STEPS.map((step, index) => {
              const done = index <= stepIndex;
              const Icon = step === "shipped" ? Truck : step === "delivered" ? Package : Check;
              return (
                <li key={step} className="text-center">
                  <span className={cn("mx-auto grid size-11 place-items-center rounded-full", done ? "bg-sea text-on-sea" : "bg-paper text-faint ring-1 ring-line")}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className={cn("mt-2 block text-sm font-semibold", done ? "text-ink" : "text-faint")}>{STATUS_LABEL[step]}</span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-line bg-card">
            <h2 className="border-b border-line px-5 py-4 text-xl font-semibold">Items</h2>
            <ul>
              {o.items?.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-4 border-b border-line p-5 last:border-0">
                  <span className="size-16 shrink-0 overflow-hidden rounded-xl">
                    <ProductImage src={item.image} alt="" seed={item.product_id ?? item.id} width={140} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="text-base text-muted">{item.quantity} × {ghs(item.unit_price)}</p>
                  </div>
                  <StatusPill tone={statusTone(item.status)}>{STATUS_LABEL[item.status]}</StatusPill>
                  {item.status === "delivered" && item.product_id ? (
                    <Link to="/shop/product/$id" params={{ id: item.product_id }} hash="reviews" className="inline-flex items-center gap-1 text-sm font-semibold text-sea">
                      <Star className="size-4" aria-hidden /> Review
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
          <aside className="grid h-fit gap-4">
            <div className="rounded-2xl border border-line bg-card p-5">
              <h2 className="text-lg font-semibold">Summary</h2>
              <dl className="mt-3 grid gap-2 text-base">
                <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{ghs(o.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="tabular-nums">{Number(o.delivery_fee) === 0 ? "Free" : ghs(o.delivery_fee)}</dd></div>
                <div className="flex justify-between border-t border-line pt-2 text-lg font-bold"><dt>Total</dt><dd className="tabular-nums">{ghs(o.total)}</dd></div>
              </dl>
              <p className="mt-3 text-sm text-faint">
                {o.payment_method === "momo" ? `Mobile Money · ${o.momo_network ?? ""} ${o.momo_number ?? ""}` : "Cash on delivery"}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-5 text-base">
              <h2 className="text-lg font-semibold">{o.delivery_method === "pickup" ? "Pickup" : "Delivery to"}</h2>
              <p className="mt-2 font-semibold">{o.shipping_name}</p>
              <p className="text-muted">{o.shipping_phone}</p>
              {o.delivery_method === "delivery" ? (
                <p className="text-muted">{o.shipping_address}, {o.shipping_town}, {o.shipping_region}</p>
              ) : (
                <p className="text-muted">The seller will call you to arrange pickup.</p>
              )}
            </div>
            {o.status === "pending" || o.status === "confirmed" ? (
              <Button
                tone="secondary"
                className="text-danger"
                disabled={cancel.isPending}
                onClick={() => {
                  if (window.confirm("Cancel this order?")) cancel.mutate();
                }}
              >
                {cancel.isPending ? "Cancelling…" : "Cancel order"}
              </Button>
            ) : null}
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
