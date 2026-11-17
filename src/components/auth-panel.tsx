import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button, ErrorNote, Field, controlClass } from "@/components/ui";
import { errText, sb } from "@/lib/supabase";
import { cn } from "@/lib/cn";

type Mode = "signin" | "signup" | "reset";

export function AuthPanel({ intro, onDone }: { intro?: string; onDone?: () => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    const client = sb();
    const redirect = `${window.location.origin}/account`;
    try {
      if (mode === "signin") {
        const { error: authError } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        toast.success("Welcome back");
        onDone?.();
      } else if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Please enter your full name.");
        if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
        const { data, error: authError } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim(), phone: phone.trim() }, emailRedirectTo: redirect },
        });
        if (authError) throw authError;
        if (data.session) {
          toast.success("Your account is ready");
          onDone?.();
        } else {
          setNotice(`We sent a confirmation link to ${email.trim()}. Open it to activate your account, then sign in.`);
          setMode("signin");
        }
      } else {
        const { error: authError } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${redirect}?reset=1` });
        if (authError) throw authError;
        setNotice(`If ${email.trim()} has an account, a password reset link is on its way.`);
      }
    } catch (err) {
      const message = errText(err);
      setError(/invalid login/i.test(message) ? "That email and password do not match. Check them, or reset your password." : message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-line bg-card p-5 sm:p-8">
      {mode !== "reset" ? (
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-paper p-1" role="tablist">
          {(["signin", "signup"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => {
                setMode(item);
                setError("");
              }}
              className={cn("h-11 rounded-lg text-base font-semibold", mode === item ? "bg-card text-ink shadow-sm" : "text-muted")}
            >
              {item === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      ) : (
        <h2 className="text-2xl font-semibold text-ink">Reset your password</h2>
      )}
      {intro ? <p className="mt-4 text-base text-muted">{intro}</p> : null}
      {notice ? <p className="mt-4 rounded-xl bg-mint px-4 py-3 text-base text-sea-2">{notice}</p> : null}
      <form className="mt-5 grid gap-4" onSubmit={submit}>
        {mode === "signup" ? (
          <>
            <Field label="Full name">
              <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </Field>
            <Field label="Phone number" hint="Sellers and our team use this to reach you about orders.">
              <input className={controlClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" placeholder="024 000 0000" />
            </Field>
          </>
        ) : null}
        <Field label="Email address">
          <input className={controlClass} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
        </Field>
        {mode !== "reset" ? (
          <Field label="Password">
            <span className="relative block">
              <input
                className={`${controlClass} pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={mode === "signup" ? 8 : undefined}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute inset-y-0 right-0 grid w-12 place-items-center text-faint"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </span>
          </Field>
        ) : null}
        <ErrorNote>{error}</ErrorNote>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create my account" : "Send reset link"}
        </Button>
      </form>
      <div className="mt-4 text-center text-base">
        {mode === "reset" ? (
          <button type="button" className="font-semibold text-sea" onClick={() => setMode("signin")}>
            Back to sign in
          </button>
        ) : mode === "signin" ? (
          <button type="button" className="font-semibold text-sea" onClick={() => setMode("reset")}>
            Forgot your password?
          </button>
        ) : (
          <p className="text-sm text-faint">By creating an account you agree to be contacted about your orders.</p>
        )}
      </div>
    </div>
  );
}

export function NewPasswordForm({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    setBusy(true);
    const { error: authError } = await sb().auth.updateUser({ password });
    setBusy(false);
    if (authError) return setError(authError.message);
    toast.success("Password updated");
    onDone();
  }
  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-gold/40 bg-gold-bg p-5">
      <p className="font-semibold text-ink">Choose a new password</p>
      <input className={controlClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      <ErrorNote>{error}</ErrorNote>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
