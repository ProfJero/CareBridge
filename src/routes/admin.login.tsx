import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Button, controlClass } from "@/components/ui";
import { DEMO_EMAIL, DEMO_PASSWORD, credentialsMatch, signInDemo } from "@/lib/demo-session";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({
    meta: [{ title: "Admin sign-in — CareBridge" }],
  }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function enter() {
    signInDemo();
    void navigate({ to: "/admin", search: { section: "overview" } });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    if (!credentialsMatch(email, password)) {
      setBusy(false);
      setError("Those details do not match the demo account. Use the credentials below, or continue with demo access.");
      return;
    }
    enter();
  }

  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-navy px-12 py-10 text-on-navy lg:flex">
        <Wordmark light kicker="Administration" />
        <div>
          <h1 className="max-w-md font-display text-5xl leading-tight font-semibold">
            The workspace for the people who organise care.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-navy-muted">
            Review visits, caregivers and applications for Grace Home Care. This sign-in opens a sample workspace — no live records, no extra setup.
          </p>
        </div>
        <p className="flex items-center gap-2 text-base text-navy-muted">
          <ShieldCheck className="size-5 text-mint" aria-hidden />
          Demo access is ready. You do not need a separate staff account.
        </p>
      </section>

      <section className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-base font-semibold text-navy">
            ← Careers
          </Link>
          <span className="lg:hidden">
            <Wordmark kicker="Administration" />
          </span>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <p className="text-sm font-bold tracking-widest text-sea uppercase">CareBridge administration</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-ink">Welcome back</h2>
          <p className="mt-3 text-lg leading-relaxed text-muted">
            Sign in to the sample management workspace. The demo account is filled in for you.
          </p>

          <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2 text-base font-semibold">
              Email address
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                className={controlClass}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-base font-semibold">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className={controlClass}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter the demo password"
              />
            </label>
            {error ? <p className="rounded-xl bg-danger-bg px-4 py-3 text-base text-danger">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </form>

          <div className="mt-5 rounded-2xl border border-line bg-mint/50 p-4">
            <p className="text-base font-semibold text-sea-2">Demo credentials</p>
            <p className="mt-2 flex justify-between gap-3 text-base text-ink">
              <span className="text-muted">Email</span>
              <strong>{DEMO_EMAIL}</strong>
            </p>
            <p className="mt-1 flex justify-between gap-3 text-base text-ink">
              <span className="text-muted">Password</span>
              <strong>{DEMO_PASSWORD}</strong>
            </p>
            <Button
              tone="secondary"
              className="mt-4 w-full bg-card"
              onClick={() => {
                setEmail(DEMO_EMAIL);
                setPassword(DEMO_PASSWORD);
                enter();
              }}
            >
              Continue with demo access
            </Button>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Opens sample information only. Real staff accounts are not required for this preview.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
