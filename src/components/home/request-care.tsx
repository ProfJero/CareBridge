import { useState, type FormEvent } from "react";
import { Check, Send } from "lucide-react";
import { Button, ErrorNote, Field, controlClass } from "@/components/ui";
import { NEARBY_TOWNS, SITE } from "@/lib/config";
import { sendFormEmail } from "@/lib/email";
import { errText, sb } from "@/lib/supabase";

export const SERVICE_OPTIONS = [
  "Personal care",
  "Elderly care",
  "Illness & recovery support",
  "Household support",
  "Companionship & family respite",
  "Not sure yet — please advise",
] as const;

export function RequestCareForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState<string>(SERVICE_OPTIONS[0]);
  const [town, setTown] = useState<string>(SITE.town);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (phone.replace(/\D/g, "").length < 9) return setError("Please enter a phone number we can call.");
    setBusy(true);
    try {
      const record = { name: name.trim(), phone: phone.trim(), email: email.trim(), service, town, message: message.trim() };
      // Saved for the admin console and emailed to the care team; either succeeding is enough.
      const [saved, mailed] = await Promise.allSettled([
        sb()
          .from("care_requests")
          .insert(record)
          .then(({ error: dbError }) => {
            if (dbError) throw dbError;
          }),
        sendFormEmail(
          `${SITE.name} — care request: ${service}`,
          {
            Name: record.name,
            Phone: record.phone,
            Email: record.email,
            Service: service,
            Town: town,
            Message: record.message,
          },
          { replyTo: record.email || undefined },
        ),
      ]);
      if (saved.status === "rejected" && mailed.status === "rejected") throw mailed.reason;
      setDone(true);
    } catch (err) {
      setError(errText(err, "We could not send your request. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="py-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-sea">
          <Check className="size-7" aria-hidden />
        </span>
        <h3 className="mt-4 font-display text-3xl font-bold text-ink">Thank you, {name.split(" ")[0]}.</h3>
        <p className="mx-auto mt-2 max-w-md text-lg text-muted">
          Our care coordinator will call you on {phone} to talk through what you need. There is no obligation.
        </p>
        <Button
          tone="secondary"
          className="mt-5"
          onClick={() => {
            setDone(false);
            setMessage("");
          }}
        >
          Send another request
        </Button>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Full name" />
        </Field>
        <Field label="Phone number">
          <input
            className={controlClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            autoComplete="tel"
            placeholder="024 000 0000"
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Care needed">
          <select className={controlClass} value={service} onChange={(e) => setService(e.target.value)}>
            {SERVICE_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Town">
          <select className={controlClass} value={town} onChange={(e) => setTown(e.target.value)}>
            {NEARBY_TOWNS.map((item) => (
              <option key={item}>{item}</option>
            ))}
            <option>Other (tell us below)</option>
          </select>
        </Field>
      </div>
      <Field label="Email (optional)">
        <input
          className={controlClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Tell us a little about the person who needs care" hint="Age, daily routine, health needs, preferred days — whatever helps.">
        <textarea className={`${controlClass} h-28 py-3`} value={message} onChange={(e) => setMessage(e.target.value)} />
      </Field>
      <ErrorNote>{error}</ErrorNote>
      <Button type="submit" disabled={busy} className="w-full sm:w-auto sm:justify-self-end">
        {busy ? "Sending…" : "Request a call back"}
        <Send className="size-4" aria-hidden />
      </Button>
    </form>
  );
}
