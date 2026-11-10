import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  MapPin,
  Plus,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Button, Panel, StatusPill, controlClass } from "@/components/ui";
import { CANDIDATES, JOBS, STAGES, initials, type Stage } from "@/data/demo";
import { readSubmittedApplications } from "@/lib/application-inbox";

type Candidate = (typeof CANDIDATES)[number];
type Tab = "Applications" | "Job openings" | "Talent pool" | "Interviews";

export function Recruitment({ query }: { query: string }) {
  const [tab, setTab] = useState<Tab>("Applications");
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATES);
  const [stage, setStage] = useState("All stages");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [composer, setComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [jobs, setJobs] = useState(JOBS);

  useEffect(() => {
    const incoming = readSubmittedApplications().map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      location: item.area,
      experience: item.experience || "Submitted from the careers page",
      date: "Just now",
      stage: "New" as Stage,
      skills: [item.availability],
    }));
    setCandidates((current) => {
      const known = new Set(current.map((item) => item.id));
      return [...incoming.filter((item) => !known.has(item.id)), ...current];
    });
  }, []);

  const filtered = useMemo(
    () =>
      candidates.filter((candidate) => {
        const hay = `${candidate.name} ${candidate.role} ${candidate.location}`.toLowerCase();
        const matchesQuery = !query.trim() || hay.includes(query.trim().toLowerCase());
        const matchesStage = stage === "All stages" || candidate.stage === stage;
        return matchesQuery && matchesStage;
      }),
    [candidates, query, stage],
  );

  function move(candidate: Candidate, next: Stage) {
    setCandidates((items) => items.map((item) => (item.id === candidate.id ? { ...item, stage: next } : item)));
    setSelected({ ...candidate, stage: next });
  }

  function publish() {
    if (!title.trim()) return;
    setJobs((items) => [
      {
        title: title.trim(),
        type: "Full-time",
        location: "Cape Coast",
        category: "Non-clinical care",
        summary: "Added in this sample workspace.",
        applicants: 0,
        status: "Published",
      },
      ...items,
    ]);
    setTitle("");
    setComposer(false);
    setTab("Job openings");
  }

  const counts = STAGES.slice(0, 6).map((name) => ({
    name,
    count: candidates.filter((candidate) => candidate.stage === name).length,
  }));

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link to="/" className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-card px-4 text-base font-semibold text-navy">
          <Users className="size-5" aria-hidden />
          Preview careers page
        </Link>
        <Button onClick={() => setComposer(true)}>
          <Plus className="size-5" aria-hidden />
          Create job opening
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active openings", String(jobs.filter((job) => job.status === "Published").length), "Accepting applications"],
          ["Applications", String(candidates.length), "Seed records plus this browser"],
          ["Needs review", String(candidates.filter((item) => item.stage === "New" || item.stage === "Screening").length), "New and screening"],
          ["Interviews", String(candidates.filter((item) => item.stage === "Interview").length), "Ready to schedule"],
        ].map(([label, value, note]) => (
          <Panel key={label} className="p-5">
            <p className="text-base font-semibold text-muted">{label}</p>
            <p className="mt-2 text-4xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-base text-faint">{note}</p>
          </Panel>
        ))}
      </div>

      <div className="flex gap-2 overflow-auto border-b border-line">
        {(["Applications", "Job openings", "Talent pool", "Interviews"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`h-12 shrink-0 border-b-2 px-3 text-base font-semibold ${tab === item ? "border-sea text-sea" : "border-transparent text-muted"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Applications" ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            {counts.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setStage(item.name)}
                className="rounded-2xl border border-line bg-card px-4 py-3 text-left"
              >
                <span className="block text-sm font-semibold text-muted">{item.name}</span>
                <span className="mt-1 block text-2xl font-semibold tabular-nums">{item.count}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="text-base font-semibold text-muted">
              Stage
              <select className={`${controlClass} mt-1 h-12 sm:w-64`} value={stage} onChange={(event) => setStage(event.target.value)}>
                <option>All stages</option>
                {STAGES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <Panel className="p-0">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-xl font-semibold">Applicants ({filtered.length})</h2>
              <span className="text-base text-faint">Most recent first</span>
            </div>
            <ul>
              {filtered.map((candidate) => (
                <li key={candidate.id} className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0">
                  <span className="grid size-12 place-items-center rounded-full bg-sky text-base font-bold text-navy">
                    {initials(candidate.name)}
                  </span>
                  <span className="min-w-[12rem] flex-1">
                    <span className="block text-lg font-semibold">{candidate.name}</span>
                    <span className="block text-base text-muted">{candidate.role}</span>
                    <span className="mt-1 flex items-center gap-1 text-base text-faint">
                      <MapPin className="size-4" aria-hidden />
                      {candidate.location} · {candidate.date}
                    </span>
                  </span>
                  <StatusPill tone={candidate.stage === "New" ? "navy" : "sea"}>{candidate.stage}</StatusPill>
                  <button type="button" onClick={() => setSelected(candidate)} className="inline-flex h-11 items-center gap-1 text-base font-semibold text-sea">
                    Review <ArrowRight className="size-4" />
                  </button>
                </li>
              ))}
              {filtered.length === 0 ? <li className="px-5 py-10 text-center text-lg text-muted">No applicants match those filters.</li> : null}
            </ul>
          </Panel>
        </>
      ) : null}

      {tab === "Job openings" ? (
        <Panel className="p-0">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-xl font-semibold">Job openings ({jobs.length})</h2>
            <Button onClick={() => setComposer(true)}>
              <Plus className="size-4" /> Add opening
            </Button>
          </div>
          <ul>
            {jobs
              .filter((job) => !query.trim() || `${job.title} ${job.location}`.toLowerCase().includes(query.trim().toLowerCase()))
              .map((job) => (
                <li key={job.title} className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0">
                  <span className="grid size-12 place-items-center rounded-xl bg-mint text-sea">
                    <BriefcaseBusiness className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold">{job.title}</span>
                    <span className="block text-base text-muted">
                      {job.category} · {job.type} · {job.location}
                    </span>
                  </span>
                  <span className="text-base text-muted">{job.applicants} applicants</span>
                  <StatusPill tone={job.status === "Published" ? "sea" : "neutral"}>{job.status}</StatusPill>
                </li>
              ))}
          </ul>
        </Panel>
      ) : null}

      {tab === "Talent pool" ? (
        <Panel className="py-12 text-center">
          <Users className="mx-auto size-8 text-sea" />
          <h2 className="mt-4 text-2xl font-semibold">Caregiver talent pool</h2>
          <p className="mx-auto mt-2 max-w-xl text-lg text-muted">
            Consented profiles, skills and availability will live here after a hire decision. This sample does not store real candidate files.
          </p>
          <Button tone="secondary" className="mt-5" onClick={() => setTab("Applications")}>
            Review current applicants
          </Button>
        </Panel>
      ) : null}

      {tab === "Interviews" ? (
        <Panel className="py-12 text-center">
          <CalendarDays className="mx-auto size-8 text-sea" />
          <h2 className="mt-4 text-2xl font-semibold">Interview calendar</h2>
          <p className="mx-auto mt-2 max-w-xl text-lg text-muted">
            Phone screens and panel times will be booked from a candidate's review. Kwesi Arthur is the only person currently at interview stage.
          </p>
          <Button tone="secondary" className="mt-5" onClick={() => { setStage("Interview"); setTab("Applications"); }}>
            View interview-stage candidates
          </Button>
        </Panel>
      ) : null}

      {composer ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-4" onClick={() => setComposer(false)}>
          <div className="w-full max-w-lg rounded-3xl bg-card p-6" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="job-title">
            <div className="flex items-start justify-between gap-3">
              <h2 id="job-title" className="text-2xl font-semibold">Create a job opening</h2>
              <button type="button" className="grid size-11 place-items-center rounded-xl bg-paper" onClick={() => setComposer(false)} aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <label className="mt-5 grid gap-2 text-base font-semibold">
              Job title
              <input className={controlClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Home Care Assistant" />
            </label>
            <p className="mt-4 flex gap-2 rounded-2xl bg-mint px-4 py-3 text-base text-sea-2">
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
              Pay, shift pattern and qualifications can be added before a real publish. This only updates the sample list.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button tone="secondary" onClick={() => setComposer(false)}>Cancel</Button>
              <Button disabled={!title.trim()} onClick={publish}>Save and publish</Button>
            </div>
          </div>
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-navy/50 p-0 sm:place-items-center sm:p-4" onClick={() => setSelected(null)}>
          <div className="max-h-[92vh] w-full overflow-auto rounded-t-3xl bg-card p-6 sm:max-w-lg sm:rounded-3xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="candidate-title">
            <div className="flex items-start justify-between">
              <p className="text-sm font-bold tracking-widest text-sea uppercase">Applicant profile</p>
              <button type="button" className="grid size-11 place-items-center rounded-xl bg-paper" onClick={() => setSelected(null)} aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <h2 id="candidate-title" className="mt-2 text-3xl font-semibold">{selected.name}</h2>
            <p className="mt-1 text-lg text-muted">{selected.role} · {selected.location}</p>
            <p className="mt-4 text-base leading-relaxed text-muted">{selected.experience}. Skills are self-reported until a recruiter verifies them.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-paper px-3 py-1 text-base text-navy">{skill}</span>
              ))}
            </div>
            <label className="mt-5 grid gap-2 text-base font-semibold">
              Current stage
              <select className={controlClass} value={selected.stage} onChange={(event) => move(selected, event.target.value as Stage)}>
                {STAGES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <ul className="mt-5 grid gap-3 text-base text-muted">
              <li className="flex items-center gap-2"><FileText className="size-5 text-sea" /> Review CV and work history</li>
              <li className="flex items-center gap-2"><BadgeCheck className="size-5 text-sea" /> Verify registration where the role requires it</li>
              <li className="flex items-center gap-2"><ShieldCheck className="size-5 text-sea" /> Take references before any offer</li>
            </ul>
            <Button className="mt-6 w-full" onClick={() => setSelected(null)}>Save review</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
