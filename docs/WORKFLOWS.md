# User journeys and workflow rules

## 1. Recruitment

1. Recruitment officer publishes a vacancy with role, location, service category, required competencies and credential criteria.
2. Applicant creates an account and completes profile.
3. Applicant submits an application and uploads supporting documents to private storage.
4. Application enters submitted state and receives a reference.
5. Recruitment officer screens the application and records a restricted review note.
6. Interview and reference checks may be scheduled and documented.
7. Credentials are verified against the relevant issuing body or authoritative process. Uploaded evidence alone is not verification.
8. Decision is approved, rejected or withdrawn with reason and audit event.
9. Approved applicant is converted/linked to caregiver or clinical staff profile; employment and professional authorisation remain distinct.

## 2. Client intake

1. Receive referral or direct enquiry.
2. Create minimal prospective client record.
3. Record contact/representative details and lawful authority to act.
4. Provide privacy information and capture required consent/legal basis.
5. Assign appropriate assessor.
6. Complete non-clinical and/or clinical assessments according to service requested.
7. Confirm service eligibility, risks, location and required competencies.
8. Agree service plan, rates and start date.
9. Activate client only after required approvals.

## 3. Care planning

- Care plan contains goals, support needs, preferences, visit frequency and task instructions.
- Clearly distinguish non-clinical support tasks from clinical tasks.
- Clinical tasks require authorised clinical author and approval.
- Every approved care plan is versioned, has effective and review dates and preserves prior versions.
- Staff see only the instructions needed for their assignment and role.

## 4. Matching and scheduling

- Match based on verified competencies, professional authorisation, location, availability, service type, client preferences and continuity.
- Prevent overlapping assignments and visits unless an explicitly approved exception exists.
- Check staff working hours, rest policies and organisation rules.
- Recurring visits generate individual visit records with stable series metadata.
- Schedule changes notify relevant parties and preserve who changed what and why.

## 5. Visit delivery

1. Caregiver opens assigned visit and verifies client identity according to organisation policy.
2. Clock-in uses configured method; GPS is optional and must be justified, disclosed and proportionate.
3. Caregiver reviews authorised care instructions and tasks.
4. Tasks are marked complete, not completed or escalated with reason.
5. Clinical observations/medication administration are available only to authorised staff and only when included in the approved care plan.
6. Record notes factually, with no unsupported diagnosis.
7. Incidents or safeguarding concerns follow escalation procedure.
8. Clock-out closes visit; exceptions are reviewed by coordinator.
9. Visit is locked/attested according to policy; amendments are traceable.

## 6. Finance

- Billing rules and rates are organisation-configurable.
- Invoice generation uses completed/approved billable services and immutable rate snapshots.
- Payment provider callback is verified server-side; browser redirect is not proof of payment.
- Duplicate callbacks must not create duplicate payments.
- Payroll/compensation is reviewed and approved before marking paid.
- Tax handling must be configured with appropriate Ghanaian accounting advice; do not hardcode a tax assumption.

## 7. Family/client access

- A family contact receives access only after identity and legal authority/consent are established.
- Family portal exposes only explicitly approved information, not unrestricted clinical records.
- Client/family can request updates or report concerns; staff retain responsibility for clinical responses.
- Revocation of authority immediately removes portal access.

## 8. Notifications

Notifications must be discreet. Do not include diagnosis, medication, clinical notes or sensitive appointment detail in SMS/email/push by default. Direct the recipient to authenticate to view details.

## 9. Offline caregiver mode

Future offline mode must:
- cache only the minimum assigned visit data;
- encrypt local sensitive storage where technically supported;
- require device authentication and short session lifetimes;
- queue signed/idempotent mutations;
- detect conflicts and never silently overwrite a clinical record;
- expire and purge cached records after sync or assignment expiry;
- show clear unsynced state to caregiver and coordinator.
