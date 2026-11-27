import { useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {description ? <p className="mt-1 text-sm text-faint">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ className, children, title, action, flush = false }: { className?: string; children: ReactNode; title?: string; action?: ReactNode; flush?: boolean }) {
  return (
    <section className={cn("min-w-0 rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,20,64,0.04)]", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}

export function Kpi({ label, value, hint, icon, tone = "blue" }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: "blue" | "green" | "amber" | "red" }) {
  const tones = {
    blue: "bg-mint text-sea",
    green: "bg-leaf-bg text-leaf",
    amber: "bg-gold-bg text-gold",
    red: "bg-danger-bg text-danger",
  };
  return (
    <div className="min-w-0 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(10,20,64,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-faint">{label}</p>
        {icon ? <span className={cn("grid size-8 place-items-center rounded-lg", tones[tone])}>{icon}</span> : null}
      </div>
      <p className="mt-2 text-xl font-extrabold tracking-tight text-ink tabular-nums sm:text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

const BADGE_TONES = {
  gray: "bg-[#eef1f6] text-[#46506a]",
  blue: "bg-mint text-sea-2",
  green: "bg-leaf-bg text-leaf",
  amber: "bg-gold-bg text-gold",
  red: "bg-danger-bg text-danger",
  navy: "bg-navy text-white",
} as const;
export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({ tone = "gray", children, dot = true }: { tone?: BadgeTone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap", BADGE_TONES[tone])}>
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}

export function orderTone(status: string): BadgeTone {
  return status === "delivered" ? "green" : status === "cancelled" ? "gray" : status === "shipped" ? "blue" : status === "confirmed" ? "navy" : "amber";
}
export function payTone(status: string): BadgeTone {
  return status === "paid" ? "green" : status === "refunded" ? "gray" : "amber";
}

export function SearchInput({ value, onChange, placeholder = "Search" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-line bg-white px-2.5 text-faint focus-within:border-sea">
      <Search className="size-4 shrink-0" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-full w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-faint sm:w-56"
      />
    </label>
  );
}

export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-9 rounded-lg border border-line bg-white px-2.5 text-sm font-semibold text-ink"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Btn({
  children,
  onClick,
  tone = "secondary",
  type = "button",
  disabled,
  className,
  size = "md",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "primary" | "secondary" | "danger" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3.5 text-sm",
        tone === "primary" && "bg-sea text-white hover:bg-sea-2",
        tone === "secondary" && "border border-line bg-white text-ink hover:bg-sky",
        tone === "danger" && "border border-danger/30 bg-white text-danger hover:bg-danger-bg",
        tone === "ghost" && "text-sea hover:bg-mint",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Underline tabs used for status filters on list pages (Shopify-style). */
export function FilterTabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line px-2" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "-mb-px inline-flex h-10 shrink-0 items-center gap-1.5 border-b-2 px-3 text-sm font-bold whitespace-nowrap",
            value === t.id ? "border-sea text-sea" : "border-transparent text-faint hover:text-ink",
          )}
        >
          {t.label}
          {t.count !== undefined ? <span className="rounded-full bg-paper px-1.5 text-xs text-muted">{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable table">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}
export const th = "border-b border-line bg-paper px-3 py-2.5 text-xs font-bold tracking-wide text-faint uppercase whitespace-nowrap";
export const td = "border-b border-line px-3 py-2.5 align-middle";

export function Pagination({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-faint">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex gap-1">
        <Btn size="sm" onClick={() => onPage(page - 1)} disabled={page === 0}>
          <ChevronLeft className="size-4" aria-label="Previous page" />
        </Btn>
        <Btn size="sm" onClick={() => onPage(page + 1)} disabled={page >= pages - 1}>
          <ChevronRight className="size-4" aria-label="Next page" />
        </Btn>
      </div>
    </div>
  );
}

export function Empty({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      {icon ? <span className="grid size-12 place-items-center rounded-full bg-mint text-sea">{icon}</span> : null}
      <p className="mt-3 font-bold text-ink">{title}</p>
      {children ? <div className="mt-1 max-w-sm text-sm text-faint">{children}</div> : null}
    </div>
  );
}

/** Right-hand detail panel, like Stripe/Shopify record drawers. */
export function Drawer({ open, onClose, title, subtitle, children, footer }: { open: boolean; onClose: () => void; title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close panel" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold text-ink">{title}</h2>
            {subtitle ? <div className="mt-0.5 text-sm text-faint">{subtitle}</div> : null}
          </div>
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-paper" aria-label="Close panel">
            <X className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer> : null}
      </aside>
    </div>
  );
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Btn onClick={onClick}>
      <Download className="size-4" aria-hidden /> Export CSV
    </Btn>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-ink">
      {label}
      {children}
      {hint ? <span className="text-xs font-medium text-faint">{hint}</span> : null}
    </label>
  );
}
export const inputCls = "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink focus:border-sea";

export function relTime(value: string) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
