# Security, privacy and clinical safety

## Security posture

CareBridge will process personal data and potentially sensitive health data. The application is not production-ready until controls in this document are implemented, tested and independently reviewed.

## Ghana context

The operator must assess obligations under Ghana's Data Protection Act, 2012 (Act 843), including data-controller/processor responsibilities, registration where required, lawful basis, transparency, data-subject rights, security safeguards, retention and breach response. Obtain advice from the Ghana Data Protection Commission or qualified local counsel. This document is engineering guidance, not legal advice or a compliance certification.

## Mandatory controls

1. **Authentication:** Supabase Auth with verified email/phone policy, secure recovery, session expiry and MFA for privileged roles where feasible.
2. **Authorisation:** deny by default; tenant membership, role and resource-level policy checks in API and database. Hiding UI controls is not security.
3. **RLS:** enable on every exposed tenant table. Test cross-tenant access and role-specific read/write paths with automated tests.
4. **Private files:** private storage buckets; random object paths; short-lived signed URLs generated only after server-side access checks. Never expose identity/medical records via public buckets.
5. **Secrets:** service role and provider credentials only in server-side secrets. Never commit secrets or put privileged keys in VITE variables.
6. **Audit:** append-only records for viewing, creating, changing, exporting and deleting sensitive records, including actor, tenant, resource, time and outcome. Avoid copying the clinical payload into logs.
7. **Encryption:** TLS in transit; rely on and verify provider encryption at rest; evaluate application-level encryption for especially sensitive fields and key management.
8. **Data minimisation:** collect only information necessary for care, safety, employment and lawful operations.
9. **Retention:** define schedules for applicants, credentials, clients, clinical records, incidents, financial records and audit logs. Do not keep data indefinitely by default.
10. **Backups:** automated backups, tested restoration, documented RPO/RTO and access restrictions.
11. **Monitoring:** security alerts and error reporting must redact patient names, notes, tokens and document URLs.
12. **Exports:** restrict bulk export; record reason and audit the event.
13. **Device safety:** caregiver devices may be shared or lost. Support session revocation, short-lived access, minimal offline data and remote sign-out where possible.
14. **Incident response:** document escalation, containment, investigation, notification assessment and recovery.

## Clinical safety

- The system is a coordination and documentation tool, not a diagnostic or prescribing system.
- Clinical workflows must be designed and signed off by qualified professionals.
- Only appropriately credentialed and authorised personnel may perform clinical tasks.
- Credential verification must include issuing body, status, expiry and evidence; do not treat uploaded certificates as verified.
- Medication instructions must originate from an authorised source and have clear version/history.
- Medication administration exceptions, omissions and corrections must be preserved and escalated according to organisation policy.
- Care plans need author, approver, effective date and review date.
- Never silently overwrite a signed clinical note; use amendments with author, timestamp and reason.
- Incident severity, escalation and safeguarding workflows need client policy and clinical governance.
- Clinical decision support or AI must not be introduced without a separate safety, privacy and validation review.

## Data classification

- Public: marketing pages and published job listings.
- Internal: operational configuration and non-sensitive aggregate metrics.
- Confidential: applicant CVs, staff records, contact details and contracts.
- Restricted health: assessments, diagnoses/history, medication, clinical notes, observations and care plans.

Restricted health records require the strictest access, audit and export controls.

## Pre-production security gate

Do not onboard real clients until:
- all RLS policies are implemented and tested;
- tenant-isolation tests pass;
- privileged API routes verify identity and membership;
- private file access is tested against unauthorised users;
- audit events are recorded and tamper-resistant for application roles;
- backups and recovery are demonstrated;
- privacy notices, consent and retention are approved;
- clinical workflows are signed off by the organisation's clinical lead;
- a security review and operational incident plan are completed.
