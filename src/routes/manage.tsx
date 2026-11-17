import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Banknote, ClipboardList, Film, Package, Pencil, ShieldAlert, ShoppingCart, Store, Trash2, UploadCloud, Youtube } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { AuthPanel } from "@/components/auth-panel";
import { OrderItemsBoard, ProductsTable } from "@/components/seller/seller-centre";
import { videoThumb } from "@/components/video-player";
import { Button, EmptyState, ErrorNote, Field, Modal, Panel, Spinner, StatusPill, Tabs, controlClass } from "@/components/ui";
import { cloudinaryReady, uploadToCloudinary, youtubeId } from "@/lib/cloudinary";
import { SITE } from "@/lib/config";
import { STATUS_LABEL, dateTime, ghs, statusTone } from "@/lib/format";
import { useSession } from "@/lib/session";
import { errText, must, sb } from "@/lib/supabase";
import type { CareRequest, Order, Store as StoreRow, Video } from "@/lib/types";

const TABS = ["overview", "videos", "orders", "products", "stores", "requests"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/manage")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => ({
    tab: TABS.includes(search.tab as Tab) ? (search.tab as Tab) : undefined,
  }),
  component: ManagePage,
  head: () => ({ meta: [{ title: "Admin console — Sambea Son and Daughter Home Care" }] }),
});

function ManagePage() {
  const { tab = "overview" } = Route.useSearch();
  const navigate = useNavigate({ from: "/manage" });
  const { ready, userId, isAdmin } = useSession();

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
        {!ready ? (
          <div className="grid min-h-[40vh] place-items-center text-sea"><Spinner className="size-8" /></div>
        ) : !userId ? (
          <div className="mx-auto max-w-md">
            <AuthPanel intro="Sign in with an administrator account to manage videos, orders, sellers and care requests." />
          </div>
        ) : !isAdmin ? (
          <EmptyState icon={<ShieldAlert className="size-6" />} title="Administrators only">
            This account does not have admin access. Ask the site owner to grant it, or sign in with {SITE.inbox}.
          </EmptyState>
        ) : (
          <div className="grid gap-6">
            <div>
              <p className="text-sm font-bold tracking-widest text-gold uppercase">Admin console</p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">{SITE.name}</h1>
            </div>
            <Tabs
              tabs={[
                { id: "overview", label: "Overview" },
                { id: "videos", label: "Videos" },
                { id: "orders", label: "Orders" },
                { id: "products", label: "Products" },
                { id: "stores", label: "Sellers" },
                { id: "requests", label: "Care requests" },
              ]}
              value={tab}
              onChange={(next) => void navigate({ search: { tab: next } })}
            />
            {tab === "overview" ? (
              <Overview />
            ) : tab === "videos" ? (
              <VideoManager />
            ) : tab === "orders" ? (
              <AdminOrders />
            ) : tab === "products" ? (
              <ProductsTable admin />
            ) : tab === "stores" ? (
              <StoresManager />
            ) : (
              <CareRequests />
            )}
          </div>
        )}
      </div>
    </SiteShell>
  );
}

// ───────────────────────── overview ─────────────────────────

function Overview() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const client = sb();
      const head = { count: "exact" as const, head: true };
      const [orders, openOrders, products, stores, videos, newRequests, paid] = await Promise.all([
        client.from("orders").select("id", head),
        client.from("orders").select("id", head).in("status", ["pending", "confirmed", "shipped"]),
        client.from("products").select("id", head).eq("status", "active"),
        client.from("stores").select("id", head),
        client.from("videos").select("id", head),
        client.from("care_requests").select("id", head).eq("status", "new"),
        client.from("orders").select("total").eq("payment_status", "paid"),
      ]);
      const revenue = ((paid.data ?? []) as { total: number }[]).reduce((s, r) => s + Number(r.total), 0);
      return {
        orders: orders.count ?? 0,
        openOrders: openOrders.count ?? 0,
        products: products.count ?? 0,
        stores: stores.count ?? 0,
        videos: videos.count ?? 0,
        newRequests: newRequests.count ?? 0,
        revenue,
      };
    },
  });
  const s = stats.data;
  const cards = [
    { label: "Paid order value", value: s ? ghs(s.revenue) : "—", icon: Banknote, tab: "orders" },
    { label: "Open orders", value: s?.openOrders ?? "—", icon: ShoppingCart, tab: "orders" },
    { label: "Total orders", value: s?.orders ?? "—", icon: ClipboardList, tab: "orders" },
    { label: "Live products", value: s?.products ?? "—", icon: Package, tab: "products" },
    { label: "Seller shops", value: s?.stores ?? "—", icon: Store, tab: "stores" },
    { label: "Videos", value: s?.videos ?? "—", icon: Film, tab: "videos" },
    { label: "New care requests", value: s?.newRequests ?? "—", icon: ClipboardList, tab: "requests" },
  ] as const;
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tab }) => (
          <Link key={label} to="/manage" search={{ tab }} className="rounded-2xl border border-line bg-card p-4 hover:border-sea/50">
            <Icon className="size-5 text-sea" aria-hidden />
            <p className="mt-3 text-2xl font-bold text-ink tabular-nums">{value}</p>
            <p className="text-sm text-faint">{label}</p>
          </Link>
        ))}
      </div>
      <Panel>
        <h2 className="text-xl font-semibold">Quick guide</h2>
        <ul className="mt-3 grid gap-2 text-base text-muted">
          <li>• <strong className="text-ink">Videos</strong> — paste a YouTube link, or upload a video file to Cloudinary.</li>
          <li>• <strong className="text-ink">Orders</strong> — confirm Mobile Money payments and follow every order.</li>
          <li>• <strong className="text-ink">Sellers</strong> — verify trusted shops or pause a shop if needed.</li>
          <li>• <strong className="text-ink">Care requests</strong> — families asking for a call back. Each one is also emailed to {SITE.inbox}.</li>
        </ul>
      </Panel>
    </div>
  );
}

// ───────────────────────── videos ─────────────────────────

const VIDEO_CATEGORIES = ["Care tips", "Caregiver training", "Elderly care", "Health & nutrition", "Our stories", "Products"];

function VideoForm({ video, onDone }: { video: Video | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [source, setSource] = useState<"youtube" | "cloudinary">(video?.source ?? "youtube");
  const [link, setLink] = useState(video?.youtube_id ? `https://www.youtube.com/watch?v=${video.youtube_id}` : "");
  const [videoUrl, setVideoUrl] = useState(video?.video_url ?? "");
  const [thumb, setThumb] = useState(video?.thumbnail_url ?? "");
  const [duration, setDuration] = useState<number | null>(video?.duration_seconds ?? null);
  const [title, setTitle] = useState(video?.title ?? "");
  const [description, setDescription] = useState(video?.description ?? "");
  const [category, setCategory] = useState(video?.category ?? VIDEO_CATEGORIES[0]!);
  const [published, setPublished] = useState(video?.published ?? true);
  const [featured, setFeatured] = useState(video?.featured ?? false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) return setError("Please keep uploads under 100 MB, or put the video on YouTube.");
    setError("");
    try {
      setProgress(0);
      const result = await uploadToCloudinary(file, "video", "videos", setProgress);
      setVideoUrl(result.url);
      setThumb(result.thumbnail ?? "");
      setDuration(result.duration ?? null);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    } catch (err) {
      setError(errText(err));
    } finally {
      setProgress(null);
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      const ytId = source === "youtube" ? youtubeId(link) : null;
      if (source === "youtube" && !ytId) throw new Error("That does not look like a YouTube link. Paste the full video URL.");
      if (source === "cloudinary" && !videoUrl) throw new Error("Upload a video file first.");
      if (title.trim().length < 2) throw new Error("Give the video a title.");
      const row = {
        title: title.trim(),
        description: description.trim(),
        category,
        source,
        youtube_id: ytId,
        video_url: source === "cloudinary" ? videoUrl : null,
        thumbnail_url: source === "cloudinary" ? thumb || null : null,
        duration_seconds: source === "cloudinary" ? duration : null,
        published,
        featured,
      };
      if (video) must(await sb().from("videos").update(row).eq("id", video.id));
      else must(await sb().from("videos").insert(row));
    },
    onSuccess: () => {
      toast.success(video ? "Video updated" : "Video added");
      void queryClient.invalidateQueries({ queryKey: ["videos"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      onDone();
    },
    onError: (err) => setError(errText(err)),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    save.mutate();
  }

  const ytPreview = source === "youtube" ? youtubeId(link) : null;

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-paper p-1">
        <button type="button" onClick={() => setSource("youtube")} className={`flex h-11 items-center justify-center gap-2 rounded-lg font-semibold ${source === "youtube" ? "bg-card shadow-sm" : "text-muted"}`}>
          <Youtube className="size-5 text-danger" aria-hidden /> YouTube link
        </button>
        <button type="button" onClick={() => setSource("cloudinary")} className={`flex h-11 items-center justify-center gap-2 rounded-lg font-semibold ${source === "cloudinary" ? "bg-card shadow-sm" : "text-muted"}`}>
          <UploadCloud className="size-5 text-sea" aria-hidden /> Upload file
        </button>
      </div>
      {source === "youtube" ? (
        <Field label="YouTube video link" hint="e.g. https://www.youtube.com/watch?v=… or https://youtu.be/…">
          <input className={controlClass} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://youtu.be/…" />
        </Field>
      ) : cloudinaryReady() ? (
        <div className="grid gap-2">
          <label className="grid cursor-pointer place-items-center gap-2 rounded-2xl border-2 border-dashed border-sea/50 bg-mint/40 px-4 py-6 text-center">
            <UploadCloud className="size-7 text-sea" aria-hidden />
            <span className="font-semibold text-ink">{progress !== null ? `Uploading… ${progress}%` : videoUrl ? "Replace video file" : "Choose a video file"}</span>
            <span className="text-sm text-muted">MP4 or MOV, up to 100 MB. Stored on Cloudinary.</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} disabled={progress !== null} />
          </label>
          {videoUrl ? <video src={videoUrl} poster={thumb || undefined} controls className="aspect-video w-full rounded-xl bg-black" /> : null}
        </div>
      ) : (
        <p className="rounded-xl bg-gold-bg p-4 text-base text-ink">
          Cloudinary uploads switch on once the Cloudinary cloud name and upload preset are added to the site settings. Until then, add videos with a YouTube link.
        </p>
      )}
      {ytPreview ? <img src={`https://i.ytimg.com/vi/${ytPreview}/hqdefault.jpg`} alt="YouTube preview" className="aspect-video w-full rounded-xl object-cover" /> : null}
      <Field label="Title">
        <input className={controlClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
      </Field>
      <Field label="Description (optional)">
        <textarea className={`${controlClass} h-24 py-3`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Category">
        <select className={controlClass} value={category} onChange={(e) => setCategory(e.target.value)}>
          {[...new Set([...VIDEO_CATEGORIES, category])].map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="size-5 accent-sea" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published</label>
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="size-5 accent-sea" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured</label>
      </div>
      <ErrorNote>{error}</ErrorNote>
      <div className="flex justify-end gap-2">
        <Button tone="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={save.isPending || progress !== null}>{save.isPending ? "Saving…" : video ? "Save video" : "Add video"}</Button>
      </div>
    </form>
  );
}

function VideoManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Video | null | "new">(null);
  const videos = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => must(await sb().from("videos").select("*").order("created_at", { ascending: false })) as Video[],
  });
  const remove = useMutation({
    mutationFn: async (id: string) => must(await sb().from("videos").delete().eq("id", id)),
    onSuccess: () => {
      toast.success("Video removed");
      void queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      void queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (error) => toast.error(errText(error)),
  });
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base text-muted">Videos appear on the Videos page and the home page.</p>
        <Button onClick={() => setEditing("new")}>
          <Film className="size-4" aria-hidden /> Add video
        </Button>
      </div>
      {videos.isLoading ? (
        <Spinner className="text-sea" />
      ) : !videos.data?.length ? (
        <EmptyState icon={<Film className="size-6" />} title="No videos yet" action={<Button onClick={() => setEditing("new")}>Add your first video</Button>}>
          Upload your videos to YouTube, then paste the link here.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {videos.data.map((video) => (
            <li key={video.id} className="overflow-hidden rounded-2xl border border-line bg-card">
              <div className="relative aspect-video bg-navy">
                {videoThumb(video) ? <img src={videoThumb(video)} alt="" className="size-full object-cover" /> : null}
                <span className="absolute top-2 left-2 flex gap-1">
                  <StatusPill tone={video.published ? "sea" : "neutral"}>{video.published ? "Published" : "Hidden"}</StatusPill>
                  {video.featured ? <StatusPill tone="navy">Featured</StatusPill> : null}
                </span>
              </div>
              <div className="flex items-start gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold tracking-widest text-sea uppercase">{video.source === "youtube" ? "YouTube" : "Cloudinary"} · {video.category}</p>
                  <p className="mt-1 line-clamp-2 font-semibold text-ink">{video.title}</p>
                </div>
                <button type="button" onClick={() => setEditing(video)} className="grid size-10 place-items-center rounded-lg text-navy hover:bg-sky" aria-label={`Edit ${video.title}`}>
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remove “${video.title}”?`)) remove.mutate(video.id);
                  }}
                  className="grid size-10 place-items-center rounded-lg text-danger hover:bg-danger-bg"
                  aria-label={`Delete ${video.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add a video" : "Edit video"} wide>
        {editing !== null ? <VideoForm video={editing === "new" ? null : editing} onDone={() => setEditing(null)} /> : null}
      </Modal>
    </div>
  );
}

// ───────────────────────── orders ─────────────────────────

function AdminOrders() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"orders" | "fulfilment">("orders");
  const orders = useQuery({
    queryKey: ["admin-orders"],
    enabled: view === "orders",
    queryFn: async () => must(await sb().from("orders").select("*, items:order_items(id,title,quantity)").order("created_at", { ascending: false }).limit(300)) as Order[],
  });
  const pay = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => must(await sb().rpc("set_order_payment_status", { p_order: id, p_status: status })),
    onSuccess: () => {
      toast.success("Payment status updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error) => toast.error(errText(error)),
  });
  return (
    <div className="grid gap-4">
      <Tabs
        tabs={[
          { id: "orders", label: "Orders & payments" },
          { id: "fulfilment", label: "Fulfilment (all sellers)" },
        ]}
        value={view}
        onChange={setView}
      />
      {view === "fulfilment" ? (
        <OrderItemsBoard />
      ) : orders.isLoading ? (
        <Spinner className="text-sea" />
      ) : !orders.data?.length ? (
        <EmptyState icon={<ShoppingCart className="size-6" />} title="No orders yet">Orders from the marketplace will appear here.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[760px] text-left text-base">
            <thead className="border-b border-line bg-paper text-sm text-faint">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.data.map((o) => (
                <tr key={o.id} className="border-b border-line align-top last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{o.order_number}</p>
                    <p className="text-sm text-faint">{dateTime(o.created_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{o.shipping_name}</p>
                    <a href={`tel:${o.shipping_phone}`} className="text-sm text-sea">{o.shipping_phone}</a>
                    <p className="text-sm text-faint">{o.delivery_method === "pickup" ? "Pickup" : o.shipping_town}</p>
                  </td>
                  <td className="max-w-[16rem] px-4 py-3 text-sm text-muted">{o.items?.map((i) => `${i.quantity} × ${i.title}`).join(", ")}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{ghs(o.total)}</td>
                  <td className="px-4 py-3"><StatusPill tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</StatusPill></td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted">
                      {o.payment_method === "momo" ? `MoMo ${o.momo_network ?? ""} ${o.momo_number ?? ""}` : "Cash on delivery"}
                      {o.momo_reference ? ` · ref ${o.momo_reference}` : ""}
                    </p>
                    <select
                      className="mt-1 h-10 rounded-lg border border-line bg-card px-2 text-sm font-semibold"
                      value={o.payment_status}
                      onChange={(e) => pay.mutate({ id: o.id, status: e.target.value })}
                      aria-label={`Payment status for ${o.order_number}`}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── stores ─────────────────────────

function StoresManager() {
  const queryClient = useQueryClient();
  const stores = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => must(await sb().from("stores").select("*").order("created_at", { ascending: false })) as StoreRow[],
  });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<StoreRow> }) => must(await sb().from("stores").update(patch).eq("id", id)),
    onSuccess: () => {
      toast.success("Seller updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(errText(error)),
  });
  if (stores.isLoading) return <Spinner className="text-sea" />;
  return (
    <ul className="grid gap-3">
      {(stores.data ?? []).map((s) => (
        <li key={s.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-4">
          <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-mint text-lg font-bold text-sea">
            {s.logo_url ? <img src={s.logo_url} alt="" className="size-full object-cover" /> : s.name[0]}
          </span>
          <div className="min-w-[12rem] flex-1">
            <Link to="/shop/store/$slug" params={{ slug: s.slug }} className="flex items-center gap-1 font-semibold text-ink hover:text-sea">
              {s.name} {s.verified ? <BadgeCheck className="size-4 text-sea" aria-label="Verified" /> : null}
            </Link>
            <p className="text-sm text-faint">
              {s.town} · {s.phone || "no phone"} · {s.owner_id ? "Seller account" : "Managed by Sambea"}
            </p>
          </div>
          <StatusPill tone={s.status === "active" ? "sea" : "neutral"}>{s.status === "active" ? "Active" : "Paused"}</StatusPill>
          <Button tone="secondary" className="h-10 text-sm" onClick={() => update.mutate({ id: s.id, patch: { verified: !s.verified } })}>
            {s.verified ? "Remove badge" : "Verify"}
          </Button>
          <Button
            tone="secondary"
            className={`h-10 text-sm ${s.status === "active" ? "text-danger" : ""}`}
            onClick={() => update.mutate({ id: s.id, patch: { status: s.status === "active" ? "suspended" : "active" } })}
          >
            {s.status === "active" ? "Pause shop" : "Re-activate"}
          </Button>
        </li>
      ))}
    </ul>
  );
}

// ───────────────────────── care requests ─────────────────────────

function CareRequests() {
  const queryClient = useQueryClient();
  const requests = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => must(await sb().from("care_requests").select("*").order("created_at", { ascending: false }).limit(300)) as CareRequest[],
  });
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CareRequest["status"] }) => must(await sb().from("care_requests").update({ status }).eq("id", id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error) => toast.error(errText(error)),
  });
  const [open, setOpen] = useState<CareRequest | null>(null);
  if (requests.isLoading) return <Spinner className="text-sea" />;
  if (!requests.data?.length) {
    return <EmptyState icon={<ClipboardList className="size-6" />} title="No care requests yet">Requests from the home page form will appear here.</EmptyState>;
  }
  return (
    <>
      <ul className="grid gap-3">
        {requests.data.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-4">
            <button type="button" className="min-w-[12rem] flex-1 text-left" onClick={() => setOpen(r)}>
              <p className="font-semibold text-ink">{r.name} · <span className="text-sea">{r.service}</span></p>
              <p className="text-sm text-faint">{r.town} · {dateTime(r.created_at)}</p>
              {r.message ? <p className="mt-1 line-clamp-1 text-sm text-muted">{r.message}</p> : null}
            </button>
            <a href={`tel:${r.phone}`} className="font-semibold text-sea">{r.phone}</a>
            <select
              className="h-10 rounded-lg border border-line bg-card px-2 text-sm font-semibold"
              value={r.status}
              onChange={(e) => update.mutate({ id: r.id, status: e.target.value as CareRequest["status"] })}
              aria-label={`Status for ${r.name}`}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </li>
        ))}
      </ul>
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open?.name ?? "Request"}>
        {open ? (
          <dl className="grid gap-3 text-base">
            <div><dt className="text-sm text-faint">Service</dt><dd className="font-semibold">{open.service}</dd></div>
            <div><dt className="text-sm text-faint">Phone</dt><dd><a href={`tel:${open.phone}`} className="font-semibold text-sea">{open.phone}</a></dd></div>
            {open.email ? <div><dt className="text-sm text-faint">Email</dt><dd><a href={`mailto:${open.email}`} className="text-sea">{open.email}</a></dd></div> : null}
            <div><dt className="text-sm text-faint">Town</dt><dd>{open.town}</dd></div>
            <div><dt className="text-sm text-faint">Message</dt><dd className="whitespace-pre-line text-muted">{open.message || "—"}</dd></div>
          </dl>
        ) : null}
      </Modal>
    </>
  );
}
