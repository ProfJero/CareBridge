import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Button, Field, controlClass } from "@/components/ui";
import { AREAS, JOBS, ROLES } from "@/data/demo";
import { makeReference, sendCaregiverApplication } from "@/lib/application-inbox";

const steps = ["Your details", "Experience"];

export function CareersPortal() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>(ROLES[0]);
  const [area, setArea] = useState<string>(AREAS[2]);
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("Immediately");
  const [consent, setConsent] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");

  const published = JOBS.filter((job) => job.status === "Published");

  function chooseRole(next: string) {
    setRole(next);
    setReference("");
    setStep(0);
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function continueForm(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 3) return setError("Enter your full name.");
    if (!email.includes("@") || !email.includes(".")) return setError("Enter a valid email address.");
    if (phone.replace(/\D/g, "").length < 9) return setError("Enter a phone number we can reach you on.");
    setStep(1);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!consent) return setError("Please confirm that we may use your details to review this application.");
    if (cv && cv.size > 4 * 1024 * 1024) return setError("Please keep the CV under 4 MB, or send it later.");
    const ref = makeReference();
    setBusy(true);
    try {
      await sendCaregiverApplication(
        { name, email, phone, role, area, experience, availability, cv },
        ref,
      );
      setReference(ref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The application could not be sent. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStep(0);
    setName("");
    setEmail("");
    setPhone("");
    setExperience("");
    setConsent(false);
    setCv(null);
    setError("");
    setReference("");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-5">
          <a href="#top" className="min-w-0">
            <Wordmark />
          </a>
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="Careers">
            <a href="#roles" className="hidden h-12 items-center px-2 text-base font-semibold text-navy sm:inline-flex">
              Open roles
            </a>
            <a href="#apply" className="hidden h-12 items-center px-2 text-base font-semibold text-navy md:inline-flex">
              Apply
            </a>
            <Link
              to="/admin/login"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-navy px-4 text-base font-semibold text-on-navy"
            >
              Admin
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-16">
          <div>
            <p className="text-sm font-bold tracking-widest text-sea uppercase">Careers</p>
            <h1 className="mt-3 font-display text-5xl leading-tight font-semibold text-ink md:text-6xl">
              Build a career around <span className="text-sea">making lives better.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Join a home-care team in Ghana. Support people in their own homes — with daily living,
              companionship, or professional nursing — and know exactly what you are applying for.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#apply"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-sea px-5 text-base font-semibold text-on-sea"
              >
                Apply to join us
                <ArrowRight className="size-4" aria-hidden />
              </a>
              <a
                href="#roles"
                className="inline-flex h-12 items-center rounded-xl border border-line bg-card px-5 text-base font-semibold text-navy"
              >
                See open roles
              </a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-base text-muted">
              <ShieldCheck className="size-5 text-sea" aria-hidden />
              Short form. Clear next steps. Your details stay with the recruiting team.
            </p>
          </div>

          <aside className="rounded-3xl bg-navy p-6 text-on-navy sm:p-8">
            <p className="text-sm font-semibold tracking-widest text-navy-muted uppercase">Open this week</p>
            <ul className="mt-5 grid gap-3">
              {published.map((job) => (
                <li key={job.title} className="rounded-2xl bg-navy-2 px-4 py-4">
                  <p className="text-lg font-semibold">{job.title}</p>
                  <p className="mt-1 text-base text-navy-muted">
                    {job.location} · {job.type}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-base text-navy-muted">Sample openings for Grace Home Care. No real client records.</p>
          </aside>
        </section>

        <section className="border-y border-line bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-3">
            {[
              ["Meaningful work", "Spend your day with people who need practical, respectful support at home."],
              ["A clear path", "Apply in two short steps. Interviews and credential checks come after, not before."],
              ["A known team", "Work with coordinators who schedule visits, not a faceless job board."],
            ].map(([title, copy]) => (
              <div key={title} className="border-l-2 border-sea pl-4">
                <h2 className="text-lg font-semibold text-ink">{title}</h2>
                <p className="mt-2 text-base leading-relaxed text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="roles" className="mx-auto max-w-6xl px-5 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-widest text-sea uppercase">Opportunities</p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-ink">Find a role that fits you</h2>
              <p className="mt-3 max-w-2xl text-lg text-muted">
                Clinical and non-clinical roles are listed separately, so a caregiver application never implies a nursing scope.
              </p>
            </div>
            <p className="rounded-full bg-mint px-4 py-2 text-base font-semibold text-sea-2">
              {published.length} open roles
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {published.map((job) => (
              <article key={job.title} className="flex flex-col rounded-2xl border border-line bg-card p-5">
                <span className="grid size-12 place-items-center rounded-xl bg-mint text-sea">
                  <BriefcaseBusiness className="size-5" aria-hidden />
                </span>
                <p className="mt-4 text-sm font-bold tracking-wide text-sea uppercase">{job.category}</p>
                <h3 className="mt-2 text-2xl font-semibold text-ink">{job.title}</h3>
                <p className="mt-2 flex-1 text-base leading-relaxed text-muted">{job.summary}</p>
                <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-base text-faint">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" aria-hidden />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-4" aria-hidden />
                    {job.type}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => chooseRole(job.title)}
                  className="mt-5 flex h-12 w-full items-center justify-between border-t border-line text-base font-semibold text-sea"
                >
                  Apply for this role
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-navy text-on-navy">
          <ol className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-3">
            {[
              ["01", "Tell us who you are", "Name, contact, the role you want and where you can work."],
              ["02", "Share your experience", "A short note is enough. We ask for certificates only if the role needs them."],
              ["03", "We write back", "The recruiting team receives your application by email and follows up directly."],
            ].map(([n, title, copy]) => (
              <li key={n}>
                <p className="font-display text-3xl text-mint">{n}</p>
                <h2 className="mt-2 text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-base leading-relaxed text-navy-muted">{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="apply" className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold tracking-widest text-sea uppercase">Your next chapter</p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-ink">Take the first step.</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              This form emails the CareBridge recruiting inbox. You will see a reference number as soon as it is sent.
            </p>
            <ul className="mt-6 grid gap-3 text-base text-muted">
              {["Two short steps, comfortable on a phone", "You choose the role before you write about yourself", "Consent is asked in plain language"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-sea" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-line bg-card p-5 sm:p-7">
            {reference ? (
              <div className="py-6 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-sea">
                  <Check className="size-7" aria-hidden />
                </span>
                <p className="mt-5 text-sm font-bold tracking-widest text-sea uppercase">Application received</p>
                <h3 className="mt-2 font-display text-4xl font-semibold text-ink">
                  Thank you, {name.split(" ")[0]}.
                </h3>
                <p className="mx-auto mt-3 max-w-md text-lg leading-relaxed text-muted">
                  Your application for {role} is on its way to the recruiting team. Keep this reference if you need to follow up.
                </p>
                <p className="mt-5 text-base font-semibold text-navy">
                  Reference <span className="tabular-nums">{reference}</span>
                </p>
                <Button className="mt-6" onClick={reset}>
                  Submit another application
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold tracking-widest text-sea uppercase">Caregiver application</p>
                    <h3 className="mt-1 text-2xl font-semibold text-ink">Join our care team</h3>
                  </div>
                  <p className="text-base font-semibold text-faint">
                    Step {step + 1} of {steps.length}
                  </p>
                </div>
                <div className="mt-4 h-2 rounded-full bg-paper" aria-hidden>
                  <div className="h-2 rounded-full bg-sea" style={{ width: step === 0 ? "50%" : "100%" }} />
                </div>
                <p className="mt-3 text-base text-muted">{steps[step]}</p>

                {step === 0 ? (
                  <form className="mt-5 grid gap-4" onSubmit={continueForm}>
                    <Field label="Full name">
                      <input
                        name="name"
                        className={controlClass}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Email address">
                        <input
                          name="email"
                          type="email"
                          className={controlClass}
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                          required
                        />
                      </Field>
                      <Field label="Phone number">
                        <input
                          name="phone"
                          type="tel"
                          className={controlClass}
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="+233 …"
                          autoComplete="tel"
                          required
                        />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Role you want">
                        <select
                          name="role"
                          className={controlClass}
                          value={role}
                          onChange={(event) => setRole(event.target.value)}
                        >
                          {ROLES.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Where you can work">
                        <select
                          name="area"
                          className={controlClass}
                          value={area}
                          onChange={(event) => setArea(event.target.value)}
                        >
                          {AREAS.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    {error ? <p className="rounded-xl bg-danger-bg px-4 py-3 text-base text-danger">{error}</p> : null}
                    <div className="flex justify-end">
                      <Button type="submit">
                        Continue
                        <ArrowRight className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form className="mt-5 grid gap-4" onSubmit={submit}>
                    <Field label="Relevant experience" hint="Training, previous clients, or why this work suits you.">
                      <textarea
                        name="experience"
                        className={`${controlClass} h-32 py-3`}
                        value={experience}
                        onChange={(event) => setExperience(event.target.value)}
                        placeholder="A few sentences is enough."
                        rows={4}
                      />
                    </Field>
                    <Field label="When can you start?">
                      <select
                        name="availability"
                        className={controlClass}
                        value={availability}
                        onChange={(event) => setAvailability(event.target.value)}
                      >
                        <option>Immediately</option>
                        <option>Within 2 weeks</option>
                        <option>Within a month</option>
                        <option>Flexible / to be discussed</option>
                      </select>
                    </Field>
                    <label className="grid cursor-pointer gap-2 rounded-2xl border border-dashed border-sea bg-mint/60 px-4 py-4 text-center">
                      <span className="mx-auto text-sea">
                        <UploadCloud className="size-6" aria-hidden />
                      </span>
                      <span className="text-base font-semibold text-ink">CV or certificate, optional</span>
                      <span className="text-sm text-muted">PDF or Word, up to 4 MB. You can also send this later.</span>
                      <input
                        name="cv"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf"
                        className="mx-auto max-w-full text-sm text-muted"
                        onChange={(event) => setCv(event.target.files?.[0] ?? null)}
                      />
                    </label>
                    <label className="flex items-start gap-3 text-base leading-relaxed text-muted">
                      <input
                        name="consent"
                        type="checkbox"
                        className="mt-1 size-5 accent-sea"
                        checked={consent}
                        onChange={(event) => setConsent(event.target.checked)}
                      />
                      I agree that CareBridge may use these details to assess my application and contact me about this role.
                    </label>
                    <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
                    {error ? <p className="rounded-xl bg-danger-bg px-4 py-3 text-base text-danger">{error}</p> : null}
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setStep(0);
                        }}
                        className="inline-flex h-12 items-center gap-2 text-base font-semibold text-muted"
                      >
                        <ArrowLeft className="size-4" aria-hidden />
                        Back
                      </button>
                      <Button type="submit" disabled={busy || !consent}>
                        {busy ? "Sending…" : "Submit application"}
                        <ArrowRight className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-base text-faint sm:flex-row sm:items-center sm:justify-between">
          <strong className="font-display text-lg text-ink">CareBridge</strong>
          <span>Care that connects. People who make a difference.</span>
          <span>© 2026 CareBridge · Built by ProfJero</span>
        </div>
      </footer>
    </div>
  );
}
