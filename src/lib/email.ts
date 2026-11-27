import { SITE } from "@/lib/config";

/**
 * Form emails are delivered by FormSubmit to SITE.inbox (beagracelyn@gmail.com).
 * The very first submission sends that inbox a one-time activation email; once
 * it is confirmed, every form arrives as its own message.
 */
export async function sendFormEmail(subject: string, fields: Record<string, string>, opts?: { replyTo?: string; attachment?: File | null }) {
  const form = new FormData();
  form.append("_subject", subject);
  form.append("_template", "table");
  form.append("_captcha", "false");
  form.append("_honey", "");
  if (opts?.replyTo) form.append("_replyto", opts.replyTo);
  for (const [key, value] of Object.entries(fields)) form.append(key, value || "—");
  if (opts?.attachment) form.append("attachment", opts.attachment, opts.attachment.name);

  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(SITE.inbox)}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: form,
  });
  let payload: { success?: string | boolean; message?: string } = {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    payload = {};
  }
  const message = payload.message ?? "";
  const awaitingActivation = /activat/i.test(message);
  if (!(response.ok && (String(payload.success) !== "false" || awaitingActivation))) {
    throw new Error(message || "The form could not be sent. Please try again in a moment.");
  }
}
