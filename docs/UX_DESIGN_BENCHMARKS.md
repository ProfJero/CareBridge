# CareBridge experience and interaction design

## Product experience principles

CareBridge has three distinct audiences: agency teams, caregivers/applicants, and clients/family representatives. Do not force these audiences through one generic dashboard. Give each role a clear entry point, navigation model and vocabulary.

1. **Task-first, not metric-first.** Put the next meaningful action (review new applications, confirm today's visit, resolve a missed check-in) ahead of decorative charts.
2. **Progressive disclosure.** Ask applicants only for essential contact and role information first. Collect detailed work history, references and credentials in later, secure steps. Avoid one intimidating form.
3. **Clear separation of care pathways.** Clinical and non-clinical roles must have distinct scope, qualification and supervision requirements. A generic caregiver label must not imply permission to perform clinical tasks.
4. **Trust through transparency.** Show pay/range when approved, work location, shift type, responsibilities, required qualifications, application stages, privacy information and expected response times.
5. **Accessible by default.** Target WCAG 2.2 AA: semantic headings, keyboard support, visible focus, labels, useful error text, adequate contrast, no color-only statuses, responsive layouts and reduced-motion support.
6. **Mobile-first field work.** Large touch targets, short forms, clear offline/connection states, minimal typing, and a compact visit workflow for caregivers.
7. **Safety and accountability.** Every sensitive change has an accountable actor, timestamp, reason where appropriate and an audit trail. Do not expose patient details in notifications.

## Benchmark references and lessons

These are patterns observed in public product pages and UX case studies, not endorsements or claims that CareBridge has replicated a proprietary product.

- **Canu Care recruitment portal:** separate candidate and provider journeys, job discovery, job posting and applicant tracking. Lesson: applicants need a simple job-search surface while recruiters need a structured ATS. https://www.cyber-duck.co.uk/client-stories/canu-care
- **Cytrea caregiver hiring:** provider workspace, caregiver-side profile and applications, role discovery, credentials and messaging. Lesson: keep applicant self-service and provider review connected but role-appropriate. https://cytrea.com/showcase
- **AveeCare recruitment:** visual hiring pipeline, rich applicant profiles, interview notes, checks, documents and applicant-to-caregiver onboarding. Lesson: recruitment is a lifecycle, not an inbox. https://www.aveecare.com/features/recruitment
- **MiraKare dashboard case study:** centralised schedule, health updates, medication tasks and activity feed. Lesson: care teams need a concise operational picture and contextual handovers. https://www.uxteam.com/portfolio-item/caregiver-dashboard-for-managing-daily-care/
- **Ingenovis Health candidate portal redesign:** put job discovery before forced profile completion and gather profile data contextually. Lesson: do not block job discovery behind a long onboarding form. https://akanekodani.com/portfolio/ingenovis-health-portal-dashboard-update/
- **Home-care website recruitment guidance:** separate the “get care” and “careers/apply” paths and make roles, location, schedule and application CTA clear. Lesson: never mix client intake with caregiver applications. https://progressionagency.com/home-care-website-design

## Current UI implementation in this branch

- Recruitment workspace: overview metrics, pipeline stages, applicant search/filter, candidate review drawer/modal, stage changes, job openings and creation, talent-pool and interview placeholders.
- Candidate-facing careers experience: separate recruitment landing surface, published-role cards, two-step application form, consent acknowledgement and success state.
- Responsive layouts for desktop/tablet/mobile with a consistent CareBridge visual language.
- All visible candidate and job records are illustrative local state. This is a UI demonstration only; it is not connected to Supabase, does not persist applications, and the document upload control is not yet a production upload.

## Production acceptance criteria

- A published job is visible only through a narrow public job DTO; drafts, internal notes, tenant IDs, applicant counts if sensitive, and staff data are never exposed.
- Applicants can submit without being members of the agency. The server creates applicant + application + event atomically and returns a non-guessable reference.
- Applicants can securely view only their own application after verified email/phone or authenticated account linking.
- Recruiters see only applications within their organisation and according to assigned permissions.
- Status changes append history events; candidate-visible updates are deliberately selected and do not reveal internal screening notes.
- CVs and certificates are private objects, scanned/validated, size-limited, and served through short-lived authorised links.
- Credential verification is an explicit human workflow. Do not treat an uploaded certificate as verified.
- Conversion to a caregiver record requires an approved decision, checks appropriate to the role, consent, contract/employment details and account provisioning.
- Automated tests cover cross-tenant access, anonymous submission abuse, duplicate submissions, expired openings, file type/size, candidate access and status-history integrity.
