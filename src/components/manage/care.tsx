import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, HeartHandshake, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge, Btn, Card, Drawer, Empty, ExportButton, FilterTabs, PageHeader, SearchInput, Table, downloadCsv, inputCls, relTime, td, th, type BadgeTone } from "@/components/manage/kit";
import { dateTime, waLink } from "@/lib/format";
import { errText, must, sb } from "@/lib/supabase";
import type { CareRequest } from "@/lib/types";

// ───────────────────────── Care requests ─────────────────────────

const REQ_TONE: Record<CareRequest["status"], BadgeTone> = { new: "amber", contacted: "blue", closed: "gray" };

export function CareRequestsAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | CareRequest["status"]>("new");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const requests = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => must(await sb().from("care_requests").select("*").order("created_at", { ascending: false }).limit(1000)) as CareRequest[],
  });
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-counts"] });
  };
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CareRequest["status"] }) => must(await sb().from("care_requests").update({ status }).eq("id", id)),
    onSuccess: () => {
      toast.success("Request updated");
      refresh();
    },
    onError: (e) => toast.error(errText(e)),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => must(await sb().from("care_requests").delete().eq("id", id)),
    onSuccess: () => {
      toast.success("Request deleted");
      setOpenId(null);
      refresh();
    },
    onError: (e) => toast.error(errText(e)),
  });
  const all = requests.data ?? [];
  const rows = all.filter((r) => (tab === "all" || r.status === tab) && (!q.trim() || `${r.name} ${r.phone} ${r.service} ${r.town} ${r.message}`.toLowerCase().includes(q.trim().toLowerCase())));
  const open = all.find((r) => r.id === openId) ?? null;

  return (
    <>
      <PageHeader
        title="Care requests"
        description="Families asking for a call back from the home page. Each one is also emailed to the care inbox."
        actions={<ExportButton onClick={() => downloadCsv("care-requests.csv", rows.map((r) => ({ date: r.created_at, name: r.name, phone: r.phone, email: r.email, service: r.service, town: r.town, status: r.status, message: r.message })))} />}
      />
      <Card flush>
        <FilterTabs
          tabs={[
            { id: "new", label: "New", count: all.filter((r) => r.status === "new").length },
            { id: "contacted", label: "Contacted", count: all.filter((r) => r.status === "contacted").length },
            { id: "closed", label: "Closed", count: all.filter((r) => r.status === "closed").length },
            { id: "all", label: "All", count: all.length },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="p-3"><SearchInput value={q} onChange={setQ} placeholder="Search requests" /></div>
        {rows.length === 0 ? (
          <Empty icon={<HeartHandshake className="size-5" />} title={tab === "new" ? "No new requests" : "Nothing here"}>Requests from the home page form appear here.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th className={th}>Received</th>
                <th className={th}>Family contact</th>
                <th className={th}>Service</th>
                <th className={th}>Town</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="cursor-pointer hover:bg-paper" onClick={() => setOpenId(r.id)}>
                  <td className={`${td} whitespace-nowrap text-faint`}>{relTime(r.created_at)}</td>
                  <td className={td}>
                    <p className="font-bold">{r.name}</p>
                    <p className="text-xs text-faint">{r.phone}</p>
                  </td>
                  <td className={td}>{r.service}</td>
                  <td className={td}>{r.town}</td>
                  <td className={td}><Badge tone={REQ_TONE[r.status]}>{r.status[0]!.toUpperCase() + r.status.slice(1)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open?.name ?? "Request"}
        subtitle={open ? `${open.service} · ${dateTime(open.created_at)}` : null}
        footer={
          open ? (
            <>
              <Btn tone="danger" onClick={() => window.confirm("Delete this request?") && remove.mutate(open.id)}><Trash2 className="size-4" aria-hidden /> Delete</Btn>
              {open.status !== "contacted" ? <Btn onClick={() => update.mutate({ id: open.id, status: "contacted" })}>Mark contacted</Btn> : null}
              {open.status !== "closed" ? <Btn tone="primary" onClick={() => update.mutate({ id: open.id, status: "closed" })}>Close</Btn> : <Btn onClick={() => update.mutate({ id: open.id, status: "new" })}>Re-open</Btn>}
            </>
          ) : null
        }
      >
        {open ? (
          <div className="grid gap-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${open.phone}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 font-bold"><Phone className="size-4" aria-hidden /> {open.phone}</a>
              <a href={waLink(open.phone, `Hello ${open.name}, this is SamBee Son and Daughter Home Care about your care request.`)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#137a3e] px-3 font-bold text-white"><MessageCircle className="size-4" aria-hidden /> WhatsApp</a>
              {open.email ? <a href={`mailto:${open.email}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 font-bold"><Mail className="size-4" aria-hidden /> Email</a> : null}
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-paper p-3"><dt className="text-xs text-faint">Service</dt><dd className="font-bold">{open.service}</dd></div>
              <div className="rounded-lg bg-paper p-3"><dt className="text-xs text-faint">Town</dt><dd className="font-bold">{open.town}</dd></div>
            </dl>
            <div>
              <h3 className="mb-1 text-xs font-bold tracking-wide text-faint uppercase">About the person needing care</h3>
              <p className="rounded-lg border border-line p-3 whitespace-pre-line">{open.message || "No details given."}</p>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

// ───────────────────────── Job applications ─────────────────────────

type Application = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  area: string;
  availability: string;
  experience: string;
  cv_name: string;
  stage: "new" | "screening" | "interview" | "offer" | "hired" | "declined";
  notes: string;
  created_at: string;
};
const STAGES: { id: Application["stage"]; label: string; tone: BadgeTone }[] = [
  { id: "new", label: "New", tone: "amber" },
  { id: "screening", label: "Screening", tone: "blue" },
  { id: "interview", label: "Interview", tone: "navy" },
  { id: "offer", label: "Offer", tone: "blue" },
  { id: "hired", label: "Hired", tone: "green" },
  { id: "declined", label: "Declined", tone: "gray" },
];
const stageInfo = (s: Application["stage"]) => STAGES.find((x) => x.id === s)!;

export function ApplicationsAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | Application["stage"]>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const apps = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => must(await sb().from("job_applications").select("*").order("created_at", { ascending: false }).limit(1000)) as Application[],
  });
  const all = apps.data ?? [];
  const open = all.find((a) => a.id === openId) ?? null;
  useEffect(() => setNotes(open?.notes ?? ""), [open?.id, open?.notes]);
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Application> }) => must(await sb().from("job_applications").update(patch).eq("id", id)),
    onSuccess: () => {
      toast.success("Application updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-counts"] });
    },
    onError: (e) => toast.error(errText(e)),
  });
  const rows = all.filter((a) => (tab === "all" || a.stage === tab) && (!q.trim() || `${a.name} ${a.role} ${a.area} ${a.email} ${a.reference}`.toLowerCase().includes(q.trim().toLowerCase())));

  return (
    <>
      <PageHeader
        title="Job applications"
        description="Caregiver applications from the careers page. Move each applicant through your hiring stages."
        actions={<ExportButton onClick={() => downloadCsv("applications.csv", rows.map((a) => ({ reference: a.reference, date: a.created_at, name: a.name, email: a.email, phone: a.phone, role: a.role, area: a.area, availability: a.availability, stage: a.stage, cv: a.cv_name })))} />}
      />
      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {STAGES.map((s) => (
          <button key={s.id} type="button" onClick={() => setTab(s.id)} className={`rounded-xl border bg-white p-3 text-left ${tab === s.id ? "border-sea ring-1 ring-sea" : "border-line"}`}>
            <p className="text-xs font-semibold text-faint">{s.label}</p>
            <p className="text-xl font-extrabold">{all.filter((a) => a.stage === s.id).length}</p>
          </button>
        ))}
      </div>
      <Card flush>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search applicants" />
          {tab !== "all" ? <Btn size="sm" onClick={() => setTab("all")}>Show all stages</Btn> : null}
        </div>
        {rows.length === 0 ? (
          <Empty icon={<BriefcaseBusiness className="size-5" />} title="No applications here">New applications from the careers page appear automatically.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th className={th}>Applicant</th>
                <th className={th}>Role</th>
                <th className={th}>Area</th>
                <th className={th}>Can start</th>
                <th className={th}>Applied</th>
                <th className={th}>Stage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="cursor-pointer hover:bg-paper" onClick={() => setOpenId(a.id)}>
                  <td className={td}>
                    <p className="font-bold">{a.name}</p>
                    <p className="text-xs text-faint">{a.reference}</p>
                  </td>
                  <td className={td}>{a.role}</td>
                  <td className={td}>{a.area}</td>
                  <td className={td}>{a.availability}</td>
                  <td className={`${td} text-faint`}>{relTime(a.created_at)}</td>
                  <td className={td}><Badge tone={stageInfo(a.stage).tone}>{stageInfo(a.stage).label}</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <Drawer open={Boolean(open)} onClose={() => setOpenId(null)} title={open?.name ?? "Applicant"} subtitle={open ? `${open.role} · ${open.reference}` : null}>
        {open ? (
          <div className="grid gap-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${open.phone}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 font-bold"><Phone className="size-4" aria-hidden /> {open.phone}</a>
              <a href={`mailto:${open.email}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 font-bold"><Mail className="size-4" aria-hidden /> {open.email}</a>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-bold tracking-wide text-faint uppercase">Stage</h3>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => update.mutate({ id: open.id, patch: { stage: s.id } })}
                    className={`h-8 rounded-full px-3 text-xs font-bold ${open.stage === s.id ? "bg-navy text-white" : "border border-line text-muted hover:bg-paper"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-paper p-3"><dt className="text-xs text-faint">Preferred area</dt><dd className="font-bold">{open.area}</dd></div>
              <div className="rounded-lg bg-paper p-3"><dt className="text-xs text-faint">Can start</dt><dd className="font-bold">{open.availability || "—"}</dd></div>
            </dl>
            <div>
              <h3 className="mb-1 text-xs font-bold tracking-wide text-faint uppercase">Experience</h3>
              <p className="rounded-lg border border-line p-3 whitespace-pre-line">{open.experience || "Not provided."}</p>
            </div>
            <p className="text-faint">{open.cv_name ? `CV attached to the email: ${open.cv_name}` : "No CV attached."}</p>
            <div>
              <h3 className="mb-1 text-xs font-bold tracking-wide text-faint uppercase">Private notes</h3>
              <textarea className={`${inputCls} h-28 py-2`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interview notes, references checked…" />
              <div className="mt-2 flex justify-end"><Btn tone="primary" size="sm" onClick={() => update.mutate({ id: open.id, patch: { notes } })}>Save notes</Btn></div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
