# Domain model and database design

This document is the source of truth for the intended relational model. Implement the schema through versioned Supabase SQL migrations. Table names are snake_case. All tenant-owned tables include `organization_id` unless explicitly stated.

## 1. Identity and tenancy

### profiles
- id UUID PK, references auth.users(id)
- full_name, phone, avatar_path, preferred_locale
- created_at, updated_at

### organizations
- id UUID PK
- legal_name, display_name, registration_number (optional)
- contact_email, contact_phone
- address fields, country_code (default GH)
- timezone (default Africa/Accra), currency_code (default GHS)
- status, created_at, updated_at

### memberships
- id UUID PK
- organization_id FK, user_id FK profiles
- role (platform_admin is NOT stored here)
- status (invited, active, suspended, revoked)
- created_at, unique(organization_id,user_id)

Roles: agency_admin, operations_manager, recruitment_officer, care_coordinator, clinical_supervisor, nurse, caregiver, finance_officer, auditor, client, family_contact. Permissions should be granular and tenant-scoped; role labels alone are not a substitute for authorization.

### platform_admins
- user_id PK references profiles
- granted_at, granted_by
- platform-wide access is exceptional and fully audited.

## 2. People, recruitment and credentials

### applicants
- id UUID PK, organization_id FK
- user_id nullable FK profiles (application may begin before account linking)
- legal_name, contact details, date_of_birth only if justified
- address, emergency_contact
- preferred_work_regions, employment_type_preference
- profile_status, created_at, updated_at

### job_openings
- id, organization_id, title, description, service_category
- required_qualifications JSONB (validated schema)
- employment_type, location/region, status, published_at, closes_at

### applications
- id, organization_id, applicant_id FK, job_opening_id nullable FK
- application_reference, submitted_at, status, reviewer_id
- screening_notes (restricted), decision_reason, created_at, updated_at

### credentials
- id, organization_id, applicant_id nullable FK, caregiver_id nullable FK
- credential_type, issuing_body, credential_number (highly restricted)
- issue_date, expiry_date, verification_status, verified_by, verified_at
- secure document reference, never public URL.

### caregivers
- id, organization_id, user_id nullable FK profiles
- staff_reference, employment_status, service_categories
- competency profile, availability summary, start_date, end_date
- professional registration details belong in restricted credential records.

## 3. Clients and care relationships

### clients
- id, organization_id, client_reference
- legal_name, preferred_name, contact details
- date_of_birth only where needed; address/service location
- emergency contact and next-of-kin references
- referral_source, intake_status, service_status
- consent_status and consent record references
- created_at, updated_at

### client_contacts
- id, organization_id, client_id, name, relationship, contact details
- contact_role (next_of_kin, emergency, family_contact, legal_representative)
- can_receive_updates boolean; can_view_portal boolean
- legal authority/consent evidence must be recorded before granting access.

### referrals
- id, organization_id, client_id nullable
- source, referrer details, reason, received_at, status, assigned_to.

### assessments
- id, organization_id, client_id, assessment_type (initial, clinical, functional, risk, review)
- assessor_id, assessed_at, status, structured_data JSONB, summary
- clinical assessment fields are restricted to authorised clinical roles.
- version, reviewed_by, reviewed_at.

### care_plans
- id, organization_id, client_id, version, status
- start_date, review_date, end_date, created_by, approved_by, approved_at
- goals and instructions; avoid mixing clinical orders with non-clinical preferences.

### care_plan_tasks
- id, organization_id, care_plan_id, title, description
- service_category (non_clinical, clinical), frequency, instructions
- required_competency, requires_clinical_authorisation boolean
- active_from, active_until.

## 4. Rostering and service delivery

### caregiver_availability
- id, organization_id, caregiver_id, starts_at, ends_at, availability_status.

### service_assignments
- id, organization_id, client_id, caregiver_id, care_plan_id nullable
- service_category, start_date, end_date, status, coordinator_id.

### visits
- id, organization_id, client_id, assignment_id nullable, caregiver_id
- scheduled_start, scheduled_end, actual_check_in, actual_check_out
- status, service_category, location metadata (minimise precision)
- check_in_method, exception_reason, created_by.
- GPS is optional and requires transparent purpose, consent/legal basis and retention limits.

### visit_tasks
- id, organization_id, visit_id, care_plan_task_id nullable
- task_label, service_category, completion_status, completed_at, completed_by, exception_note.

### visit_notes
- id, organization_id, visit_id, author_id
- note_type (general, handover, clinical, incident_reference)
- body, created_at, amended_at, amendment_reason
- clinical note access must be restricted; preserve immutable amendment history.

### incidents
- id, organization_id, client_id, visit_id nullable, reported_by
- category, severity, description, immediate_action, escalation_status
- reviewed_by, reviewed_at, created_at.

## 5. Clinical records (restricted)

### clinical_observations
- id, organization_id, client_id, visit_id nullable, recorded_by
- observation_type, value, unit, observed_at, context
- reviewed_by, reviewed_at.

### medication_records
- id, organization_id, client_id, medication_name, formulation, strength
- instructions, route, schedule, prescriber_reference, active status
- only authorised roles may create or amend medication instructions.

### medication_administration
- id, organization_id, medication_record_id, visit_id, administered_by
- administered_at, dose_given, outcome, omission_reason, notes
- record exceptions and late entries explicitly; never silently overwrite history.

Clinical schemas require review by qualified clinicians before use. Do not infer a prescription, dose or treatment from an AI-generated suggestion.

## 6. Finance

### service_rates
- id, organization_id, service_category, rate_unit, amount, currency, effective dates.
### invoices
- id, organization_id, client_id, invoice_number, issue_date, due_date
- subtotal, tax_amount, total, currency, status.
### invoice_lines
- id, organization_id, invoice_id, visit_id nullable, description, quantity, unit_rate, line_total.
### payments
- id, organization_id, invoice_id, provider, provider_reference
- amount, currency, status, received_at, reconciled_by.
### caregiver_compensation
- id, organization_id, caregiver_id, period_start, period_end
- gross_amount, deductions, net_amount, status, approved_by.

Financial amounts must use decimal/numeric database types, never floating-point. Payment webhooks must be verified server-side and processed idempotently.

## 7. Communications, audit and configuration

### notifications
- id, organization_id, recipient_user_id, channel, template_key
- delivery_status, sent_at, metadata (no clinical detail unless justified).
### audit_logs
- id, organization_id nullable for platform events
- actor_user_id, action, resource_type, resource_id
- occurred_at, request_id, outcome, metadata with sensitive values redacted.
- append-only; no update/delete for ordinary application roles.
### organisation_settings
- organization_id PK, timezone, currency, notification preferences, retention settings.

## 8. Relationship overview

```text
auth.users -> profiles -> memberships -> organizations
organizations -> applicants -> applications -> job_openings
applicants -> credentials -> caregivers
organizations -> clients -> referrals / contacts / assessments
clients -> care_plans -> care_plan_tasks
clients + caregivers -> service_assignments -> visits
visits -> visit_tasks / visit_notes / incidents / clinical_observations
clients -> medication_records -> medication_administration
visits -> invoice_lines -> invoices -> payments
caregivers -> caregiver_compensation
all sensitive actions -> audit_logs
```

## 9. Data modelling rules

- Use FK constraints, indexes and unique constraints for invariants.
- Add created_at/updated_at and updated_at triggers where appropriate.
- Use soft deletion only where legally and operationally appropriate; retention policy governs final erasure.
- Avoid storing duplicate patient or staff demographics in visits; use stable FKs and immutable snapshots only where a business/legal need exists.
- Use JSONB for versioned form payloads only when structure is explicitly validated. Core relationships and reportable fields remain typed columns.
- All timestamps are timestamptz.
- Document every schema change and provide reversible migration guidance where feasible.
