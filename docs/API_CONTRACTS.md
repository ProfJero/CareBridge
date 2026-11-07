# API contracts (planned)

API root: `/api/v1`. All endpoints require HTTPS. JSON is the default content type. Authentication uses a Supabase Auth access token in the Authorization bearer header. The API validates token identity, active organisation membership, role permissions and resource ownership. Never trust organisation IDs or role claims supplied by the browser.

## Standard response shapes

Success:
```json
{ "data": {}, "meta": { "requestId": "uuid" } }
```

Error:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Please check the submitted information.", "details": [] }, "meta": { "requestId": "uuid" } }
```

Do not return database internals, stack traces, secrets or restricted fields.

## Initial endpoint map

### Identity and organisation
- GET `/me` — current profile and active memberships.
- POST `/organizations` — create an organisation; backed by the transactional database function.
- GET `/organizations/:organizationId` — membership-authorised organisation metadata.
- POST `/organizations/:organizationId/invitations` — admin invites a user with a scoped role.
- PATCH `/organizations/:organizationId/memberships/:membershipId` — update membership status/role with audit.

### Recruitment
- GET/POST `/organizations/:organizationId/jobs`
- GET/PATCH `/organizations/:organizationId/jobs/:jobId`
- POST `/public/jobs/:jobId/applications` — public application intake with rate limit and anti-abuse.
- GET `/organizations/:organizationId/applications`
- GET/PATCH `/organizations/:organizationId/applications/:applicationId`
- POST `/organizations/:organizationId/applications/:applicationId/credential-checks`

### Clients and care
- GET/POST `/organizations/:organizationId/clients`
- GET/PATCH `/organizations/:organizationId/clients/:clientId`
- POST `/organizations/:organizationId/clients/:clientId/assessments`
- POST `/organizations/:organizationId/clients/:clientId/care-plans`
- POST `/organizations/:organizationId/care-plans/:carePlanId/approve`

### Scheduling and visits
- GET/POST `/organizations/:organizationId/visits`
- PATCH `/organizations/:organizationId/visits/:visitId`
- POST `/organizations/:organizationId/visits/:visitId/check-in`
- POST `/organizations/:organizationId/visits/:visitId/check-out`
- POST `/organizations/:organizationId/visits/:visitId/notes`
- POST `/organizations/:organizationId/visits/:visitId/incidents`

### Finance
- GET/POST `/organizations/:organizationId/invoices`
- POST `/organizations/:organizationId/invoices/:invoiceId/issue`
- POST `/organizations/:organizationId/payments/initialize`
- POST `/webhooks/payments/:provider` — signature verification, idempotency and reconciliation.

## API implementation rules

- Validate all path IDs, query parameters and request bodies.
- Paginate list endpoints with bounded page size.
- Use explicit DTOs; never serialize raw database rows containing restricted columns.
- Check tenant membership and resource ownership for every request.
- Check staff credentials and service scope before assigning clinical tasks.
- Use state transition services for applications, care plans, visits and invoices.
- Record audit events for sensitive reads, writes, exports and decisions.
- Use idempotency keys for payment initialization, callbacks and retryable mutations.
- Notifications must not expose sensitive clinical details.
- Rate-limit public applications, authentication-adjacent endpoints and file upload URL creation.
- Return 404 for resources outside caller scope where revealing existence would be unsafe.

These contracts describe the target API. An endpoint is not implemented until its handler, validation, tests, authorization and documentation exist.
