/**
 * Caregiver applications are delivered by email through FormSubmit.
 * FormSubmit needs no API key — the first real submission emails
 * profjero947@gmail.com a one-time activation link. After that, every
 * application arrives in that inbox.
 *
 * Web3Forms is slightly nicer for pure JSON APIs, but it needs an access
 * key this project does not have. FormSubmit works immediately.
 */
export const APPLICATION_INBOX = "profjero947@gmail.com";

const STORE_KEY = "carebridge.applications";

export type SubmittedApplication = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  area: string;
  experience: string;
  availability: string;
  cvName: string;
  submittedAt: string;
};

export type ApplicationInput = {
  name: string;
  email: string;
  phone: string;
  role: string;
  area: string;
  experience: string;
  availability: string;
  cv: File | null;
};

export function readSubmittedApplications(): SubmittedApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SubmittedApplication[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function remember(application: SubmittedApplication) {
  const current = readSubmittedApplications().filter((item) => item.id !== application.id);
  window.localStorage.setItem(STORE_KEY, JSON.stringify([application, ...current].slice(0, 40)));
}

export function makeReference() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const salt = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `CB-2026-${stamp}${salt}`;
}

export async function sendCaregiverApplication(input: ApplicationInput, reference: string) {
  const form = new FormData();
  form.append("_subject", `CareBridge caregiver application — ${input.role} (${reference})`);
  form.append("_template", "table");
  form.append("_captcha", "false");
  form.append("_replyto", input.email.trim());
  form.append("_honey", "");
  form.append("Reference", reference);
  form.append("Full name", input.name.trim());
  form.append("Email", input.email.trim());
  form.append("Phone", input.phone.trim());
  form.append("Role", input.role);
  form.append("Preferred area", input.area);
  form.append("Availability", input.availability);
  form.append("Experience", input.experience.trim() || "Not provided");
  form.append(
    "Message",
    `${input.name.trim()} applied for ${input.role} in ${input.area}. They can start: ${input.availability}.`,
  );
  if (input.cv) form.append("attachment", input.cv, input.cv.name);

  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(APPLICATION_INBOX)}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: form,
  });

  let payload: { success?: string | boolean; message?: string } = {};
  try {
    payload = (await response.json()) as { success?: string | boolean; message?: string };
  } catch {
    payload = {};
  }

  const message = payload.message ?? "";
  const awaitingInboxConfirmation = /activat/i.test(message);
  const ok = response.ok && (String(payload.success) !== "false" || awaitingInboxConfirmation);
  if (!ok) {
    throw new Error(message || "The application could not be sent. Please try again in a moment.");
  }

  const saved: SubmittedApplication = {
    id: reference,
    reference,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    role: input.role,
    area: input.area,
    experience: input.experience.trim(),
    availability: input.availability,
    cvName: input.cv?.name ?? "",
    submittedAt: new Date().toISOString(),
  };
  remember(saved);
  return saved;
}
