import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { AuthPanel } from "@/components/auth-panel";
import { LogoMark, SamBee } from "@/components/brand";
import { CareRequestsAdmin, ApplicationsAdmin } from "@/components/manage/care";
import { CategoriesAdmin, CustomersAdmin, ReviewsAdmin, SellersAdmin } from "@/components/manage/catalog";
import { Dashboard } from "@/components/manage/dashboard";
import { ADMIN_SECTIONS, AdminLayout, type AdminSection } from "@/components/manage/layout";
import { OrdersAdmin } from "@/components/manage/orders";
import { ProductsAdmin } from "@/components/manage/products";
import { SettingsAdmin } from "@/components/manage/settings";
import { VideoManager } from "@/components/manage/videos";
import { Spinner } from "@/components/ui";
import { SITE } from "@/lib/config";
import { useSession } from "@/lib/session";

type ManageSearch = { tab?: AdminSection; q?: string };

export const Route = createFileRoute("/manage")({
  validateSearch: (search: Record<string, unknown>): ManageSearch => ({
    tab: ADMIN_SECTIONS.includes(search.tab as AdminSection) ? (search.tab as AdminSection) : undefined,
    q: typeof search.q === "string" && search.q ? search.q : undefined,
  }),
  component: ManagePage,
  head: () => ({ meta: [{ title: "Admin — SamBee Son and Daughter" }, { name: "robots", content: "noindex" }] }),
});

function ManagePage() {
  const { tab = "dashboard", q } = Route.useSearch();
  const navigate = useNavigate({ from: "/manage" });
  const { ready, userId, isAdmin, email, signOut } = useSession();
  const go = (next: AdminSection, query?: string) => void navigate({ search: { tab: next === "dashboard" ? undefined : next, q: query } });

  if (!ready) {
    return <div className="grid min-h-screen place-items-center bg-[#f4f6fb] text-sea"><Spinner className="size-8" /></div>;
  }

  if (!userId || !isAdmin) {
    return (
      <main className="grid min-h-screen bg-[#f4f6fb] lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-navy p-12 text-white lg:flex">
          <div className="flex items-center gap-3">
            <span className="h-12"><LogoMark kind="care" badge className="h-full" /></span>
            <SamBee light className="text-2xl" />
          </div>
          <div>
            <h1 className="font-display text-4xl leading-tight font-extrabold">Run Home Care and the Online Trading Center from one dashboard.</h1>
            <p className="mt-4 max-w-md text-lg text-navy-muted">Orders, payments, products, sellers, customers, care requests, job applications and videos.</p>
          </div>
          <p className="text-sm text-navy-muted">{SITE.town}, {SITE.region}, {SITE.country}</p>
        </section>
        <section className="flex flex-col items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <span className="h-11"><LogoMark kind="care" className="h-full" /></span>
              <SamBee className="text-2xl" />
            </div>
            <h2 className="font-display text-3xl font-extrabold text-ink">Staff sign-in</h2>
            {userId && !isAdmin ? (
              <div className="mt-5 rounded-2xl border border-line bg-white p-6">
                <ShieldAlert className="size-8 text-gold" aria-hidden />
                <p className="mt-3 text-lg font-bold">{email} is not an admin.</p>
                <p className="mt-1 text-muted">Ask an existing admin to give this account access (Customers → Make admin), or sign in with an admin account.</p>
                <button type="button" onClick={() => void signOut()} className="mt-4 h-11 rounded-xl border border-line px-4 font-bold">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-5">
                <AuthPanel intro="Sign in with your admin account." />
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <AdminLayout section={tab} onSection={(s) => go(s)} onSearch={(query) => go(/@|^\+?\d[\d\s]{6,}$/.test(query) ? "customers" : "orders", query)}>
      {tab === "dashboard" ? (
        <Dashboard onOpen={go} />
      ) : tab === "orders" ? (
        <OrdersAdmin initialQuery={q} />
      ) : tab === "products" ? (
        <ProductsAdmin />
      ) : tab === "categories" ? (
        <CategoriesAdmin />
      ) : tab === "sellers" ? (
        <SellersAdmin />
      ) : tab === "customers" ? (
        <CustomersAdmin key={q} initialQuery={q} />
      ) : tab === "reviews" ? (
        <ReviewsAdmin />
      ) : tab === "videos" ? (
        <VideoManager />
      ) : tab === "requests" ? (
        <CareRequestsAdmin />
      ) : tab === "applications" ? (
        <ApplicationsAdmin />
      ) : (
        <SettingsAdmin onCustomers={() => go("customers")} />
      )}
    </AdminLayout>
  );
}
