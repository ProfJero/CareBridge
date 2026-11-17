import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl bg-sea text-on-sea", className)}>
      <HeartHandshake className="size-6" aria-hidden />
    </span>
  );
}

export function Wordmark({ light = false, kicker = "Home Care · Assin Foso" }: { light?: boolean; kicker?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <LogoMark />
      <span className="min-w-0">
        <span
          className={cn(
            "block font-display text-base leading-tight font-semibold sm:truncate sm:text-xl",
            light ? "text-on-navy" : "text-ink",
          )}
        >
          Sambea Son &amp; Daughter
        </span>
        <span
          className={cn(
            "mt-0.5 hidden truncate text-xs font-semibold tracking-widest uppercase min-[400px]:block sm:text-sm",
            light ? "text-navy-muted" : "text-sea",
          )}
        >
          {kicker}
        </span>
      </span>
    </span>
  );
}
