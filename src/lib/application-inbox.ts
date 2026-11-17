import { SITE } from "@/lib/config";
import { sendFormEmail } from "@/lib/email";

/** Caregiver applications are emailed (via FormSubmit) to beagracelyn@gmail.com. */
export const APPLICATION_INBOX = SITE.inbox;

const STORE_KEY = "sambea.applications";

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
  return `SSD-${stamp}${salt}`;
}

export async function sendCaregiverApplication(input: ApplicationInput, reference: string) {
  await sendFormEmail(
    `${SITE.name} — caregiver application: ${input.role} (${reference})`,
    {
      Reference: reference,
      "Full name": input.name.trim(),
      Email: input.email.trim(),
      Phone: input.phone.trim(),
      Role: input.role,
      "Preferred area": input.area,
      Availability: input.availability,
      Experience: input.experience.trim() || "Not provided",
      Message: `${input.name.trim()} applied for ${input.role} in ${input.area}. They can start: ${input.availability}.`,
    },
    { replyTo: input.email.trim(), attachment: input.cv },
  );

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
