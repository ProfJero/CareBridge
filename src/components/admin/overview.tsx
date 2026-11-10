import { useEffect, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, HeartHandshake, Plus, Users } from "lucide-react";
import { Panel, StatusPill } from "@/components/ui";
import { CANDIDATES, VISITS, initials, type Section } from "@/data/demo";
import { readSubmittedApplications, type SubmittedApplication } from "@/lib/application-inbox";

export function Overview({ query, onSection }: { query: string; onSection: (section: Section) => void }) {
  const [submitted, setSubmitted] = useState<SubmittedApplication[]>([]);
  useEffect(() => {
    setSubmitted(readSubmittedApplications());
  }, []);

  const q = query.trim().toLowerCase();
  const visits = VISITS.filter((visit) =>
    !q || `${visit.caregiver} ${visit.client} ${visit.type}`.toLowerCase().includes(q),
  );
  const applications = [
    ...submitted.map((item) => ({
      name: item.name,
      role: item.role,
      when: "Just submitted",
      status: "New",
    })),
    ...CANDIDATES.slice(0, 3).map((item) => ({
      name: item.name,
      role: item.role,
      when: item.date,
      status: item.stage,
    })),
  ].filter((item) => !q || `${item.name} ${item.role}`.toLowerCase().includes(q));

  const stats = [
    { label: "Active clients", value: "128", note: "+12 this month", icon: Users },
    { label: "Caregivers on duty", value: "46", note: "4 more than yesterday", icon: HeartHandshake },
    { label: "Today's visits", value: "34", note: "8 still to start", icon: CalendarDays },
    { label: "Applications waiting", value: String(19 + submitted.length), note: "Includes new emails", icon: BriefcaseBusiness },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Panel key={stat.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-semibold text-muted">{stat.label}</p>
                <span className="grid size-11 place-items-center rounded-xl bg-mint text-sea">
                  <Icon className="size-5" aria-hidden />
                </span>
              </div>
              <p className="mt-3 text-4xl font-semibold tabular-nums text-ink">{stat.value}</p>
              <p className="mt-1 text-base text-faint">{stat.note}</p>
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Today's visits</h2>
              <p className="mt-1 text-base text-muted">Who is with which client, and whether the visit has started.</p>
            </div>
            <button type="button" onClick={() => onSection("schedule")} className="inline-flex h-11 items-center gap-1 text-base font-semibold text-sea">
              Schedule <ArrowUpRight className="size-4" />
            </button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-paper p-4 text-center">
            <div>
              <p className="text-2xl font-semibold tabular-nums">18</p>
              <p className="text-base text-muted">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-sea">8</p>
              <p className="text-base text-muted">In progress</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-navy">8</p>
              <p className="text-base text-muted">Upcoming</p>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {visits.map((visit) => (
              <li key={`${visit.caregiver}-${visit.time}`} className="flex flex-wrap items-center gap-3 py-4">
                <span className="grid size-11 place-items-center rounded-full bg-sky text-sm font-bold text-navy">
                  {initials(visit.caregiver)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold">{visit.caregiver}</span>
                  <span className="block text-base text-muted">
                    {visit.client} · {visit.type}
                  </span>
                </span>
                <span className="text-base tabular-nums text-faint">{visit.time}</span>
                <StatusPill tone={visit.status === "In progress" ? "sea" : "navy"}>{visit.status}</StatusPill>
              </li>
            ))}
            {visits.length === 0 ? <li className="py-8 text-center text-lg text-muted">No visits match that search.</li> : null}
          </ul>
        </Panel>

        <Panel>
          <h2 className="text-2xl font-semibold">Recent applications</h2>
          <p className="mt-1 text-base text-muted">Newest caregiver applications, including ones sent from the careers page on this browser.</p>
          <ul className="mt-4 divide-y divide-line">
            {applications.slice(0, 5).map((item) => (
              <li key={`${item.name}-${item.when}`} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{item.name}</p>
                    <p className="text-base text-muted">
                      {item.role} · {item.when}
                    </p>
                  </div>
                  <StatusPill tone={item.status === "New" ? "navy" : "sea"}>{item.status}</StatusPill>
                </div>
              </li>
            ))}
            {applications.length === 0 ? <li className="py-8 text-center text-lg text-muted">No applications match that search.</li> : null}
          </ul>
          <button type="button" onClick={() => onSection("recruitment")} className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line text-base font-semibold text-sea">
            Review applications <ArrowUpRight className="size-4" />
          </button>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <Panel>
          <h2 className="text-2xl font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Add a client", "Register someone who needs care", "clients", Plus],
              ["Schedule a visit", "Match a caregiver to a client", "schedule", CalendarDays],
              ["Review applicants", "Continue hiring", "recruitment", BriefcaseBusiness],
              ["Open a care plan", "Write goals and tasks", "plans", ClipboardListIcon],
            ].map(([label, hint, target, Icon]) => (
              <button
                key={label as string}
                type="button"
                onClick={() => onSection(target as Section)}
                className="flex min-h-24 items-start gap-3 rounded-2xl border border-line p-4 text-left hover:border-sea hover:bg-mint/40"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky text-navy">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-lg font-semibold">{label as string}</span>
                  <span className="mt-1 block text-base text-muted">{hint as string}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="text-2xl font-semibold">Visit completion</h2>
          <p className="mt-1 text-base text-muted">Share of this week's visits finished on the planned day.</p>
          <div className="mt-6 flex items-center gap-5">
            <div
              className="grid size-28 place-items-center rounded-full"
              style={{ background: "conic-gradient(#0e7c66 0 94%, #e7f1f8 94% 100%)" }}
            >
              <span className="grid size-20 place-items-center rounded-full bg-card text-2xl font-semibold">94%</span>
            </div>
            <p className="text-lg leading-relaxed text-muted">
              On track for the sample week. Clinical documentation is still being prepared and is not stored here.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ClipboardListIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4.5h6v2H9zM9 11h6M9 15h4" />
    </svg>
  );
}
