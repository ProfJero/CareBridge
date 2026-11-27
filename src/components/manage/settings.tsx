import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, CircleAlert, Cloud, Database, Mail, ShieldCheck, Store } from "lucide-react";
import { Badge, Btn, Card, PageHeader, inputCls } from "@/components/manage/kit";
import { usePlatformSettings } from "@/lib/queries";
import { errText, must } from "@/lib/supabase";
import { LogoMark } from "@/components/brand";
import { cloudinaryReady } from "@/lib/cloudinary";
import { CLOUDINARY, SHOP, SITE } from "@/lib/config";
import { sb } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

function Status({ ok, label }: { ok: boolean; label: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-leaf"><CheckCircle2 className="size-4" aria-hidden /> {label}</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gold"><CircleAlert className="size-4" aria-hidden /> {label}</span>
  );
}

export function SettingsAdmin({ onCustomers }: { onCustomers: () => void }) {
  const admins = useQuery({
    queryKey: ["admin-admins"],
    queryFn: async () => ((await sb().from("profiles").select("id,full_name,email,is_admin").eq("is_admin", true)).data ?? []) as Profile[],
  });
  return (
    <>
      <PageHeader title="Settings" description="Business details, connected services and who can access this dashboard." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 [overflow-wrap:anywhere] xl:grid-cols-2">
        <Card title="Home Care business">
          <div className="flex items-start gap-4">
            <span className="h-14"><LogoMark kind="care" className="h-full" /></span>
            <dl className="grid min-w-0 flex-1 gap-2 text-sm break-words">
              <div><dt className="text-xs text-faint">Name</dt><dd className="font-bold">{SITE.name}</dd></div>
              <div><dt className="text-xs text-faint">Tagline</dt><dd>{SITE.tagline}</dd></div>
              <div><dt className="text-xs text-faint">Location</dt><dd>{SITE.town}, {SITE.region}, {SITE.country}</dd></div>
              <div><dt className="text-xs text-faint">Phone</dt><dd>{SITE.phone || <span className="text-gold">Not set — add VITE_CONTACT_PHONE</span>}</dd></div>
            </dl>
          </div>
        </Card>
        <Card title="Online Trading Platform">
          <div className="flex items-start gap-4">
            <span className="h-12"><LogoMark kind="shop" className="h-full" /></span>
            <dl className="grid min-w-0 flex-1 gap-2 text-sm break-words">
              <div><dt className="text-xs text-faint">Name</dt><dd className="font-bold">{SHOP.name}</dd></div>
              <div><dt className="text-xs text-faint">Slogan</dt><dd>{SHOP.slogan}</dd></div>
              <div><dt className="text-xs text-faint">Mobile Money merchant</dt><dd>{SITE.momoMerchant ? `${SITE.momoMerchant} (${SITE.momoMerchantName})` : <span className="text-gold">Not set — customers are called with payment details</span>}</dd></div>
              <div><dt className="text-xs text-faint">Delivery</dt><dd>See “Fees &amp; delivery” below</dd></div>
            </dl>
          </div>
        </Card>
        <FeesCard />
        <Card title="Connected services">
          <ul className="divide-y divide-line text-sm">
            <li className="flex items-center justify-between gap-3 py-3 first:pt-0">
              <span className="flex min-w-0 items-center gap-2.5"><Database className="size-5 text-sea" aria-hidden /><span><strong>Supabase</strong><br /><span className="text-faint">Accounts, products, orders, requests</span></span></span>
              <Status ok label="Connected" />
            </li>
            <li className="flex items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 items-center gap-2.5"><Cloud className="size-5 text-sea" aria-hidden /><span><strong>Cloudinary</strong><br /><span className="text-faint">{CLOUDINARY.cloudName ? `Cloud: ${CLOUDINARY.cloudName}` : "Photo and video uploads"}</span></span></span>
              <Status ok={cloudinaryReady()} label={cloudinaryReady() ? "Connected" : "Not set up"} />
            </li>
            <li className="flex items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 items-center gap-2.5"><Mail className="size-5 text-sea" aria-hidden /><span><strong>Form emails</strong><br /><span className="text-faint">{SITE.inbox}</span></span></span>
              <Status ok label="Active" />
            </li>
            <li className="flex items-center justify-between gap-3 py-3 last:pb-0">
              <span className="flex min-w-0 items-center gap-2.5"><Store className="size-5 text-sea" aria-hidden /><span><strong>Hosting</strong><br /><span className="text-faint">Cloudflare Pages · jonnybee.pages.dev</span></span></span>
              <Status ok label="Live" />
            </li>
          </ul>
          {!cloudinaryReady() ? (
            <p className="mt-3 rounded-lg bg-gold-bg p-3 text-sm [overflow-wrap:anywhere] text-ink">
              To switch on direct uploads, add <code>VITE_CLOUDINARY_CLOUD_NAME</code> and an unsigned <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> to the site settings and redeploy.
            </p>
          ) : null}
        </Card>
        <Card title="Team access" action={<button type="button" onClick={onCustomers} className="inline-flex min-h-7 items-center px-1 text-xs font-bold text-sea">Manage in Customers</button>}>
          <p className="mb-3 text-sm text-faint">
            These accounts can open this dashboard. To add someone, ask them to create an account on the site, then open them in Customers and choose “Make admin”.
          </p>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
            {(admins.data ?? []).map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-lg border border-line p-2.5 text-sm">
                <ShieldCheck className="size-4 text-sea" aria-hidden />
                <span className="min-w-0 flex-1 truncate"><strong>{a.full_name || "Admin"}</strong> <span className="text-faint">{a.email}</span></span>
                <Badge tone="navy">Admin</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

/** Selling is free today; this switch is how JonnyBee starts charging sellers later. */
function FeesCard() {
  const queryClient = useQueryClient();
  const { data } = usePlatformSettings();
  const [enabled, setEnabled] = useState(false);
  const [pct, setPct] = useState("0");
  const [note, setNote] = useState("");
  const [freeDelivery, setFreeDelivery] = useState(true);
  useEffect(() => {
    if (!data) return;
    setEnabled(data.fees_enabled);
    setPct(String(data.seller_fee_percent));
    setNote(data.fee_note);
    setFreeDelivery(data.free_delivery);
  }, [data]);
  const fees = useQuery({
    queryKey: ["admin-fees-total"],
    queryFn: async () => {
      const { data: rows } = await sb().from("order_items").select("platform_fee,status").neq("status", "cancelled").gt("platform_fee", 0).limit(10000);
      return ((rows ?? []) as { platform_fee: number }[]).reduce((s, r) => s + Number(r.platform_fee), 0);
    },
  });
  const save = useMutation({
    mutationFn: async () => {
      const n = Number(pct);
      if (!Number.isFinite(n) || n < 0 || n > 50) throw new Error("The fee must be between 0 and 50%.");
      must(
        await sb()
          .from("platform_settings")
          .update({ fees_enabled: enabled, seller_fee_percent: n, fee_note: note.trim() || "Selling on JonnyBee is free for now.", free_delivery: freeDelivery, updated_at: new Date().toISOString() })
          .eq("id", 1),
      );
    },
    onSuccess: () => {
      toast.success("Fees and delivery saved");
      void queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
    },
    onError: (e) => toast.error(errText(e)),
  });
  return (
    <Card title="Fees & delivery">
      <div className="grid gap-4 text-sm">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-0.5 size-5 accent-sea" checked={freeDelivery} onChange={(e) => setFreeDelivery(e.target.checked)} />
          <span>
            <strong>Free delivery for customers</strong>
            <br />
            <span className="text-faint">When off: GH₵ 10 in Assin Foso, GH₵ 25 elsewhere in the Central Region, GH₵ 45 other regions.</span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-0.5 size-5 accent-sea" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span>
            <strong>Charge sellers a fee on each sale</strong>
            <br />
            <span className="text-faint">Off = selling is free. Fees apply only to orders placed after you switch this on.</span>
          </span>
        </label>
        <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
          <label className="grid gap-1 font-bold">
            Fee per sale (%)
            <input className={inputCls} value={pct} onChange={(e) => setPct(e.target.value)} inputMode="decimal" disabled={!enabled} />
          </label>
          <label className="grid gap-1 font-bold">
            Message shown to sellers
            <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-faint">Fees recorded so far: <strong className="text-ink">GH₵ {(fees.data ?? 0).toFixed(2)}</strong></span>
          <Btn tone="primary" onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Btn>
        </div>
      </div>
    </Card>
  );
}
