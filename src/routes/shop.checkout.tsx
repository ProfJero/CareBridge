import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, Lock, Smartphone, Store as StoreIcon, Truck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ProductImage } from "@/components/shop/product-image";
import { Button, EmptyState, ErrorNote, Field, Spinner, controlClass } from "@/components/ui";
import { GHANA_REGIONS, NEARBY_TOWNS, SITE, deliveryFee } from "@/lib/config";
import { cartSubtotal, useCart } from "@/lib/cart";
import { sendFormEmail } from "@/lib/email";
import { ghs } from "@/lib/format";
import { useSession } from "@/lib/session";
import { usePlatformSettings } from "@/lib/queries";
import { errText, sb } from "@/lib/supabase";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/shop/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — SamBee Online Trading Center" }] }),
});

const NETWORKS = ["MTN MoMo", "Telecel Cash", "AirtelTigo Money"] as const;

function CheckoutPage() {
  const navigate = useNavigate();
  const { ready, userId, profile, email } = useSession();
  const lines = useCart((state) => state.lines);
  const clear = useCart((state) => state.clear);
  const [hydrated, setHydrated] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
  const [town, setTown] = useState<string>(SITE.town);
  const [customTown, setCustomTown] = useState("");
  const [region, setRegion] = useState<string>(SITE.region);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cod" | "momo">("momo");
  const [network, setNetwork] = useState<string>(NETWORKS[0]);
  const [momoNumber, setMomoNumber] = useState("");
  const [momoRef, setMomoRef] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (profile) {
      setName((v) => v || profile.full_name);
      setPhone((v) => v || profile.phone);
      setMomoNumber((v) => v || profile.phone);
    }
  }, [profile]);

  const finalTown = town === "Other" ? customTown : town;
  const { data: platform } = usePlatformSettings();
  const fee = deliveryFee(method, finalTown, region, platform?.free_delivery ?? true);
  const subtotal = cartSubtotal(lines);

  async function placeOrder(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (payment === "momo" && momoNumber.replace(/\D/g, "").length < 9) return setError("Enter the Mobile Money number you will pay from.");
    setBusy(true);
    try {
      const { data, error: rpcError } = await sb().rpc("place_order", {
        p_items: lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })),
        p_shipping: { name, phone, delivery_method: method, town: finalTown, region, address, notes },
        p_payment_method: payment,
        p_momo: payment === "momo" ? { network, number: momoNumber, reference: momoRef } : {},
      });
      if (rpcError) throw rpcError;
      const orderId = data as string;
      // Save contact details for next time (best effort).
      if (userId && profile && (!profile.full_name || !profile.phone)) {
        void sb().from("profiles").update({ full_name: profile.full_name || name, phone: profile.phone || phone }).eq("id", userId);
      }
      const { data: order } = await sb().from("orders").select("order_number,total").eq("id", orderId).maybeSingle();
      // Notify the team by email (best effort — the order is already saved).
      void sendFormEmail(`${SITE.name} — new marketplace order ${order?.order_number ?? ""}`, {
        Order: order?.order_number ?? orderId,
        Total: ghs(order?.total ?? subtotal + fee),
        Customer: name,
        Phone: phone,
        Email: email ?? "",
        Delivery: method === "pickup" ? "Pickup" : `${address}, ${finalTown}, ${region}`,
        Payment: payment === "momo" ? `${network} ${momoNumber} ${momoRef ? `(ref ${momoRef})` : ""}` : "Cash on delivery",
        Items: lines.map((line) => `${line.quantity} × ${line.title} (${line.storeName})`).join("\n"),
        Notes: notes,
      }).catch(() => undefined);
      clear();
      void navigate({ to: "/account/orders/$id", params: { id: orderId }, search: { placed: true } });
    } catch (err) {
      setError(errText(err, "We could not place your order. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated || !ready) {
    return (
      <SiteShell>
        <div className="grid min-h-[50vh] place-items-center text-sea"><Spinner className="size-8" /></div>
      </SiteShell>
    );
  }

  if (lines.length === 0) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-5 py-16">
          <EmptyState title="Your cart is empty" action={<Link to="/shop" className="font-semibold text-sea">Go to the shop</Link>}>
            Add a few items before checking out.
          </EmptyState>
        </div>
      </SiteShell>
    );
  }

  if (!userId) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-xl px-5 py-16">
          <EmptyState
            icon={<Lock className="size-6" />}
            title="Sign in to check out"
            action={
              <Link to="/account" search={{ next: "/shop/checkout" }} className="inline-flex h-12 items-center rounded-xl bg-sea px-5 font-semibold text-on-sea">
                Sign in or create an account
              </Link>
            }
          >
            An account lets you track your order and talk to the seller. It only takes a minute — your cart is saved.
          </EmptyState>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <form onSubmit={placeOrder} className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:py-10 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Checkout</h1>

          <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
            <h2 className="text-xl font-semibold">1. Contact</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Recipient name">
                <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              </Field>
              <Field label="Phone number">
                <input className={controlClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" required placeholder="024 000 0000" />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
            <h2 className="text-xl font-semibold">2. Delivery</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Choice active={method === "delivery"} onClick={() => setMethod("delivery")} icon={<Truck className="size-5" />} title="Deliver to me" note={platform?.free_delivery === false ? "From GH₵ 10 in Assin Foso" : "Free delivery"} />
              <Choice active={method === "pickup"} onClick={() => setMethod("pickup")} icon={<StoreIcon className="size-5" />} title="I'll pick it up" note="Free · seller will call you" />
            </div>
            {method === "delivery" ? (
              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Town">
                    <select className={controlClass} value={town} onChange={(e) => setTown(e.target.value)}>
                      {NEARBY_TOWNS.map((item) => <option key={item}>{item}</option>)}
                      <option value="Other">Other town</option>
                    </select>
                  </Field>
                  <Field label="Region">
                    <select className={controlClass} value={region} onChange={(e) => setRegion(e.target.value)}>
                      {GHANA_REGIONS.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </Field>
                </div>
                {town === "Other" ? (
                  <Field label="Town name">
                    <input className={controlClass} value={customTown} onChange={(e) => setCustomTown(e.target.value)} required />
                  </Field>
                ) : null}
                <Field label="Address or nearest landmark" hint="e.g. House number, street, or 'behind the Methodist church'">
                  <input className={controlClass} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" required />
                </Field>
              </div>
            ) : null}
            <div className="mt-4">
              <Field label="Notes for the seller (optional)">
                <textarea className={`${controlClass} h-20 py-3`} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
            <h2 className="text-xl font-semibold">3. Payment</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Choice active={payment === "momo"} onClick={() => setPayment("momo")} icon={<Smartphone className="size-5" />} title="Mobile Money" note="MTN, Telecel, AirtelTigo" />
              <Choice active={payment === "cod"} onClick={() => setPayment("cod")} icon={<Banknote className="size-5" />} title="Cash on delivery" note="Pay when it arrives" />
            </div>
            {payment === "momo" ? (
              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Network">
                    <select className={controlClass} value={network} onChange={(e) => setNetwork(e.target.value)}>
                      {NETWORKS.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </Field>
                  <Field label="MoMo number you'll pay from">
                    <input className={controlClass} value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} type="tel" required />
                  </Field>
                </div>
                <div className="rounded-xl bg-gold-bg p-4 text-base text-ink">
                  {SITE.momoMerchant ? (
                    <>
                      Send <strong>{ghs(subtotal + fee)}</strong> to <strong>{SITE.momoMerchant}</strong> ({SITE.momoMerchantName}) and enter the
                      transaction ID below. We confirm payment before dispatch.
                    </>
                  ) : (
                    <>After you place the order, our team will call you with the Mobile Money payment details. Your order is held for you.</>
                  )}
                </div>
                <Field label="Transaction ID (optional)">
                  <input className={controlClass} value={momoRef} onChange={(e) => setMomoRef(e.target.value)} placeholder="If you have already paid" />
                </Field>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-28">
          <h2 className="text-xl font-semibold">Your order</h2>
          <ul className="mt-4 grid gap-3">
            {lines.map((line) => (
              <li key={line.productId} className="flex items-center gap-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                  <ProductImage src={line.image} alt="" seed={line.productId} width={120} />
                  <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-navy text-xs font-bold text-on-navy">{line.quantity}</span>
                </span>
                <span className="min-w-0 flex-1 truncate text-base">{line.title}</span>
                <span className="font-semibold tabular-nums">{ghs(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 grid gap-2 border-t border-line pt-4 text-base">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{ghs(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="tabular-nums">{fee === 0 ? "Free" : ghs(fee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-lg font-bold"><dt>Total</dt><dd className="tabular-nums">{ghs(subtotal + fee)}</dd></div>
          </dl>
          <div className="mt-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
          <Button type="submit" className="mt-4 h-13 w-full text-lg" disabled={busy}>
            {busy ? "Placing order…" : `Place order · ${ghs(subtotal + fee)}`}
          </Button>
          <p className="mt-3 text-center text-sm text-faint">Prices and stock are confirmed when you place the order.</p>
        </aside>
      </form>
    </SiteShell>
  );
}

function Choice({ active, onClick, icon, title, note }: { active: boolean; onClick: () => void; icon: ReactNode; title: string; note: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-3 rounded-xl border-2 p-4 text-left",
        active ? "border-sea bg-mint/50" : "border-line bg-card hover:border-sea/40",
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", active ? "bg-sea text-on-sea" : "bg-paper text-navy")}>{icon}</span>
      <span>
        <span className="block font-semibold text-ink">{title}</span>
        <span className="block text-sm text-faint">{note}</span>
      </span>
    </button>
  );
}
