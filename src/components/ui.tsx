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

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent", className)}
      aria-label="Loading"
      role="status"
    />
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-card px-6 py-12 text-center">
      {icon ? <span className="grid size-14 place-items-center rounded-full bg-mint text-sea">{icon}</span> : null}
      <h3 className="mt-4 text-xl font-semibold text-ink">{title}</h3>
      {children ? <p className="mt-2 max-w-md text-base text-muted">{children}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-navy/60" aria-label="Close" onClick={onClose} />
      <div
        className={cn(
          "relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl sm:p-7",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-paper text-xl text-muted"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-base font-semibold whitespace-nowrap",
            value === tab.id ? "bg-navy text-on-navy" : "bg-card text-navy ring-1 ring-line hover:bg-sky",
          )}
        >
          {tab.label}
          {tab.count !== undefined ? (
            <span className={cn("rounded-full px-2 text-sm", value === tab.id ? "bg-white/15" : "bg-paper")}>{tab.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-xl bg-danger-bg px-4 py-3 text-base text-danger">{children}</p>;
}
