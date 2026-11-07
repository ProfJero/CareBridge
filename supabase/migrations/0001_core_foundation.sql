-- CareBridge core foundation
-- Apply to a NEW Supabase project using the Supabase CLI or SQL editor.
-- Review SECURITY_AND_PRIVACY.md before adding real data.
begin;

create extension if not exists pgcrypto;

create type public.membership_role as enum (
  'agency_admin','operations_manager','recruitment_officer','care_coordinator',
  'clinical_supervisor','nurse','caregiver','finance_officer','auditor','client','family_contact'
);
create type public.membership_status as enum ('invited','active','suspended','revoked');
create type public.record_status as enum ('active','inactive','archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  avatar_path text,
  preferred_locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text not null,
  registration_number text,
  contact_email text,
  contact_phone text,
  address jsonb not null default '{}'::jsonb,
  country_code char(2) not null default 'GH',
  timezone text not null default 'Africa/Accra',
  currency_code char(3) not null default 'GHS',
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.membership_role not null,
  status public.membership_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.platform_admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles(id)
);

create table public.applicants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  legal_name text not null,
  email text,
  phone text,
  address jsonb not null default '{}'::jsonb,
  preferred_work_regions text[] not null default '{}',
  employment_type_preference text,
  profile_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_openings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null default '',
  service_category text not null check (service_category in ('non_clinical','clinical','mixed')),
  required_qualifications jsonb not null default '[]'::jsonb,
  employment_type text,
  region text,
  status text not null default 'draft' check (status in ('draft','published','paused','closed')),
  published_at timestamptz,
  closes_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  applicant_id uuid not null references public.applicants(id) on delete restrict,
  job_opening_id uuid references public.job_openings(id) on delete set null,
  application_reference text not null,
  submitted_at timestamptz,
  status text not null default 'draft' check (status in (
    'draft','submitted','screening','shortlisted','interview','credential_check',
    'approved','rejected','withdrawn'
  )),
  reviewer_id uuid references public.profiles(id),
  screening_notes text,
  decision_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, application_reference)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_reference text not null,
  legal_name text not null,
  preferred_name text,
  email text,
  phone text,
  date_of_birth date,
  address jsonb not null default '{}'::jsonb,
  emergency_contact jsonb not null default '{}'::jsonb,
  referral_source text,
  intake_status text not null default 'prospective',
  service_status text not null default 'pending',
  consent_status text not null default 'pending',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, client_reference)
);

create table public.caregivers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  staff_reference text not null,
  employment_status text not null default 'pending',
  service_categories text[] not null default '{}',
  competency_profile jsonb not null default '{}'::jsonb,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, staff_reference)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  occurred_at timestamptz not null default now(),
  request_id text,
  outcome text not null default 'success',
  metadata jsonb not null default '{}'::jsonb
);

create index memberships_user_status_idx on public.memberships(user_id,status);
create index memberships_org_role_idx on public.memberships(organization_id,role,status);
create index applicants_org_created_idx on public.applicants(organization_id,created_at desc);
create index applications_org_status_idx on public.applications(organization_id,status,created_at desc);
create index job_openings_org_status_idx on public.job_openings(organization_id,status);
create index clients_org_status_idx on public.clients(organization_id,service_status);
create index caregivers_org_status_idx on public.caregivers(organization_id,employment_status);
create index audit_logs_org_time_idx on public.audit_logs(organization_id,occurred_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','organizations','memberships','applicants','job_openings','applications','clients','caregivers']
  loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_set_updated_at', t);
  end loop;
end $$;

-- Security-definer helpers avoid recursive membership RLS evaluation.
create or replace function public.is_org_member(p_org uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = p_org
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.has_org_role(p_org uuid, p_roles public.membership_role[])
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = p_org
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = any(p_roles)
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_role(uuid, public.membership_role[]) from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, public.membership_role[]) to authenticated;

-- Bootstrap function: authenticated creator creates an organisation and its first admin membership atomically.
create or replace function public.create_organization(p_legal_name text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare new_org_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if length(trim(coalesce(p_legal_name,''))) < 2 or length(trim(coalesce(p_display_name,''))) < 2 then
    raise exception 'Organisation names are required';
  end if;
  insert into public.profiles(id, full_name)
    values (auth.uid(), coalesce((select raw_user_meta_data->>'full_name' from auth.users where id=auth.uid()), ''))
    on conflict (id) do nothing;
  insert into public.organizations(legal_name,display_name)
    values (trim(p_legal_name),trim(p_display_name)) returning id into new_org_id;
  insert into public.memberships(organization_id,user_id,role,status)
    values (new_org_id,auth.uid(),'agency_admin','active');
  insert into public.audit_logs(organization_id,actor_user_id,action,resource_type,resource_id)
    values (new_org_id,auth.uid(),'organization.created','organization',new_org_id);
  return new_org_id;
end;
$$;
revoke all on function public.create_organization(text,text) from public;
grant execute on function public.create_organization(text,text) to authenticated;

-- RLS: enable for every application table.
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.platform_admins enable row level security;
alter table public.applicants enable row level security;
alter table public.job_openings enable row level security;
alter table public.applications enable row level security;
alter table public.clients enable row level security;
alter table public.caregivers enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_read_self" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "organizations_read_members" on public.organizations for select to authenticated using (public.is_org_member(id));
create policy "organizations_update_admins" on public.organizations for update to authenticated
  using (public.has_org_role(id, array['agency_admin']::public.membership_role[]))
  with check (public.has_org_role(id, array['agency_admin']::public.membership_role[]));

create policy "memberships_read_same_org" on public.memberships for select to authenticated
  using (public.is_org_member(organization_id));
create policy "memberships_admin_manage" on public.memberships for all to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','operations_manager']::public.membership_role[]))
  with check (public.has_org_role(organization_id, array['agency_admin','operations_manager']::public.membership_role[]));

create policy "platform_admins_read_self" on public.platform_admins for select to authenticated using (user_id = auth.uid());

create policy "applicants_org_recruitment_read" on public.applicants for select to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer','auditor']::public.membership_role[]));
create policy "applicants_org_recruitment_insert" on public.applicants for insert to authenticated
  with check (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[]));
create policy "applicants_org_recruitment_update" on public.applicants for update to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[]))
  with check (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[]));

create policy "job_openings_public_published_read" on public.job_openings for select to anon, authenticated
  using (status = 'published' or public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[]));
create policy "job_openings_recruitment_manage" on public.job_openings for all to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[]))
  with check (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[]));

create policy "applications_recruitment_read" on public.applications for select to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer','auditor']::public.membership_role[]));
create policy "applications_recruitment_manage" on public.applications for all to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[]))
  with check (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[]));

create policy "clients_authorised_staff_read" on public.clients for select to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','operations_manager','care_coordinator','clinical_supervisor','nurse','caregiver','finance_officer','auditor']::public.membership_role[]));
create policy "clients_authorised_staff_insert" on public.clients for insert to authenticated
  with check (public.has_org_role(organization_id, array['agency_admin','operations_manager','care_coordinator']::public.membership_role[]));
create policy "clients_authorised_staff_update" on public.clients for update to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','operations_manager','care_coordinator','clinical_supervisor']::public.membership_role[]))
  with check (public.has_org_role(organization_id, array['agency_admin','operations_manager','care_coordinator','clinical_supervisor']::public.membership_role[]));

create policy "caregivers_staff_read" on public.caregivers for select to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer','care_coordinator','clinical_supervisor','nurse','caregiver','finance_officer','auditor']::public.membership_role[]));
create policy "caregivers_admin_manage" on public.caregivers for all to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[]))
  with check (public.has_org_role(organization_id, array['agency_admin','operations_manager','recruitment_officer']::public.membership_role[]));

create policy "audit_logs_authorised_read" on public.audit_logs for select to authenticated
  using (public.has_org_role(organization_id, array['agency_admin','auditor']::public.membership_role[]));
-- No client-facing INSERT/UPDATE/DELETE policy on audit_logs. API writes via controlled server-side path.

-- Do not grant table-wide writes to anon. Authenticated grants are further constrained by RLS.
grant select, update on public.profiles to authenticated;
grant select, update on public.organizations to authenticated;
grant select, insert, update on public.memberships to authenticated;
grant select on public.platform_admins to authenticated;
grant select, insert, update on public.applicants to authenticated;
grant select, insert, update, delete on public.job_openings to authenticated;
grant select, insert, update on public.applications to authenticated;
grant select, insert, update on public.clients to authenticated;
grant select, insert, update on public.caregivers to authenticated;
grant select on public.audit_logs to authenticated;
grant select on public.job_openings to anon;

commit;
