# Architecture and engineering decisions

## 1. Product context

CareBridge supports a Ghana-oriented home-care provider delivering both:
- **Non-medical support:** companionship, personal care, mobility assistance, meal support, household-related assistance within approved scope, and activities of daily living.
- **Clinical services:** nursing and other appropriately licensed clinical services, observations, medication-related workflows and clinical documentation under qualified professional governance.

These service types must be represented explicitly. A caregiver without the relevant professional authorisation must not be assigned clinical tasks merely because they are available.

## 2. Architecture

The target architecture is:

```text
Browser / Installable PWA
  | React + TypeScript
  v
Cloudflare Worker API (Hono)
  | authentication token verification
  | organisation membership + permission checks
  | input validation + business rules
  | audit events + rate limits
  v
Supabase PostgreSQL (RLS enabled)
  | private Storage buckets
  | Realtime only for approved low-risk updates
  v
External services: email/SMS, payment gateway, maps
```

The browser must not be trusted to enforce permissions. The API and database policies enforce access. Direct browser-to-Supabase access may be used for carefully scoped user-owned operations, but every exposed table must have tested RLS policies. Sensitive clinical mutations should go through the API to guarantee validation and audit events.

## 3. Technology decisions

- React + TypeScript + Vite: frontend.
- Cloudflare Workers + Hono: API and server-side workflows.
- Supabase PostgreSQL: primary relational database.
- Supabase Auth: identity provider; application roles are stored separately.
- Supabase Storage: private files only, accessed through signed URLs after authorization.
- Cloudflare Pages: static frontend hosting.
- PWA: installability and eventual caregiver offline support.

No Firebase Functions dependency. No privileged database secret in the browser.

## 4. Multi-organisation tenancy

Every tenant-owned business record must have an `organization_id`. The API derives the organisation from the authenticated user's active membership; never trust an arbitrary organisation ID from a client request.

A user may belong to more than one organisation. Model membership separately from identity. Roles are scoped to an organisation. Super-administrator access is a separate platform-level capability, not a normal tenant role.

## 5. Backend conventions

- REST API prefix: `/api/v1`.
- JSON request/response bodies.
- UUID primary keys.
- UTC timestamps in storage; render in the organisation's configured timezone.
- ISO 8601 date/time strings at API boundaries.
- Pagination for list endpoints.
- Zod or equivalent runtime validation at every untrusted boundary.
- Stable machine-readable error codes; never return stack traces or sensitive fields.
- Idempotency keys for payment and other retryable financial operations.
- Optimistic concurrency or explicit state transitions for scheduling and clinical records.

## 6. State changes

Important entities must use controlled state transitions, not arbitrary status strings from the browser. Examples:
- Application: draft -> submitted -> screening -> shortlisted -> interview -> credential_check -> approved/rejected/withdrawn.
- Visit: scheduled -> confirmed -> en_route (optional) -> checked_in -> in_progress -> completed; missed/cancelled require reasons.
- Care plan: draft -> pending_review -> approved -> active -> suspended/closed.
- Invoice: draft -> issued -> partially_paid -> paid/overdue/void.

Transitions are validated server-side and recorded in audit history.

## 7. Clinical/non-clinical separation

A visit has a service category and service tasks. Clinical tasks require staff credentials and scope checks. Clinical notes, medication administration records and observations are separate resources with stricter access policies and audit requirements. Non-clinical staff should only see the minimum care instructions required to perform assigned support safely.

## 8. Frontend organisation (target)

```text
src/
  app/              # routing, providers, application shell
  components/       # shared design system
  features/
    auth/
    dashboard/
    clients/
    caregivers/
    recruitment/
    assessments/
    care-plans/
    scheduling/
    visits/
    clinical/
    finance/
    communications/
    reports/
    settings/
  lib/              # API client, Supabase browser client, utilities
  types/            # shared domain types
```

The initial repository may be flatter while the foundation is small. Move code into feature folders as real modules are implemented.

## 9. Operational requirements

- Separate local, staging and production Supabase projects.
- Versioned SQL migrations.
- Automated typecheck, lint and tests in CI.
- Database backup and restore drills before production.
- Monitoring and alerting without logging clinical payloads.
- Documented incident response and access revocation.
- Dependency updates and secret rotation.
