import { APPLICATION_INBOX } from "@/lib/application-inbox";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-session";
import { Panel, StatusPill } from "@/components/ui";
import {
  CAREGIVERS,
  CLIENTS,
  INVOICES,
  PLANS,
  REPORT_ROWS,
  THREADS,
  VISITS,
  initials,
  type Section,
} from "@/data/demo";

function matches(query: string, text: string) {
  const q = query.trim().toLowerCase();
  return !q || text.toLowerCase().includes(q);
}

export function WorkspaceSection({ section, query }: { section: Section; query: string }) {
  if (section === "clients") {
    const rows = CLIENTS.filter((row) => matches(query, `${row.name} ${row.area} ${row.service}`));
    return (
      <RecordList
        title="Clients"
        hint="People receiving care. These names are illustrative."
        rows={rows.map((row) => ({
          title: row.name,
          meta: `${row.area} · ${row.service}`,
          extra: row.plan,
          status: row.status,
          tone: row.status === "Active" ? "sea" : "navy",
          mark: initials(row.name),
        }))}
      />
    );
  }

  if (section === "caregivers") {
    const rows = CAREGIVERS.filter((row) => matches(query, `${row.name} ${row.role} ${row.area}`));
    return (
      <RecordList
        title="Caregivers"
        hint="Who is rostered today in the sample agency."
        rows={rows.map((row) => ({
          title: row.name,
          meta: `${row.role} · ${row.area}`,
          extra: row.shift,
          status: row.duty,
          tone: row.duty === "On duty" ? "sea" : "neutral",
          mark: initials(row.name),
        }))}
      />
    );
  }

  if (section === "plans") {
    const rows = PLANS.filter((row) => matches(query, `${row.client} ${row.focus} ${row.owner}`));
    return (
      <RecordList
        title="Care plans"
        hint="What each visit is trying to achieve. Plans are written by the care team, not generated here."
        rows={rows.map((row) => ({
          title: row.client,
          meta: row.focus,
          extra: `Review ${row.review} · ${row.owner}`,
          status: "Active",
          tone: "sea",
          mark: initials(row.client),
        }))}
      />
    );
  }

  if (section === "schedule" || section === "visits") {
    const rows = VISITS.filter((row) => matches(query, `${row.caregiver} ${row.client} ${row.type}`));
    return (
      <div className="grid gap-4">
        <Panel>
          <h2 className="text-2xl font-semibold">{section === "schedule" ? "Today’s schedule" : "Visits"}</h2>
          <p className="mt-1 text-base text-muted">A single day in the sample roster, ordered by start time.</p>
          <ol className="mt-5 grid gap-3">
            {rows.map((row) => (
              <li key={`${row.caregiver}-${row.time}`} className="grid gap-2 rounded-2xl border border-line p-4 sm:grid-cols-[8rem_1fr_auto] sm:items-center">
                <span className="text-lg font-semibold tabular-nums text-navy">{row.time}</span>
                <span>
                  <span className="block text-lg font-semibold">{row.client}</span>
                  <span className="text-base text-muted">{row.type} · {row.caregiver}</span>
                </span>
                <StatusPill tone={row.status === "In progress" ? "sea" : "navy"}>{row.status}</StatusPill>
              </li>
            ))}
            {rows.length === 0 ? <li className="py-8 text-center text-lg text-muted">Nothing matches that search.</li> : null}
          </ol>
        </Panel>
      </div>
    );
  }

  if (section === "finance") {
    const rows = INVOICES.filter((row) => matches(query, `${row.id} ${row.client} ${row.status}`));
    return (
      <RecordList
        title="Invoices"
        hint="Sample amounts in Ghana cedis. Nothing here is billed or collected."
        rows={rows.map((row) => ({
          title: row.client,
          meta: `${row.id} · Due ${row.due}`,
          extra: row.amount,
          status: row.status,
          tone: row.status === "Paid" ? "sea" : row.status === "Sent" ? "navy" : "neutral",
          mark: "₵",
        }))}
      />
    );
  }

  if (section === "reports") {
    const max = Math.max(...REPORT_ROWS.map((row) => row.value));
    return (
      <Panel>
        <h2 className="text-2xl font-semibold">Service mix this month</h2>
        <p className="mt-1 text-base text-muted">Share of sample visits by service type. Not a clinical report.</p>
        <ul className="mt-6 grid gap-4">
          {REPORT_ROWS.filter((row) => matches(query, row.label)).map((row) => (
            <li key={row.label}>
              <div className="mb-2 flex items-baseline justify-between text-lg">
                <span className="font-semibold">{row.label}</span>
                <span className="tabular-nums text-muted">{row.value}%</span>
              </div>
              <div className="h-3 rounded-full bg-sky">
                <div className="h-3 rounded-full bg-sea" style={{ width: `${(row.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    );
  }

  if (section === "messages") {
    const rows = THREADS.filter((row) => matches(query, `${row.from} ${row.topic}`));
    return (
      <Panel className="p-0">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-2xl font-semibold">Messages</h2>
          <p className="mt-1 text-base text-muted">Coordinator notes from the sample day. Not a live inbox.</p>
        </div>
        <ul>
          {rows.map((row) => (
            <li key={row.topic} className="border-b border-line px-5 py-4 last:border-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg font-semibold">{row.from}</p>
                <span className="text-base text-faint">{row.time}</span>
              </div>
              <p className="mt-1 text-base text-muted">{row.topic}</p>
              {row.unread ? <span className="mt-2 inline-block text-sm font-semibold text-sea">Unread</span> : null}
            </li>
          ))}
          {rows.length === 0 ? <li className="px-5 py-10 text-center text-lg text-muted">No messages match that search.</li> : null}
        </ul>
      </Panel>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <h2 className="text-2xl font-semibold">Demo sign-in</h2>
        <p className="mt-2 text-base leading-relaxed text-muted">
          The administrator workspace opens with these sample credentials. It does not call Supabase, and it does not store staff accounts.
        </p>
        <dl className="mt-4 grid gap-3 rounded-2xl bg-paper p-4 text-base">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Email</dt>
            <dd className="font-semibold">{DEMO_EMAIL}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Password</dt>
            <dd className="font-semibold">{DEMO_PASSWORD}</dd>
          </div>
        </dl>
      </Panel>
      <Panel>
        <h2 className="text-2xl font-semibold">Application delivery</h2>
        <p className="mt-2 text-base leading-relaxed text-muted">
          Caregiver applications are emailed with FormSubmit to <strong className="font-semibold text-ink">{APPLICATION_INBOX}</strong>.
          The first submission asks that inbox to confirm the address. After confirmation, each application arrives as its own email.
        </p>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Organisation shown in this sample: Grace Home Care, covering Accra, Tema, Cape Coast and Elmina.
        </p>
      </Panel>
    </div>
  );
}

function RecordList({
  title,
  hint,
  rows,
}: {
  title: string;
  hint: string;
  rows: { title: string; meta: string; extra: string; status: string; tone: "sea" | "navy" | "neutral"; mark: string }[];
}) {
  return (
    <Panel className="p-0">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-1 text-base text-muted">{hint}</p>
      </div>
      <ul>
        {rows.map((row) => (
          <li key={`${row.title}-${row.meta}`} className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0">
            <span className="grid size-12 place-items-center rounded-full bg-sky text-base font-bold text-navy">{row.mark}</span>
            <span className="min-w-[12rem] flex-1">
              <span className="block text-lg font-semibold">{row.title}</span>
              <span className="block text-base text-muted">{row.meta}</span>
            </span>
            <span className="text-base text-faint">{row.extra}</span>
            <StatusPill tone={row.tone}>{row.status}</StatusPill>
          </li>
        ))}
        {rows.length === 0 ? <li className="px-5 py-10 text-center text-lg text-muted">Nothing matches that search.</li> : null}
      </ul>
    </Panel>
  );
}
