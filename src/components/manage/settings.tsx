import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, Cloud, Database, Mail, ShieldCheck, Store } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/manage/kit";
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
        <Card title="Online Trading Center">
          <div className="flex items-start gap-4">
            <span className="h-12"><LogoMark kind="shop" className="h-full" /></span>
            <dl className="grid min-w-0 flex-1 gap-2 text-sm break-words">
              <div><dt className="text-xs text-faint">Name</dt><dd className="font-bold">{SHOP.name}</dd></div>
              <div><dt className="text-xs text-faint">Slogan</dt><dd>{SHOP.slogan}</dd></div>
              <div><dt className="text-xs text-faint">Mobile Money merchant</dt><dd>{SITE.momoMerchant ? `${SITE.momoMerchant} (${SITE.momoMerchantName})` : <span className="text-gold">Not set — customers are called with payment details</span>}</dd></div>
              <div><dt className="text-xs text-faint">Delivery fees</dt><dd>GH₵ 10 Assin Foso · GH₵ 25 Central Region · GH₵ 45 other regions · pickup free</dd></div>
            </dl>
          </div>
        </Card>
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
              <span className="flex min-w-0 items-center gap-2.5"><Store className="size-5 text-sea" aria-hidden /><span><strong>Hosting</strong><br /><span className="text-faint">Cloudflare Pages · sambee-snd.pages.dev</span></span></span>
              <Status ok label="Live" />
            </li>
          </ul>
          {!cloudinaryReady() ? (
            <p className="mt-3 rounded-lg bg-gold-bg p-3 text-sm [overflow-wrap:anywhere] text-ink">
              To switch on direct uploads, add <code>VITE_CLOUDINARY_CLOUD_NAME</code> and an unsigned <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> to the site settings and redeploy.
            </p>
          ) : null}
        </Card>
        <Card title="Team access" action={<button type="button" onClick={onCustomers} className="text-xs font-bold text-sea">Manage in Customers</button>}>
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
