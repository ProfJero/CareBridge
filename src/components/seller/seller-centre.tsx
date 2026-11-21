import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageListInput, ShortVideoInput, SingleImageInput } from "@/components/media-upload";
import { Button, ErrorNote, Field, controlClass } from "@/components/ui";
import { NEARBY_TOWNS, SITE } from "@/lib/config";
import { slugify } from "@/lib/format";
import { useSession } from "@/lib/session";
import { errText, must, sb } from "@/lib/supabase";
import type { Category, Product, Store } from "@/lib/types";

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
