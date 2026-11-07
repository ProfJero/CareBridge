# CareBridge — Home Care Management Platform

CareBridge is a modular home healthcare operations platform for organisations delivering **both non-medical home support and professional nursing/clinical services**. The project is built by ProfJero.

> **Project status:** Foundation / early implementation. The current dashboard contains illustrative demo data and navigation scaffolding. It is not a production healthcare system and must not be used with real patient information until authentication, database policies, audit logging, secure storage, backups and clinical workflows have been implemented and reviewed.

## Product goals

- Manage client/patient intake, demographics, contacts, referrals and service eligibility.
- Recruit, vet and manage caregivers and licensed clinical professionals.
- Assess care needs and maintain individualised care plans.
- Match and schedule staff for one-off and recurring visits.
- Record visit attendance, tasks, notes, observations and incidents.
- Support clinical documentation with appropriate professional oversight.
- Manage service rates, invoices, payments and workforce compensation.
- Provide role-appropriate portals for agency staff, caregivers and authorised clients/family.
- Maintain traceability, privacy, security and operational reporting.

## Technology decisions

| Layer | Choice | Reason |
|---|---|---|
| Web application | React + TypeScript + Vite | Typed, maintainable component-based UI |
| Styling | CSS modules/global CSS foundation | Responsive UI without coupling the project to a large component framework |
| Icons | lucide-react | Consistent interface icons |
| API | Cloudflare Workers + Hono (planned) | Explicit backend boundary; avoids Firebase Functions / Blaze dependency |
| Database | Supabase PostgreSQL (planned) | Relational data, constraints, transactions, SQL reporting |
| Identity | Supabase Auth (planned) | Managed identity; app roles remain in application tables |
| Data access security | PostgreSQL RLS + API authorization | Defence in depth |
| Private files | Supabase Storage private buckets (planned) | Signed access and database-linked ownership |
| Hosting | Cloudflare Pages (planned) | Static web deployment |
| PWA | Workbox/service worker (planned) | Installable caregiver experience; offline workflow later |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DATA_MODEL.md](docs/DATA_MODEL.md), [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md), [docs/WORKFLOWS.md](docs/WORKFLOWS.md), and [docs/ROADMAP.md](docs/ROADMAP.md). Recruitment UX and delivery details are in [docs/UX_DESIGN_BENCHMARKS.md](docs/UX_DESIGN_BENCHMARKS.md) and [docs/RECRUITMENT_WORKFLOWS.md](docs/RECRUITMENT_WORKFLOWS.md).

## Run locally

Requirements: Node.js 20.19+ or 22.12+, npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To build:

```bash
npm run typecheck
npm run build
npm run preview
```

The current UI is a frontend foundation and can run without Supabase credentials. Do not add service-role secrets to frontend environment variables.

## Environment configuration

Copy `.env.example` to `.env.local` and set the Supabase project URL and publishable/anon key only after the Supabase schema and RLS policies have been deployed and reviewed.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

A Supabase service-role key, database password, Cloudflare API token or other secret must never use a `VITE_*` variable or be committed.

## Core product domains

1. Identity and organisation tenancy
2. Applicants, recruitment and credential verification
3. Clients/patients, referrals and consent
4. Assessments and care plans
5. Staff availability, rostering and assignments
6. Visits, EVV, care tasks, notes and incidents
7. Clinical records and medication workflows
8. Billing, payments and payroll/compensation
9. Communications and notifications
10. Audit, reporting and configuration

## Documentation contract for AI contributors

Before changing code, an AI coding assistant must:
1. Read this README and every relevant document in `docs/`.
2. Preserve the architecture decisions and data ownership boundaries.
3. Never use real patient data in development fixtures, screenshots, logs or tests.
4. Treat clinical decisions and care-plan content as human-professional responsibilities.
5. Add or update documentation when changing schema, permissions, workflows, APIs or environment variables.
6. Add tests for business rules and authorization; do not rely only on frontend route hiding.
7. Never weaken RLS or expose private buckets to make a feature work.
8. Do not claim a feature is complete unless its UI, API, persistence, authorization, validation, tests and documentation are implemented.
9. Use migrations for all database changes; do not make undocumented manual production edits.
10. Report incomplete integrations and assumptions explicitly.

## Important disclaimer

CareBridge is software for coordinating care. It does not diagnose, prescribe, replace licensed clinical judgement or guarantee compliance by itself. Clinical workflows, professional scope, retention, consent, incident escalation and regulatory obligations must be reviewed by the operating organisation and qualified Ghanaian healthcare/legal professionals before live deployment.
