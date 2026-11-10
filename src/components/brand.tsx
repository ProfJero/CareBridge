import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl bg-sea text-on-sea",
        className,
      )}
    >
      <HeartHandshake className="size-6" aria-hidden />
    </span>
  );
}

export function Wordmark({ light = false, kicker = "Home care" }: { light?: boolean; kicker?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <LogoMark />
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate font-display text-xl leading-none font-semibold",
            light ? "text-on-navy" : "text-ink",
          )}
        >
          CareBridge
        </span>
        <span
          className={cn(
            "mt-1 block text-sm font-semibold tracking-widest uppercase",
            light ? "text-navy-muted" : "text-sea",
          )}
        >
          {kicker}
        </span>
      </span>
    </span>
  );
}
