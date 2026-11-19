import { useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BadgeCheck, Banknote, ExternalLink, Package, Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageListInput, ShortVideoInput, SingleImageInput } from "@/components/media-upload";
import { ProductImage } from "@/components/shop/product-image";
import { Button, EmptyState, ErrorNote, Field, Modal, Panel, Spinner, StatusPill, Tabs, controlClass } from "@/components/ui";
import { NEARBY_TOWNS, SITE } from "@/lib/config";
import { STATUS_LABEL, dateTime, ghs, slugify, statusTone } from "@/lib/format";
import { useCategories, usePlatformSettings } from "@/lib/queries";
import { useSession } from "@/lib/session";
import { errText, must, sb } from "@/lib/supabase";
import type { Category, Order, OrderItem, OrderStatus, Product, Store } from "@/lib/types";

// ───────────────────────── store form (create + edit) ─────────────────────────

export function StoreForm({ store, onSaved }: { store?: Store | null; onSaved: () => void }) {
  const { userId } = useSession();
  const [name, setName] = useState(store?.name ?? "");
  const [slug, setSlug] = useState(store?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(store));
  const [description, setDescription] = useState(store?.description ?? "");
  const [phone, setPhone] = useState(store?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp ?? "");
  const [town, setTown] = useState(store?.town ?? SITE.town);
  const [logo, setLogo] = useState<string | null>(store?.logo_url ?? null);
  const [banner, setBanner] = useState<string | null>(store?.banner_url ?? null);
  const [facebook, setFacebook] = useState(store?.facebook_url ?? "");
  const [youtube, setYoutube] = useState(store?.youtube_url ?? "");
  const [video, setVideo] = useState<string | null>(store?.video_url ?? null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const cleanSlug = slugify(slug || name);
    if (name.trim().length < 2) return setError("Give your shop a name.");
    if (cleanSlug.length < 2) return setError("Choose a web address for your shop.");
    if (phone.replace(/\D/g, "").length < 9) return setError("Add a phone number customers and our team can reach.");
    if (whatsapp.trim() && whatsapp.replace(/\D/g, "").length < 9) return setError("Check the WhatsApp number — it looks too short.");
    const fb = normaliseUrl(facebook);
    const yt = normaliseUrl(youtube);
    if (fb && !/(facebook\.com|fb\.com|fb\.me)/i.test(fb)) return setError("The Facebook link should be a facebook.com page or profile link.");
    if (yt && !/(youtube\.com|youtu\.be)/i.test(yt)) return setError("The YouTube link should be a youtube.com channel or video link.");
    setBusy(true);
    const row = {
      name: name.trim(),
      slug: cleanSlug,
      description: description.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      town,
      logo_url: logo,
      banner_url: banner,
      facebook_url: fb,
      youtube_url: yt,
      video_url: video,
    };
    const result = store
      ? await sb().from("stores").update(row).eq("id", store.id)
      : await sb().from("stores").insert({ ...row, owner_id: userId });
    setBusy(false);
    if (result.error) {
      return setError(/duplicate|unique/i.test(result.error.message) ? "That shop address is taken — try another." : result.error.message);
    }
    toast.success(store ? "Shop details saved" : "Your shop is open!");
    onSaved();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Shop name">
          <input
            className={controlClass}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
          />
        </Field>
        <Field label="Shop web address" hint={`/shop/store/${slugify(slug || name) || "your-shop"}`}>
          <input
            className={controlClass}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </Field>
      </div>
      <Field label="About your shop" hint="What do you sell? Where do you deliver?">
        <textarea className={`${controlClass} h-24 py-3`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Phone">
          <input className={controlClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required />
        </Field>
        <Field label="WhatsApp / WhatsApp Business" hint="Customers can message you straight from your shop.">
          <input className={controlClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} type="tel" placeholder="024 000 0000" />
        </Field>
        <Field label="Town">
          <select className={controlClass} value={town} onChange={(e) => setTown(e.target.value)}>
            {NEARBY_TOWNS.map((item) => <option key={item}>{item}</option>)}
            {!NEARBY_TOWNS.includes(town as (typeof NEARBY_TOWNS)[number]) ? <option>{town}</option> : null}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Facebook page (optional)">
          <input className={controlClass} value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="facebook.com/yourshop" inputMode="url" />
        </Field>
        <Field label="YouTube channel (optional)">
          <input className={controlClass} value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="youtube.com/@yourshop" inputMode="url" />
        </Field>
      </div>
      <div>
        <p className="mb-1 text-base font-semibold text-ink">Shop or product video (optional)</p>
        <p className="mb-2 text-sm text-faint">A short clip showing what you sell. It plays on your shop page.</p>
        <ShortVideoInput value={video} onChange={setVideo} folder="stores" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SingleImageInput label="Logo (optional)" value={logo} onChange={setLogo} folder="stores" />
        <SingleImageInput label="Banner (optional)" value={banner} onChange={setBanner} folder="stores" />
      </div>
      <ErrorNote>{error}</ErrorNote>
      <Button type="submit" disabled={busy} className="justify-self-start">
        {busy ? "Saving…" : store ? "Save shop details" : "Open my shop"}
      </Button>
    </form>
  );
}

function normaliseUrl(value: string) {
  const v = value.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

// ───────────────────────── product editor ─────────────────────────

export function ProductEditor({
  storeId,
  product,
  categories,
  onClose,
}: {
  storeId: string;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(product?.title ?? "");
  const [categoryId, setCategoryId] = useState<string>(product?.category_id?.toString() ?? categories[0]?.id.toString() ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [compare, setCompare] = useState(product?.compare_at_price ? String(product.compare_at_price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "1");
  const [status, setStatus] = useState<Product["status"]>(product?.status ?? "active");
  const [description, setDescription] = useState(product?.description ?? "");
  const [tags, setTags] = useState(product?.tags.join(", ") ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [video, setVideo] = useState<string | null>(product?.video_url ?? null);
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      const priceNum = Number(price);
      const compareNum = compare ? Number(compare) : null;
      const stockNum = Math.floor(Number(stock));
      if (title.trim().length < 2) throw new Error("Add a product name.");
      if (!Number.isFinite(priceNum) || priceNum < 0) throw new Error("Enter a valid price.");
      if (compareNum !== null && (!Number.isFinite(compareNum) || compareNum < 0)) throw new Error("Enter a valid original price, or leave it empty.");
      if (!Number.isFinite(stockNum) || stockNum < 0) throw new Error("Enter how many you have in stock.");
      const row = {
        title: title.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        price: priceNum,
        compare_at_price: compareNum,
        stock: stockNum,
        status,
        description: description.trim(),
        tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 10),
        images,
        video_url: video,
      };
      if (product) must(await sb().from("products").update(row).eq("id", product.id));
      else must(await sb().from("products").insert({ ...row, store_id: storeId }));
    },
    onSuccess: () => {
      toast.success(product ? "Product updated" : "Product listed");
      void queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (err) => setError(errText(err)),
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        save.mutate();
      }}
    >
      <div>
        <p className="mb-1 text-base font-semibold text-ink">Photos</p>
        <p className="mb-2 text-sm text-faint">The first photo is the main one. Up to 6.</p>
        <ImageListInput value={images} onChange={setImages} folder="products" />
      </div>
      <div>
        <p className="mb-1 text-base font-semibold text-ink">Short product video (optional)</p>
        <p className="mb-2 text-sm text-faint">Show the product in use. Keep it short: 3 MB max.</p>
        <ShortVideoInput value={video} onChange={setVideo} folder="products" />
      </div>
      <Field label="Product name">
        <input className={controlClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select className={controlClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Visibility">
          <select className={controlClass} value={status} onChange={(e) => setStatus(e.target.value as Product["status"])}>
            <option value="active">Live in the shop</option>
            <option value="draft">Draft (hidden)</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Price (GH₵)">
          <input className={controlClass} value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" required />
        </Field>
        <Field label="Original price" hint="Optional, shows a discount">
          <input className={controlClass} value={compare} onChange={(e) => setCompare(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="In stock">
          <input className={controlClass} value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" required />
        </Field>
      </div>
      <Field label="Description">
        <textarea className={`${controlClass} h-32 py-3`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Search tags" hint="Comma separated, e.g. elderly, mobility">
        <input className={controlClass} value={tags} onChange={(e) => setTags(e.target.value)} />
      </Field>
      <ErrorNote>{error}</ErrorNote>
      <div className="flex justify-end gap-2">
        <Button tone="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : product ? "Save changes" : "List product"}</Button>
      </div>
    </form>
  );
}

// ───────────────────────── products tab ─────────────────────────

export function ProductsTable({ storeId, admin = false }: { storeId?: string; admin?: boolean }) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [query, setQuery] = useState("");
  const products = useQuery({
    queryKey: [admin ? "admin-products" : "seller-products", storeId],
    queryFn: async () => {
      let q = sb().from("products").select("*, store:stores(id,name,slug,town,verified,whatsapp,phone,logo_url), category:categories(id,name,slug,icon)").order("created_at", { ascending: false });
      if (storeId) q = q.eq("store_id", storeId);
      return must(await q.limit(500)) as Product[];
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => must(await sb().from("products").delete().eq("id", id)),
    onSuccess: () => {
      toast.success("Product deleted");
      void queryClient.invalidateQueries({ queryKey: [admin ? "admin-products" : "seller-products"] });
    },
    onError: (error) => toast.error(errText(error)),
  });
  const feature = useMutation({
    mutationFn: async (p: Product) => must(await sb().from("products").update({ featured: !p.featured }).eq("id", p.id)),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: (error) => toast.error(errText(error)),
  });

  const rows = (products.data ?? []).filter((p) => !query.trim() || `${p.title} ${p.store?.name ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input className={`${controlClass} max-w-xs`} placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
        {storeId ? (
          <Button className="ml-auto" onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden /> Add product
          </Button>
        ) : null}
      </div>
      {products.isLoading ? (
        <Spinner className="text-sea" />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Package className="size-6" />} title="No products yet" action={storeId ? <Button onClick={() => setEditing("new")}>Add your first product</Button> : undefined}>
          Products you list appear in the marketplace straight away.
        </EmptyState>
      ) : (
        <ul className="grid gap-2">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card p-3 sm:p-4">
              <span className="size-14 shrink-0 overflow-hidden rounded-xl">
                <ProductImage src={p.images[0]} alt="" icon={p.category?.icon} seed={p.id} width={120} />
              </span>
              <div className="min-w-[10rem] flex-1">
                <Link to="/shop/product/$id" params={{ id: p.id }} className="font-semibold text-ink hover:text-sea">{p.title}</Link>
                <p className="text-sm text-faint">
                  {admin && p.store ? `${p.store.name} · ` : ""}
                  {p.category?.name ?? "Uncategorised"} · {p.sold_count} sold
                </p>
              </div>
              <p className="w-24 font-semibold tabular-nums">{ghs(p.price)}</p>
              <p className={`w-24 text-sm font-semibold ${p.stock <= 3 ? "text-gold" : "text-muted"}`}>
                {p.stock <= 0 ? "Out of stock" : `${p.stock} in stock`}
              </p>
              <StatusPill tone={p.status === "active" ? "sea" : "neutral"}>{p.status === "active" ? "Live" : p.status === "draft" ? "Draft" : "Archived"}</StatusPill>
              <div className="flex gap-1">
                {admin ? (
                  <Button tone="ghost" className="h-10 px-3 text-sm" onClick={() => feature.mutate(p)}>
                    {p.featured ? "★ Featured" : "☆ Feature"}
                  </Button>
                ) : null}
                <button type="button" onClick={() => setEditing(p)} className="grid size-10 place-items-center rounded-lg text-navy hover:bg-sky" aria-label={`Edit ${p.title}`}>
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete “${p.title}”? This cannot be undone.`)) remove.mutate(p.id);
                  }}
                  className="grid size-10 place-items-center rounded-lg text-danger hover:bg-danger-bg"
                  aria-label={`Delete ${p.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add a product" : "Edit product"} wide>
        {editing !== null && categories.length ? (
          <ProductEditor
            storeId={editing === "new" ? storeId! : editing.store_id}
            product={editing === "new" ? null : editing}
            categories={categories}
            onClose={() => setEditing(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}

// ───────────────────────── orders tab ─────────────────────────

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function OrderItemsBoard({ storeId }: { storeId?: string }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"open" | "all">("open");
  const items = useQuery({
    queryKey: ["seller-items", storeId ?? "all"],
    queryFn: async () => {
      let q = sb().from("order_items").select("*, order:orders(*)").order("created_at", { ascending: false });
      if (storeId) q = q.eq("store_id", storeId);
      return must(await q.limit(500)) as OrderItem[];
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => must(await sb().rpc("set_order_item_status", { p_item: id, p_status: status })),
    onSuccess: () => {
      toast.success("Order updated");
      void queryClient.invalidateQueries({ queryKey: ["seller-items"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error) => toast.error(errText(error)),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, { order: Order; items: OrderItem[] }>();
    for (const item of items.data ?? []) {
      if (!item.order) continue;
      if (filter === "open" && (item.status === "delivered" || item.status === "cancelled")) continue;
      const entry = map.get(item.order_id) ?? { order: item.order, items: [] };
      entry.items.push(item);
      map.set(item.order_id, entry);
    }
    return [...map.values()];
  }, [items.data, filter]);

  return (
    <div className="grid gap-4">
      <Tabs
        tabs={[
          { id: "open", label: "Needs action" },
          { id: "all", label: "All orders" },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {items.isLoading ? (
        <Spinner className="text-sea" />
      ) : grouped.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="size-6" />} title={filter === "open" ? "No orders waiting" : "No orders yet"}>
          New orders for your products will show up here.
        </EmptyState>
      ) : (
        grouped.map(({ order, items: orderItems }) => (
          <Panel key={order.id} className="p-0">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <p className="text-lg font-semibold">{order.order_number}</p>
                <p className="text-sm text-faint">{dateTime(order.created_at)}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-ink">{order.shipping_name} · <a href={`tel:${order.shipping_phone}`} className="text-sea">{order.shipping_phone}</a></p>
                <p className="text-muted">
                  {order.delivery_method === "pickup" ? "Pickup" : `${order.shipping_address}, ${order.shipping_town}`}
                </p>
                <p className="text-muted">
                  {order.payment_method === "momo" ? `MoMo ${order.momo_network ?? ""}${order.momo_reference ? ` · ref ${order.momo_reference}` : ""}` : "Cash on delivery"} ·{" "}
                  <span className={order.payment_status === "paid" ? "font-semibold text-sea" : ""}>{order.payment_status}</span>
                </p>
              </div>
            </div>
            {order.notes ? <p className="border-b border-line bg-gold-bg px-5 py-2 text-sm text-ink">Note: {order.notes}</p> : null}
            <ul>
              {orderItems.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3 last:border-0">
                  <span className="size-12 shrink-0 overflow-hidden rounded-lg">
                    <ProductImage src={item.image} alt="" seed={item.product_id ?? item.id} width={100} />
                  </span>
                  <div className="min-w-[10rem] flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted">{item.quantity} × {ghs(item.unit_price)} = {ghs(item.quantity * Number(item.unit_price))}</p>
                  </div>
                  <StatusPill tone={statusTone(item.status)}>{STATUS_LABEL[item.status]}</StatusPill>
                  <div className="flex gap-2">
                    {NEXT[item.status].map((next) => (
                      <Button
                        key={next}
                        tone={next === "cancelled" ? "secondary" : "primary"}
                        className="h-10 px-3 text-sm"
                        disabled={update.isPending}
                        onClick={() => {
                          if (next === "cancelled" && !window.confirm("Cancel this item? Stock will be returned.")) return;
                          update.mutate({ id: item.id, status: next });
                        }}
                      >
                        {next === "confirmed" ? "Accept" : next === "shipped" ? "Mark sent" : next === "delivered" ? "Mark delivered" : "Cancel"}
                      </Button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        ))
      )}
    </div>
  );
}

// ───────────────────────── seller overview ─────────────────────────

function SellerStats({ storeId }: { storeId: string }) {
  const stats = useQuery({
    queryKey: ["seller-stats", storeId],
    queryFn: async () => {
      const [items, products] = await Promise.all([
        sb().from("order_items").select("status,quantity,unit_price").eq("store_id", storeId),
        sb().from("products").select("id,stock,status").eq("store_id", storeId),
      ]);
      const rows = (items.data ?? []) as Pick<OrderItem, "status" | "quantity" | "unit_price">[];
      const prods = (products.data ?? []) as Pick<Product, "id" | "stock" | "status">[];
      return {
        revenue: rows.filter((r) => r.status === "delivered").reduce((s, r) => s + r.quantity * Number(r.unit_price), 0),
        open: rows.filter((r) => r.status === "pending" || r.status === "confirmed" || r.status === "shipped").length,
        pending: rows.filter((r) => r.status === "pending").length,
        live: prods.filter((p) => p.status === "active").length,
        low: prods.filter((p) => p.status === "active" && p.stock <= 3).length,
      };
    },
  });
  const s = stats.data;
  const cards = [
    { label: "Delivered sales", value: s ? ghs(s.revenue) : "—", icon: Banknote },
    { label: "Open order items", value: s?.open ?? "—", icon: ShoppingCart },
    { label: "Live products", value: s?.live ?? "—", icon: Package },
    { label: "Low stock", value: s?.low ?? "—", icon: AlertTriangle },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-2xl border border-line bg-card p-4">
          <Icon className="size-5 text-sea" aria-hidden />
          <p className="mt-3 text-2xl font-bold text-ink tabular-nums">{value}</p>
          <p className="text-sm text-faint">{label}</p>
        </div>
      ))}
      {s && s.pending > 0 ? (
        <p className="col-span-full rounded-xl bg-gold-bg px-4 py-3 text-base text-ink">
          You have <strong>{s.pending}</strong> new order item{s.pending > 1 ? "s" : ""} to accept.
        </p>
      ) : null}
    </div>
  );
}

export function SellerDashboard({ store }: { store: Store }) {
  const { refresh } = useSession();
  const { data: platform } = usePlatformSettings();
  const [tab, setTab] = useState<"products" | "orders" | "settings">("orders");
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-widest text-sea uppercase">Seller centre</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            {store.name}
            {store.verified ? <BadgeCheck className="size-7 text-sea" aria-label="Verified seller" /> : null}
          </h1>
          {store.status === "suspended" ? (
            <p className="mt-2 rounded-xl bg-danger-bg px-3 py-2 text-base text-danger">
              Your shop is paused by the marketplace team. Contact {SITE.inbox} for help.
            </p>
          ) : null}
        </div>
        <Link
          to="/shop/store/$slug"
          params={{ slug: store.slug }}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-card px-4 font-semibold text-navy"
        >
          View my shop <ExternalLink className="size-4" aria-hidden />
        </Link>
      </div>
      <p className="rounded-xl bg-leaf-bg px-4 py-3 text-base text-ink">
        <strong>{platform?.fees_enabled ? `Seller fee: ${platform.seller_fee_percent}% per sale.` : "Selling is free."}</strong>{" "}
        {platform?.fee_note ?? "Selling on SamBee is free for now."} {platform?.free_delivery !== false ? "Your customers get free delivery." : ""}
      </p>
      <SellerStats storeId={store.id} />
      <Tabs
        tabs={[
          { id: "orders", label: "Orders" },
          { id: "products", label: "Products" },
          { id: "settings", label: "Shop settings" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "orders" ? (
        <OrderItemsBoard storeId={store.id} />
      ) : tab === "products" ? (
        <ProductsTable storeId={store.id} />
      ) : (
        <Panel>
          <StoreForm store={store} onSaved={() => void refresh()} />
        </Panel>
      )}
    </div>
  );
}
