# AI contributor guide — read before modifying CareBridge

This file is mandatory context for any AI coding agent (ChatGPT, Claude, Copilot, Cursor or other).

## Read order

1. `README.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DATA_MODEL.md`
4. `docs/SECURITY_AND_PRIVACY.md`
5. `docs/WORKFLOWS.md`
6. `docs/ROADMAP.md`
7. This guide and relevant source files.

## Product definition

CareBridge is a multi-tenant home healthcare management application for an organisation that provides BOTH non-medical home support and professional clinical/nursing care. It is not merely a job board or a generic CRM.

Primary actors: platform administrator, agency administrator, operations manager, recruitment officer, care coordinator, clinical supervisor, nurse/clinical professional, non-clinical caregiver, finance officer, auditor, client and authorised family contact.

## Non-negotiable engineering rules

- TypeScript strict mode. Avoid `any`; define domain types and validate untrusted data at runtime.
- Keep UI, domain logic, API and persistence responsibilities separate.
- Use SQL migrations for schema changes. Never ask an operator to manually patch production tables without a migration.
- Every tenant-owned record carries organisation ownership and is protected by RLS and API authorization.
- Derive tenant context from authenticated membership, not a user-supplied organisation ID.
- Deny access by default. Test direct API/database access, not just the UI.
- Do not expose service-role keys, database passwords or API secrets in frontend code, browser storage or Git.
- Private health, identity and credential documents must never be placed in public buckets.
- Clinical tasks and medication workflows require professional scope checks and human clinical governance.
- No AI-generated diagnosis, prescription or autonomous clinical decision.
- Never place real patient data in fixtures, unit tests, screenshots, analytics or logs.
- Financial operations require decimal money types, verified webhooks and idempotency.
- All sensitive changes and access events require auditability.
- No fake "success" UI: show loading, success and error based on actual API responses.

## Definition of done for a feature

A feature is done only when all relevant items are complete:
1. Documented user story and business rules.
2. Typed domain model and runtime validation.
3. Database migration, constraints and indexes.
4. RLS policies and negative authorization tests.
5. API implementation with authentication and permission checks.
6. UI states: loading, empty, error, success, validation.
7. Audit events for sensitive actions.
8. Unit/integration tests and build/typecheck pass.
9. Documentation, API contracts and environment variables updated.
10. Known limitations and operational steps recorded.

## Change protocol

Before implementation, inspect current code and existing migrations. Avoid duplicating concepts. Prefer small vertical slices (schema + policy + API + UI + tests + docs). After changes run `npm run typecheck`, `npm run build` and the relevant tests. Report commands and outcomes truthfully.

## External integration protocol

Do not assume credentials or production accounts exist. Define provider interfaces and local mocks first. Keep provider credentials in Cloudflare Worker secrets. Document setup and webhook verification. Never hardcode secrets.

## Current state warning

The initial dashboard is a visual scaffold with illustrative values and placeholder module views. It is not connected to Supabase. Never describe clients, visits, applicants, service quality or financial information currently shown as real records.
