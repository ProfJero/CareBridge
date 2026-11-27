import { SITE } from "@/lib/config";
import { sendFormEmail } from "@/lib/email";
import { sb } from "@/lib/supabase";

/** Caregiver applications are saved for the admin dashboard and emailed to SITE.inbox. */
export const APPLICATION_INBOX = SITE.inbox;

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

export function makeReference() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const salt = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `SSD-${stamp}${salt}`;
}

export async function sendCaregiverApplication(input: ApplicationInput, reference: string) {
  const record = {
    reference,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    role: input.role,
    area: input.area,
    availability: input.availability,
    experience: input.experience.trim(),
    cv_name: input.cv?.name ?? "",
  };
  const [saved, mailed] = await Promise.allSettled([
    sb()
      .from("job_applications")
      .insert(record)
      .then(({ error }) => {
        if (error) throw new Error(error.message);
      }),
    sendFormEmail(
      `${SITE.name} — caregiver application: ${input.role} (${reference})`,
      {
        Reference: reference,
        "Full name": record.name,
        Email: record.email,
        Phone: record.phone,
        Role: input.role,
        "Preferred area": input.area,
        Availability: input.availability,
        Experience: record.experience || "Not provided",
      },
      { replyTo: record.email, attachment: input.cv },
    ),
  ]);
  if (saved.status === "rejected" && mailed.status === "rejected") {
    throw mailed.reason instanceof Error ? mailed.reason : new Error("The application could not be sent. Please try again.");
  }
  return record;
}
