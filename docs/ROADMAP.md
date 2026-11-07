# Development roadmap and acceptance criteria

This roadmap is the delivery source of truth. Features are not complete merely because a navigation item or visual screen exists.

## Milestone 0 — Repository and engineering foundation
- [x] React + TypeScript + Vite project
- [x] Responsive application shell and dashboard scaffold
- [x] Product, architecture, data model, workflow and security documentation
- [ ] CI typecheck/build workflow
- [ ] Linting and automated test harness
- [ ] Design tokens and reusable component primitives

Acceptance: clean install, typecheck and production build pass; documentation matches repository.

## Milestone 1 — Supabase foundation and identity
- [ ] Create development/staging/production Supabase projects
- [ ] SQL migrations for profiles, organisations, memberships and platform admins
- [ ] Supabase Auth integration and account lifecycle
- [ ] Organisation invitation and membership management
- [ ] Permission matrix and server-side authorization middleware
- [ ] RLS policies and cross-tenant tests
- [ ] Audit event foundation
- [ ] Admin settings and organisation onboarding

Acceptance: users can sign in, join only authorised organisations, switch tenant context safely, and cannot access another tenant's data. Privileged roles are audited.

## Milestone 2 — Recruitment and workforce
- [x] Recruitment workspace UI prototype (local demo data only)
- [x] Candidate-facing careers and two-step application UI prototype
- [x] Recruitment schema migration for documents, application events, interviews and references
- [ ] Public job DTO/API and transactional application submission
- [ ] Applicant authentication and application status tracking
- [ ] Private CV/certificate storage, scanning and authorised downloads
- [ ] Persistent recruitment review, interview and decision API
- [ ] Credential verification and expiry tracking
- [ ] Caregiver/staff profiles, competencies and availability

Acceptance: complete applicant journey works with role checks, private files, audit trail and tests.

## Milestone 3 — Client intake and care plans
- [ ] Client records, contacts and referrals
- [ ] Consent/authority records
- [ ] Functional and clinical assessment templates approved by client clinical lead
- [ ] Versioned care plans and task catalogue
- [ ] Clinical/non-clinical task separation and competency checks

Acceptance: client intake and care-plan approval is traceable; unqualified staff cannot access/perform restricted clinical tasks.

## Milestone 4 — Scheduling and visits
- [ ] Staff availability and roster
- [ ] Client/staff matching rules
- [ ] One-off and recurring scheduling
- [ ] Conflict and working-hours checks
- [ ] Visit clock-in/out
- [ ] Visit tasks, notes, exceptions and incidents
- [ ] Supervisor review and immutable amendment trail

Acceptance: visit lifecycle works end-to-end and all schedule/visit changes are audited.

## Milestone 5 — Clinical workflows
- [ ] Clinical observations
- [ ] Medication records and administration
- [ ] Escalation and incident review
- [ ] Credential/scope verification
- [ ] Clinical sign-off and amendments

Acceptance: workflows approved by qualified clinical lead; comprehensive authorization, safety and audit tests pass.

## Milestone 6 — Finance and communications
- [ ] Service rates and billable rules
- [ ] Invoice and line items
- [ ] Payment provider integration with verified webhooks
- [ ] Caregiver compensation/payroll workflow
- [ ] Email/SMS notifications
- [ ] Family/client portal

Acceptance: financial reconciliation is idempotent; family access is consent-aware; notifications do not leak sensitive details.

## Milestone 7 — PWA, offline and reporting
- [ ] Installable PWA
- [ ] Caregiver mobile-first visit interface
- [ ] Minimal encrypted offline queue and conflict handling
- [ ] Reports and exports with permissions/audit
- [ ] Operational monitoring and alerts

Acceptance: offline sync tests pass, exports are controlled, and restore/security drills are completed.

## Production release gate

No real patient data or live clinical service until security and privacy gates in SECURITY_AND_PRIVACY.md are satisfied, clinical workflows have professional sign-off, backups/restore have been tested and the operating organisation has completed its compliance review.
