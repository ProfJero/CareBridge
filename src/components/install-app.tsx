import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Download, Share, SquarePlus } from "lucide-react";
import { APPS, appForPath, type AppKind } from "@/lib/app-kind";
import { Modal } from "@/components/ui";
import { cn } from "@/lib/cn";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

// The browser offers one install prompt per page/manifest; remember which app it belongs to.
let deferred: { event: InstallEvent; kind: AppKind } | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = { event: e as InstallEvent, kind: appForPath(window.location.pathname, window.location.search) };
    listeners.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((fn) => fn());
  });
}

/** <head> tags that make the current section installable as its own app. */
export function AppHead() {
  const { pathname, search } = useRouterState({ select: (s) => ({ pathname: s.location.pathname, search: s.location.searchStr }) });
  const app = APPS[appForPath(pathname, search)];
  return (
    <>
      <link rel="manifest" href={app.manifest} />
      <link rel="apple-touch-icon" sizes="180x180" href={app.appleIcon} />
      <meta name="application-name" content={app.shortName} />
      <meta name="apple-mobile-web-app-title" content={app.shortName} />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </>
  );
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function InstallAppButton({ className, compact = false, tone = "light" }: { className?: string; compact?: boolean; tone?: "light" | "dark" }) {
  const { pathname, search } = useRouterState({ select: (s) => ({ pathname: s.location.pathname, search: s.location.searchStr }) });
  const kind = appForPath(pathname, search);
  const app = APPS[kind];
  const [, force] = useState(0);
  const [help, setHelp] = useState(false);
  const [standalone, setStandalone] = useState(true);

  useEffect(() => {
    setStandalone(isStandalone());
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  if (standalone) return null;

  async function install() {
    if (deferred && deferred.kind === kind) {
      const current = deferred;
      await current.event.prompt();
      const choice = await current.event.userChoice;
      if (choice.outcome === "accepted") deferred = null;
      return;
    }
    setHelp(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        className={cn(
          "inline-flex items-center gap-1.5 font-bold whitespace-nowrap",
          tone === "dark" ? "text-white hover:underline" : "text-navy hover:text-sea",
          className,
        )}
      >
        <Download className="size-4 shrink-0" aria-hidden />
        {compact ? "Get the app" : app.label}
      </button>
      <Modal open={help} onClose={() => setHelp(false)} title={`Install ${app.name}`}>
        <div className="flex items-center gap-4">
          <img src={app.appleIcon} alt="" width={64} height={64} className="size-16 rounded-2xl ring-1 ring-line" />
          <p className="text-base text-muted">
            {kind === "admin"
              ? "Add the admin dashboard to your home screen to manage orders and requests in one tap."
              : kind === "shop"
                ? "Add the SamBee shop to your home screen to shop in one tap."
                : "Add SamBee Home Care to your home screen to request care in one tap."}
          </p>
        </div>
        {isIos() ? (
          <ol className="mt-5 grid gap-3 text-base">
            <li className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-mint font-bold text-sea">1</span> Tap the <Share className="inline size-5 text-sea" aria-label="Share" /> Share button in Safari.</li>
            <li className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-mint font-bold text-sea">2</span> Choose <strong>Add to Home Screen</strong> <SquarePlus className="inline size-5 text-sea" aria-hidden />.</li>
            <li className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-mint font-bold text-sea">3</span> It will be named <strong>{app.shortName}</strong>. Tap <strong>Add</strong>.</li>
          </ol>
        ) : (
          <ol className="mt-5 grid gap-3 text-base">
            <li className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-mint font-bold text-sea">1</span> Open your browser menu (⋮ in Chrome).</li>
            <li className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-mint font-bold text-sea">2</span> Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
            <li className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-mint font-bold text-sea">3</span> It installs as <strong>{app.shortName}</strong>.</li>
          </ol>
        )}
        <p className="mt-5 rounded-xl bg-paper p-3 text-sm text-faint">
          Home Care, the Online Shop and the Admin dashboard are separate apps. Open the section you want, then install from there.
        </p>
      </Modal>
    </>
  );
}
