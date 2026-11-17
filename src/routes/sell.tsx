import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Smartphone, Store, TrendingUp, Truck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { AuthPanel } from "@/components/auth-panel";
import { SellerDashboard, StoreForm } from "@/components/seller/seller-centre";
import { Panel, Spinner } from "@/components/ui";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/sell")({
  component: SellPage,
  head: () => ({
    meta: [
      { title: "Sell with us — Sambea Marketplace" },
      { name: "description", content: "Open a free shop on the Sambea Marketplace and sell to families in Assin Foso and the Central Region." },
    ],
  }),
});

const PERKS = [
  { icon: Store, title: "Free shop page", copy: "Your own storefront with logo, banner and WhatsApp button." },
  { icon: Smartphone, title: "Manage from your phone", copy: "List products, update stock and accept orders anywhere." },
  { icon: Truck, title: "Local delivery", copy: "Customers in Assin Foso pay just GH₵ 10 for delivery." },
  { icon: TrendingUp, title: "Reach more families", copy: "Your products appear next to the care services families already trust." },
];

function SellPage() {
  const { ready, userId, store, refresh } = useSession();

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        {!ready ? (
          <div className="grid min-h-[40vh] place-items-center text-sea"><Spinner className="size-8" /></div>
        ) : store ? (
          <SellerDashboard store={store} />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-bold tracking-widest text-sea uppercase">Sell with us</p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Open your shop on the Sambea Marketplace.</h1>
              <p className="mt-4 text-lg text-muted">
                Sell care supplies, health products, groceries, clothing or local crafts to families in Assin Foso and across Ghana.
                Listing is free.
              </p>
              <ul className="mt-6 grid gap-4">
                {PERKS.map(({ icon: Icon, title, copy }) => (
                  <li key={title} className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-sea"><Icon className="size-5" aria-hidden /></span>
                    <span>
                      <strong className="block text-lg font-semibold text-ink">{title}</strong>
                      <span className="text-base text-muted">{copy}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-center gap-2 text-base text-muted">
                <BadgeCheck className="size-5 text-sea" aria-hidden /> Shops are reviewed and can earn a “Verified seller” badge.
              </p>
            </div>
            {userId ? (
              <Panel>
                <h2 className="text-2xl font-semibold text-ink">Tell us about your shop</h2>
                <p className="mt-1 mb-5 text-base text-muted">You can change any of this later.</p>
                <StoreForm onSaved={() => void refresh()} />
              </Panel>
            ) : (
              <AuthPanel intro="Create a free account (or sign in) to open your shop." />
            )}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
