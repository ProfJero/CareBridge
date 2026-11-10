import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-card p-5 sm:p-6", className)}>
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-base font-semibold text-ink">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-sm font-medium text-faint">{hint}</span> : null}
    </label>
  );
}

export const controlClass =
  "h-12 w-full rounded-xl border border-line bg-card px-3.5 text-base font-medium text-ink placeholder:font-normal placeholder:text-faint focus:border-sea";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "ghost";
};

export function Button({ tone = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" && "bg-sea text-on-sea hover:bg-sea-2",
        tone === "secondary" && "border border-line bg-card text-navy hover:bg-sky",
        tone === "ghost" && "text-sea hover:bg-mint",
        className,
      )}
      {...props}
    />
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "sea" | "navy" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
        tone === "sea" && "bg-mint text-sea-2",
        tone === "navy" && "bg-sky text-navy",
        tone === "neutral" && "bg-paper text-muted",
      )}
    >
      {children}
    </span>
  );
}
