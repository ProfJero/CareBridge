import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Smartphone, Store, TrendingUp, Truck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { AuthPanel } from "@/components/auth-panel";
import { StoreForm } from "@/components/seller/seller-centre";
import { SELLER_SECTIONS, SellerLayout, type SellerSection } from "@/components/seller/layout";
import {
  SellerCustomers,
  SellerHelp,
  SellerMarketing,
  SellerOrders,
  SellerOverview,
  SellerPlan,
  SellerPromos,
  SellerReviews,
  useSellerData,
} from "@/components/seller/sections";
import { ProductsAdmin } from "@/components/manage/products";
import { Card, PageHeader } from "@/components/manage/kit";
import { Panel, Spinner } from "@/components/ui";
import type { Store as StoreRow } from "@/lib/types";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/sell")({
  validateSearch: (search: Record<string, unknown>): { tab?: SellerSection } => ({
    tab: SELLER_SECTIONS.includes(search.tab as SellerSection) ? (search.tab as SellerSection) : undefined,
  }),
  component: SellPage,
  head: () => ({
    meta: [
      { title: "Sell with us — SamBee Online Trading Center" },
      { name: "description", content: "Open a free shop on the SamBee Online Trading Center and sell to families in Assin Foso and the Central Region." },
    ],
  }),
});

const PERKS = [
  { icon: Store, title: "Free shop page", copy: "Your own storefront with logo, banner and WhatsApp button." },
  { icon: Smartphone, title: "Manage from your phone", copy: "List products, update stock and accept orders anywhere." },
  { icon: Truck, title: "Free delivery", copy: "Customers get free delivery, so more of them buy." },
  { icon: TrendingUp, title: "Reach more families", copy: "Your products appear next to the care services families already trust." },
];

function SellPage() {
  const { ready, userId, store, refresh } = useSession();
  const { tab = "overview" } = Route.useSearch();
  const navigate = useNavigate({ from: "/sell" });
  const [justOpened, setJustOpened] = useState(false);

  if (ready && store) {
    return (
      <SellerApp
        store={store}
        section={tab}
        justOpened={justOpened}
        onSection={(next) => void navigate({ search: { tab: next === "overview" ? undefined : next } })}
        onSaved={() => void refresh()}
      />
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        {!ready ? (
          <div className="grid min-h-[40vh] place-items-center text-sea"><Spinner className="size-8" /></div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-bold tracking-widest text-sea uppercase">Sell with us</p>
              <h1 className="mt-2 font-display text-4xl font-bold text-ink">Open your shop on the SamBee Online Trading Center.</h1>
              <p className="mt-4 text-lg text-muted">
                Sell care supplies, health products, groceries, clothing or local crafts to families in Assin Foso and across Ghana.
                Selling on SamBee is free for now — no listing fees and no commission.
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
                <StoreForm
                  onSaved={() => {
                    setJustOpened(true);
                    void refresh();
                  }}
                />
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

function SellerApp({
  store,
  section,
  justOpened,
  onSection,
  onSaved,
}: {
  store: StoreRow;
  section: SellerSection;
  justOpened: boolean;
  onSection: (s: SellerSection) => void;
  onSaved: () => void;
}) {
  const { items } = useSellerData(store.id);
  const pending = (items.data ?? []).filter((i) => i.status === "pending").length;
  return (
    <SellerLayout store={store} section={section} onSection={onSection} pendingOrders={pending}>
      {justOpened && section === "overview" ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-leaf/30 bg-leaf-bg p-4">
          <p className="text-sm text-ink">
            <strong className="text-base">🎉 Your shop is live!</strong> Customers can already find <strong>{store.name}</strong> in the Shops directory. Add products so they can buy.
          </p>
          <Link to="/shop/store/$slug" params={{ slug: store.slug }} className="inline-flex h-9 items-center rounded-lg bg-leaf px-3 text-sm font-bold text-white">
            View my shop
          </Link>
        </div>
      ) : null}
      {store.status === "suspended" ? (
        <p className="mb-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger">
          Your shop is paused by the SamBee team, so customers can't see it right now. Contact beagracelyn@gmail.com for help.
        </p>
      ) : null}
      {section === "overview" ? (
        <SellerOverview store={store} onSection={onSection} />
      ) : section === "orders" ? (
        <SellerOrders store={store} />
      ) : section === "products" ? (
        <ProductsAdmin storeId={store.id} />
      ) : section === "customers" ? (
        <SellerCustomers store={store} />
      ) : section === "reviews" ? (
        <SellerReviews store={store} />
      ) : section === "marketing" ? (
        <SellerMarketing store={store} />
      ) : section === "promos" ? (
        <SellerPromos store={store} />
      ) : section === "plan" ? (
        <SellerPlan store={store} />
      ) : section === "help" ? (
        <SellerHelp />
      ) : (
        <>
          <PageHeader title="Shop settings" description="Your shop name, contacts, social links, video, logo and banner." />
          <Card>
            <StoreForm store={store} onSaved={onSaved} />
          </Card>
        </>
      )}
    </SellerLayout>
  );
}
