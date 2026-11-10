import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  Clock3,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Overview } from "@/components/admin/overview";
import { Recruitment } from "@/components/admin/recruitment";
import { WorkspaceSection } from "@/components/admin/sections";
import { NAV, NAV_GROUPS, type Section, sectionTitle } from "@/data/demo";
import { signOutDemo } from "@/lib/demo-session";
import { cn } from "@/lib/cn";

const ICONS = {
  overview: LayoutDashboard,
  clients: Users,
  caregivers: HeartHandshake,
  plans: ClipboardList,
  schedule: CalendarDays,
  visits: Clock3,
  recruitment: BriefcaseBusiness,
  finance: Wallet,
  reports: Activity,
  messages: MessageSquare,
  settings: Settings,
} as const;

const NOTICES = [
  "Ama Kusi checked in for the Labone visit.",
  "Nana Akua Boateng applied for Registered Nurse.",
  "Two visits this afternoon are still unconfirmed.",
];

export function AdminApp({
  section,
  onSection,
}: {
  section: Section;
  onSection: (section: Section) => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notices, setNotices] = useState(false);

  useEffect(() => {
    setQuery("");
    setOpen(false);
    setNotices(false);
  }, [section]);

  function signOut() {
    signOutDemo();
    void navigate({ to: "/admin/login" });
  }

  const title = section === "overview" ? "Good morning, Admin" : sectionTitle(section);
  const subtitle =
    section === "overview"
      ? "A sample view of Grace Home Care. Nothing here is a real client record."
      : `Sample ${sectionTitle(section).toLowerCase()} for the organisation workspace.`;

  return (
    <div className="min-h-screen bg-paper text-ink">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-navy/50 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-navy px-4 py-5 text-on-navy transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-3 px-2">
          <Wordmark light kicker="Administration" />
          <button type="button" className="grid size-11 place-items-center lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-5 rounded-2xl bg-navy-2 px-3 py-3">
          <p className="text-base font-semibold">Grace Home Care</p>
          <p className="text-sm text-navy-muted">Organisation workspace</p>
        </div>
        <nav className="mt-5 min-h-0 flex-1 overflow-auto pr-1" aria-label="Workspace">
          {NAV_GROUPS.map((group) => (
            <div key={group} className="mb-4">
              <p className="px-3 pb-2 text-sm font-bold tracking-widest text-navy-muted uppercase">{group}</p>
              {NAV.filter((item) => item.group === group).map((item) => {
                const Icon = ICONS[item.id];
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSection(item.id)}
                    className={cn(
                      "mb-1 flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-base font-semibold",
                      active ? "bg-white/10 text-on-navy" : "text-navy-muted hover:bg-white/5 hover:text-on-navy",
                    )}
                  >
                    <Icon className={cn("size-5", active && "text-mint")} aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {item.id === "recruitment" ? (
                      <span className="rounded-full bg-mint px-2 py-0.5 text-sm text-sea-2">5</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="flex items-center gap-3 px-2">
            <span className="grid size-11 place-items-center rounded-full bg-mint text-base font-bold text-sea-2">AD</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold">Admin Demo</span>
              <span className="block text-sm text-navy-muted">Sample administrator</span>
            </span>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-3 flex h-12 w-full items-center gap-2 rounded-xl px-3 text-base font-semibold text-navy-muted hover:bg-white/5 hover:text-on-navy"
          >
            <LogOut className="size-5" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-line bg-card px-4 sm:px-6">
          <button type="button" className="grid size-11 place-items-center rounded-xl text-navy lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-6" />
          </button>
          <p className="hidden text-base text-faint sm:block">
            Workspace <span className="px-1">/</span> <strong className="font-semibold text-ink">{sectionTitle(section)}</strong>
          </p>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border border-line px-3 text-faint sm:max-w-xs sm:flex-none">
              <Search className="size-5 shrink-0" aria-hidden />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this page"
                aria-label="Search this page"
                className="w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-faint"
              />
            </label>
            <div className="relative">
              <button
                type="button"
                className="relative grid size-12 place-items-center rounded-xl border border-line text-navy"
                aria-label="Notifications"
                aria-expanded={notices}
                onClick={() => setNotices((value) => !value)}
              >
                <Bell className="size-5" />
                <span className="absolute top-2 right-2 size-2.5 rounded-full bg-sea" />
              </button>
              {notices ? (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-line bg-card p-3 shadow-sm">
                  <p className="px-2 py-1 text-base font-semibold">Sample notices</p>
                  <ul className="mt-1">
                    {NOTICES.map((item) => (
                      <li key={item} className="rounded-xl px-2 py-2 text-base text-muted">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <span className="hidden rounded-full bg-mint px-3 py-2 text-sm font-semibold text-sea-2 md:inline">Sample data</span>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-widest text-sea uppercase">Grace Home Care</p>
              <h1 className="mt-1 text-4xl font-semibold tracking-tight text-ink">{title}</h1>
              <p className="mt-2 max-w-2xl text-lg text-muted">{subtitle}</p>
            </div>
          </div>

          {section === "overview" ? (
            <Overview query={query} onSection={onSection} />
          ) : section === "recruitment" ? (
            <Recruitment query={query} />
          ) : (
            <WorkspaceSection section={section} query={query} />
          )}

          <footer className="mt-8 flex flex-col gap-2 border-t border-line pt-4 text-base text-faint sm:flex-row sm:justify-between">
            <span>© 2026 CareBridge · Home care management</span>
            <span>Sample workspace · Built by ProfJero</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
