import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, CircleAlert, HeartHandshake, ShoppingBag, Store, UserRound } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { AuthPanel } from "@/components/auth-panel";
import { SamBee } from "@/components/brand";
import { Button, ErrorNote, Field, Spinner, controlClass } from "@/components/ui";
import { NEARBY_TOWNS, SITE } from "@/lib/config";
import { useSession } from "@/lib/session";
import { errText, sb } from "@/lib/supabase";

export const Route = createFileRoute("/welcome")({
  validateSearch: (search: Record<string, unknown>): { error?: string } => ({
    error: typeof search.error === "string" && search.error ? search.error.slice(0, 200) : undefined,
  }),
  component: WelcomePage,
  head: () => ({ meta: [{ title: "Welcome — SamBee Son and Daughter" }, { name: "robots", content: "noindex" }] }),
});

function WelcomePage() {
  const { error } = Route.useSearch();
  const { ready, userId, email, profile, refresh } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [town, setTown] = useState<string>(SITE.town);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName((v) => v || profile.full_name);
      setPhone((v) => v || profile.phone);
    }
  }, [profile]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    if (name.trim().length < 2) return setFormError("Please enter your full name.");
    if (phone.replace(/\D/g, "").length < 9) return setFormError("Please enter a phone number we can reach you on.");
    setBusy(true);
    const { error: dbError } = await sb().from("profiles").update({ full_name: name.trim(), phone: phone.trim() }).eq("id", userId!);
    setBusy(false);
    if (dbError) return setFormError(errText(dbError));
    try {
      window.localStorage.setItem("sambee.town", town);
    } catch {
      /* optional convenience only */
    }
    await refresh();
    setSaved(true);
    toast.success("Profile saved");
  }

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
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-12 lg:grid-cols-2">
          <div>
            <span className={`grid size-14 place-items-center rounded-full ${error ? "bg-danger-bg text-danger" : "bg-mint text-sea"}`}>
              {error ? <CircleAlert className="size-7" aria-hidden /> : <BadgeCheck className="size-7" aria-hidden />}
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              {error ? "That link didn't work" : "Your email is confirmed"}
            </h1>
            <p className="mt-3 text-lg text-muted">
              {error
                ? `${error}. Confirmation links expire after a while and work once. Sign in below — if your account still needs confirming, create it again with the same email to get a fresh link.`
                : "Sign in to finish setting up your account."}
            </p>
          </div>
          <AuthPanel />
        </div>
      </SiteShell>
    );
  }

  const complete = Boolean(profile?.full_name && profile?.phone);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-leaf-bg text-leaf">
            <BadgeCheck className="size-7" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Welcome to <SamBee />{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
            </h1>
            <p className="mt-2 text-lg text-muted">
              Your email <strong className="break-all text-ink">{email}</strong> is confirmed and you are signed in.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-line bg-white p-5 sm:p-7">
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
              <UserRound className="size-5 text-sea" aria-hidden /> {complete && !saved ? "Your profile" : "Complete your profile"}
            </h2>
            <p className="mt-1 text-base text-muted">Sellers and our care team use these details to reach you about orders and visits.</p>
            <form onSubmit={save} className="mt-5 grid gap-4">
              <Field label="Full name">
                <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Phone / WhatsApp number">
                <input className={controlClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" placeholder="024 000 0000" />
              </Field>
              <Field label="Your town">
                <select className={controlClass} value={town} onChange={(e) => setTown(e.target.value)}>
                  {NEARBY_TOWNS.map((t) => <option key={t}>{t}</option>)}
                  <option>Other</option>
                </select>
              </Field>
              <ErrorNote>{formError}</ErrorNote>
              <Button type="submit" disabled={busy}>{busy ? "Saving…" : saved ? "Saved ✓" : "Save and continue"}</Button>
            </form>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink">What would you like to do?</h2>
            <div className="mt-4 grid gap-3">
              {[
                { to: "/shop" as const, icon: ShoppingBag, title: "Shop online", copy: "Browse products with free delivery." },
                { to: "/sell" as const, icon: Store, title: "Open your shop", copy: "Sell your products for free. Add WhatsApp, Facebook, YouTube and short product videos." },
                { to: "/" as const, icon: HeartHandshake, title: "Request home care", copy: "Personal care, elderly care and household support in Assin Foso.", hash: "request-care" },
                { to: "/account" as const, icon: UserRound, title: "My account", copy: "Orders, wishlist and profile." },
              ].map(({ to, icon: Icon, title, copy, hash }) => (
                <Link key={title} to={to} hash={hash} className="flex items-start gap-4 rounded-2xl border border-line bg-white p-4 hover:border-sea/50">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-sea"><Icon className="size-5" aria-hidden /></span>
                  <span>
                    <strong className="block text-lg text-ink">{title}</strong>
                    <span className="text-base text-muted">{copy}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
