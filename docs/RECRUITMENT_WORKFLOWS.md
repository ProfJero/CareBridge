# Recruitment workflows and API contract

## Applicant journey

1. Applicant opens the organisation's public careers page and browses only published openings.
2. Job detail shows category (clinical/non-clinical), location, employment type, work pattern, responsibilities, essential qualifications, pay range when approved, closing date and privacy notice.
3. Applicant starts a short application: full name, email, phone and selected role.
4. Applicant completes a second step with experience summary, availability and consent. CV and credentials are collected through a private upload flow; sensitive identity or professional-registration numbers should only be requested when justified.
5. Server validates the job is open, applies rate limits and bot controls, creates applicant/application/event in one transaction, sends a neutral confirmation and returns a random reference.
6. Applicant can later view progress via authenticated account or verified one-time link. Do not expose application status based only on a sequential ID or email address.
7. Recruiter screens, shortlists, schedules interview, records structured feedback, performs references and credential verification, then approves, declines or holds.
8. On approval, a controlled conversion workflow creates a caregiver/staff record, transfers validated profile data and documents, provisions the correct membership and records an audit event.

## Application stages

draft -> submitted -> screening -> shortlisted -> interview -> credential_check -> approved

Terminal/alternative states: rejected, withdrawn. The UI may label approved as “Hired” after employment onboarding is complete; keep the database decision distinct from employment status. Every transition appends an application_events row. Do not silently overwrite or delete history.

## Public API (Cloudflare Worker + Hono; planned)

All endpoints are organisation-scoped by a public, non-secret organisation slug or public reference, not by trusting a caller-supplied organisation UUID.

### GET /v1/public/organisations/:slug/jobs
Return only published and in-date job fields:
reference, title, summary, description, service_category, employment_type, region, work_schedule, responsibilities, required_qualifications, salary_min, salary_max, salary_currency, closes_at.
Never return internal notes, created_by, tenant identifiers, unpublished openings or candidate data.

### GET /v1/public/jobs/:reference
Return the same narrow public DTO plus application instructions and approved benefits.

### POST /v1/public/jobs/:reference/applications
Accept validated fields: full_name, email, phone, experience_summary, availability, consent, privacy_notice_version. Enforce request size, validation, rate limits, anti-automation, idempotency, duplicate detection and server-side organisation lookup. Create applicant, application and first application_events row transactionally. Return application_reference and a generic receipt. Never trust client-supplied status, reviewer, organisation ID or credential verification.

### POST /v1/applicant/documents/presign
Authenticated/verified applicant or recruiter only. Server authorises application ownership, checks document type and issues a short-lived upload URL to a private bucket. Enforce allow-listed MIME types, extension/content checks, size cap (initial 10 MiB), random object names and malware scanning/quarantine before recruiter download.

### GET /v1/applicant/applications
Return only the authenticated applicant's own applications and candidate-visible timeline events.

### GET /v1/recruitment/applications and PATCH /v1/recruitment/applications/:id
Recruitment roles only; organisation membership and permission checks are mandatory. PATCH accepts a transition command, not arbitrary status mutation. Validate transition graph, append event, audit actor and notify candidate only for candidate-visible events.

### POST /v1/recruitment/applications/:id/interviews
Recruitment roles only. Validate scheduled interval, interviewer membership, timezone, candidate contact preference and notification.

### POST /v1/recruitment/applications/:id/convert
Agency admin/recruitment officer only, with explicit approval prerequisites. Idempotently create caregiver and membership, transfer approved fields, and record audit event.

## Security and privacy controls

- No anonymous Supabase table grants/policies for applicants, applications, documents, references or interviews.
- Public job access is through a server DTO, not direct table reads.
- Never expose service-role keys in Vite/client bundles.
- Private storage only; signed URLs expire quickly and require an authorisation check.
- Restrict access to professional registration details and identity documents.
- Keep internal screening notes separate from candidate-visible timeline messages.
- Rate limit public endpoints and protect against enumeration and spam.
- Establish retention/deletion rules and applicant privacy notice with local legal review.
- Audit recruiter access to sensitive records and every stage transition.
- Use least privilege, tenant scoping, explicit permissions and tests for cross-tenant leakage.

## Current implementation status

The UI in src/components/RecruitmentWorkspace.tsx is a front-end demonstration backed by local React state and sample records. The SQL migration adds data structures and authenticated recruitment-role policies. The public API, real persistence, private storage upload, notifications, verification integrations, applicant authentication/status lookup, interview scheduling persistence and caregiver conversion still need implementation and security testing. Do not use this branch as a live recruitment service until those items are complete.
