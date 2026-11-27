import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ProductImage } from "@/components/shop/product-image";
import { EmptyState } from "@/components/ui";
import { cartCount, cartSubtotal, useCart, type CartLine } from "@/lib/cart";
import { ghs } from "@/lib/format";

export const Route = createFileRoute("/shop/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Your cart — JonnyBee Online Trading Platform" }] }),
});

function CartPage() {
  const lines = useCart((state) => state.lines);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const groups = lines.reduce<Record<string, CartLine[]>>((acc, line) => {
    (acc[line.storeName] ??= []).push(line);
    return acc;
  }, {});

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Your cart</h1>
        {!hydrated ? null : lines.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<ShoppingBag className="size-6" />}
              title="Your cart is empty"
              action={<Link to="/shop" className="inline-flex h-12 items-center rounded-xl bg-sea px-5 font-semibold text-on-sea">Start shopping</Link>}
            >
              Browse care essentials from sellers in Assin Foso.
            </EmptyState>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              {Object.entries(groups).map(([store, items]) => (
                <section key={store} className="rounded-2xl border border-line bg-card">
                  <p className="border-b border-line px-5 py-3 text-sm font-bold tracking-wide text-faint uppercase">Sold by {store}</p>
                  <ul>
                    {items.map((line) => (
                      <li key={line.productId} className="flex gap-4 border-b border-line p-4 last:border-0 sm:p-5">
                        <Link to="/shop/product/$id" params={{ id: line.productId }} className="size-20 shrink-0 overflow-hidden rounded-xl sm:size-24">
                          <ProductImage src={line.image} alt={line.title} seed={line.productId} width={200} />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Link to="/shop/product/$id" params={{ id: line.productId }} className="line-clamp-2 font-semibold text-ink hover:text-sea">
                            {line.title}
                          </Link>
                          <p className="mt-1 text-base font-bold tabular-nums">{ghs(line.price)}</p>
                          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                            <div className="flex h-10 items-center rounded-lg border border-line">
                              <button type="button" className="grid h-full w-10 place-items-center" onClick={() => setQuantity(line.productId, line.quantity - 1)} aria-label="Decrease quantity">
                                <Minus className="size-4" />
                              </button>
                              <span className="w-8 text-center font-semibold tabular-nums">{line.quantity}</span>
                              <button type="button" className="grid h-full w-10 place-items-center disabled:opacity-40" disabled={line.quantity >= line.stock} onClick={() => setQuantity(line.productId, line.quantity + 1)} aria-label="Increase quantity">
                                <Plus className="size-4" />
                              </button>
                            </div>
                            <button type="button" onClick={() => remove(line.productId)} className="inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-danger">
                              <Trash2 className="size-4" aria-hidden /> Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-28">
              <h2 className="text-xl font-semibold">Order summary</h2>
              <dl className="mt-4 grid gap-2 text-base">
                <div className="flex justify-between"><dt className="text-muted">Items ({cartCount(lines)})</dt><dd className="font-semibold tabular-nums">{ghs(cartSubtotal(lines))}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="text-muted">Calculated at checkout</dd></div>
              </dl>
              <Link to="/shop/checkout" className="mt-5 flex h-13 items-center justify-center gap-2 rounded-xl bg-sea text-lg font-semibold text-on-sea hover:bg-sea-2">
                Checkout <ArrowRight className="size-5" aria-hidden />
              </Link>
              <Link to="/shop" className="mt-3 flex h-11 items-center justify-center font-semibold text-navy">Continue shopping</Link>
            </aside>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
