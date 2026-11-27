import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Heart, LogOut, Package, Store } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { AuthPanel, NewPasswordForm } from "@/components/auth-panel";
import { ProductCard } from "@/components/shop/product-card";
import { Button, EmptyState, Field, Spinner, StatusPill, Tabs, controlClass } from "@/components/ui";
import { STATUS_LABEL, ghs, shortDate, statusTone } from "@/lib/format";
import { useSession } from "@/lib/session";
import { errText, must, sb } from "@/lib/supabase";
import { PRODUCT_SELECT, type Order, type Product } from "@/lib/types";

type AccountSearch = { next?: string; reset?: boolean; tab?: "orders" | "wishlist" | "profile" };

export const Route = createFileRoute("/account/")({
  validateSearch: (search: Record<string, unknown>): AccountSearch => ({
    next: typeof search.next === "string" && search.next.startsWith("/") ? search.next : undefined,
    reset: search.reset === true || search.reset === "1" || search.reset === 1 ? true : undefined,
    tab: search.tab === "wishlist" || search.tab === "profile" ? search.tab : undefined,
  }),
  component: AccountPage,
  head: () => ({ meta: [{ title: "My account — JonnyBee Home Care" }] }),
});

function AccountPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { ready, userId, profile, email, store, isAdmin, signOut } = useSession();
  const [tab, setTab] = useState<"orders" | "wishlist" | "profile">(search.tab ?? "orders");
  const [resetting, setResetting] = useState(Boolean(search.reset));

  useEffect(() => {
    if (ready && userId && search.next) void navigate({ to: search.next });
  }, [ready, userId, search.next, navigate]);

  if (!ready) {
    return (
      <SiteShell>
        <div className="grid min-h-[50vh] place-items-center text-sea"><Spinner className="size-8" /></div>
      </SiteShell>
    );
  }

  if (!userId) {
    return (
      <SiteShell>
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-10 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold tracking-widest text-sea uppercase">Your account</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-ink">Shop, track orders and sell — in one place.</h1>
            <ul className="mt-6 grid gap-3 text-lg text-muted">
              <li className="flex gap-3"><Package className="mt-1 size-5 shrink-0 text-sea" aria-hidden /> Follow every order from confirmation to your door.</li>
              <li className="flex gap-3"><Heart className="mt-1 size-5 shrink-0 text-sea" aria-hidden /> Save items to your wishlist for later.</li>
              <li className="flex gap-3"><Store className="mt-1 size-5 shrink-0 text-sea" aria-hidden /> Open your own shop on the marketplace.</li>
            </ul>
          </div>
          <AuthPanel intro={search.next ? "Sign in to continue — your cart is saved." : undefined} />
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-widest text-sea uppercase">My account</p>
            <h1 className="mt-1 truncate font-display text-3xl font-bold text-ink sm:text-4xl">
              Hello{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="truncate text-base text-faint">{email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <Link to="/manage" className="inline-flex h-11 items-center rounded-xl bg-gold px-4 font-semibold text-white">Admin console</Link>
            ) : null}
            <Link to="/sell" className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-4 font-semibold text-on-navy">
              <Store className="size-4" aria-hidden /> {store ? "Seller centre" : "Start selling"}
            </Link>
            <Button
              tone="secondary"
              onClick={async () => {
                await signOut();
                toast.success("Signed out");
              }}
            >
              <LogOut className="size-4" aria-hidden /> Sign out
            </Button>
          </div>
        </div>
        {resetting ? (
          <div className="mt-6 max-w-md">
            <NewPasswordForm onDone={() => setResetting(false)} />
          </div>
        ) : null}
        <div className="mt-6">
          <Tabs
            tabs={[
              { id: "orders", label: "Orders" },
              { id: "wishlist", label: "Wishlist" },
              { id: "profile", label: "Profile" },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>
        <div className="mt-6">
          {tab === "orders" ? <MyOrders userId={userId} /> : tab === "wishlist" ? <MyWishlist userId={userId} /> : <MyProfile />}
        </div>
      </div>
    </SiteShell>
  );
}

function MyOrders({ userId }: { userId: string }) {
  const orders = useQuery({
    queryKey: ["my-orders", userId],
    queryFn: async () =>
      must(
        await sb().from("orders").select("*, items:order_items(id,title,quantity,image)").eq("buyer_id", userId).order("created_at", { ascending: false }),
      ) as Order[],
  });
  if (orders.isLoading) return <Spinner className="text-sea" />;
  if (!orders.data?.length) {
    return (
      <EmptyState icon={<Package className="size-6" />} title="No orders yet" action={<Link to="/shop" className="font-semibold text-sea">Browse the shop</Link>}>
        When you place an order it will appear here.
      </EmptyState>
    );
  }
  return (
    <ul className="grid gap-3">
      {orders.data.map((order) => (
        <li key={order.id}>
          <Link
            to="/account/orders/$id"
            params={{ id: order.id }}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-5 hover:border-sea/50"
          >
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-ink">{order.order_number}</p>
              <p className="truncate text-base text-muted">
                {order.items?.map((item) => `${item.quantity} × ${item.title}`).join(", ")}
              </p>
              <p className="text-sm text-faint">{shortDate(order.created_at)}</p>
            </div>
            <StatusPill tone={statusTone(order.status)}>{STATUS_LABEL[order.status]}</StatusPill>
            <p className="text-lg font-bold tabular-nums">{ghs(order.total)}</p>
            <ChevronRight className="size-5 text-faint" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MyWishlist({ userId }: { userId: string }) {
  const wishlist = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: async () => {
      const rows = must(await sb().from("wishlists").select(`product:products(${PRODUCT_SELECT})`).eq("user_id", userId)) as unknown as {
        product: Product | null;
      }[];
      return rows.map((row) => row.product).filter((p): p is Product => Boolean(p));
    },
  });
  if (wishlist.isLoading) return <Spinner className="text-sea" />;
  if (!wishlist.data?.length) {
    return (
      <EmptyState icon={<Heart className="size-6" />} title="Your wishlist is empty">
        Tap “Save to wishlist” on any product to keep it here.
      </EmptyState>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {wishlist.data.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}

function MyProfile() {
  const { userId, profile, refresh } = useSession();
  const queryClient = useQueryClient();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const save = useMutation({
    mutationFn: async () => must(await sb().from("profiles").update({ full_name: name.trim(), phone: phone.trim() }).eq("id", userId!)),
    onSuccess: async () => {
      await refresh();
      void queryClient.invalidateQueries();
      toast.success("Profile saved");
    },
    onError: (error) => toast.error(errText(error)),
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }
  return (
    <form onSubmit={submit} className="grid max-w-lg gap-4 rounded-2xl border border-line bg-card p-5 sm:p-6">
      <Field label="Full name">
        <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Phone number">
        <input className={controlClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
      </Field>
      <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save profile"}</Button>
    </form>
  );
}
