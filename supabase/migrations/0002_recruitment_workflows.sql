-- CareBridge recruitment expansion
-- Apply after 0001_core_foundation.sql. Public applicants must submit through a
-- rate-limited Cloudflare Worker; never grant anonymous table access.
begin;

alter table public.job_openings
  add column if not exists responsibilities text[] not null default '{}',
  add column if not exists benefits text[] not null default '{}',
  add column if not exists salary_min numeric(12,2),
  add column if not exists salary_max numeric(12,2),
  add column if not exists salary_currency char(3) not null default 'GHS',
  add column if not exists work_schedule text,
  add column if not exists application_instructions text,
  add column if not exists public_reference text,
  add column if not exists updated_by uuid references public.profiles(id),
  add constraint job_openings_salary_range_check
    check (salary_min is null or salary_max is null or salary_max >= salary_min);

create unique index if not exists job_openings_public_reference_uidx
  on public.job_openings(public_reference) where public_reference is not null;
create index if not exists job_openings_public_search_idx
  on public.job_openings(status, region, published_at desc)
  where status = 'published';

alter table public.applicants
  add column if not exists preferred_name text,
  add column if not exists professional_summary text,
  add column if not exists years_experience numeric(4,1),
  add column if not exists availability_date date,
  add column if not exists preferred_shifts text[] not null default '{}',
  add column if not exists consent_at timestamptz,
  add column if not exists privacy_notice_version text;

alter table public.applications
  add column if not exists source text not null default 'careers_portal',
  add column if not exists cover_letter text,
  add column if not exists availability_notes text,
  add column if not exists submitted_ip_hash text,
  add column if not exists withdrawn_at timestamptz;

create table public.applicant_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  document_type text not null check (document_type in (
    'cv','resume','professional_certificate','registration_proof','identity_document',
    'reference_letter','training_certificate','other'
  )),
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 10485760),
  review_status text not null default 'pending' check (review_status in ('pending','accepted','rejected','expired')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_note text,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, storage_path)
);

create table public.application_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  actor_user_id uuid references public.profiles(id),
  event_type text not null,
  from_status text,
  to_status text,
  candidate_visible boolean not null default false,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  interview_type text not null default 'in_person' check (interview_type in ('phone','video','in_person','panel')),
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  location_or_link text,
  status text not null default 'scheduled' check (status in ('scheduled','confirmed','completed','cancelled','no_show')),
  outcome text check (outcome in ('pass','hold','fail') or outcome is null),
  feedback text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (scheduled_end > scheduled_start)
);

create table public.applicant_references (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  referee_name text not null,
  relationship text,
  organisation_name text,
  email text,
  phone text,
  check_status text not null default 'pending' check (check_status in ('pending','contacted','verified','unable_to_verify','declined')),
  checked_by uuid references public.profiles(id),
  checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index applicant_documents_applicant_idx on public.applicant_documents(organization_id, applicant_id);
create index application_events_timeline_idx on public.application_events(organization_id, application_id, occurred_at desc);
create index interviews_schedule_idx on public.interviews(organization_id, scheduled_start);
create index applicant_references_applicant_idx on public.applicant_references(organization_id, applicant_id);

create trigger interviews_set_updated_at before update on public.interviews
for each row execute function public.set_updated_at();

alter table public.applicant_documents enable row level security;
alter table public.application_events enable row level security;
alter table public.interviews enable row level security;
alter table public.applicant_references enable row level security;

create policy "applicant_documents_recruitment_read" on public.applicant_documents
for select to authenticated using (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer','auditor']::public.membership_role[])
);
create policy "applicant_documents_recruitment_manage" on public.applicant_documents
for all to authenticated using (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[])
) with check (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[])
);

create policy "application_events_recruitment_read" on public.application_events
for select to authenticated using (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer','auditor']::public.membership_role[])
);
create policy "application_events_recruitment_insert" on public.application_events
for insert to authenticated with check (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[])
);

create policy "interviews_recruitment_read" on public.interviews
for select to authenticated using (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[])
);
create policy "interviews_recruitment_manage" on public.interviews
for all to authenticated using (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[])
) with check (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[])
);

create policy "applicant_references_recruitment_read" on public.applicant_references
for select to authenticated using (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[])
);
create policy "applicant_references_recruitment_manage" on public.applicant_references
for all to authenticated using (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[])
) with check (
  public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[])
);

grant select, insert, update, delete on public.applicant_documents to authenticated;
grant select, insert on public.application_events to authenticated;
grant select, insert, update, delete on public.interviews to authenticated;
grant select, insert, update, delete on public.applicant_references to authenticated;

-- Intentionally no anon grants or policies on applicant, application, document,
-- reference or interview tables. The public careers API must return a narrow
-- published-job DTO and accept applications via a server-side transaction.
commit;
