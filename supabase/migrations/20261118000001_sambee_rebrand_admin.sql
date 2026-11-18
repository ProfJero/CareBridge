-- SamBee rebrand: rename the house store, broaden categories for the Online Trading Center,
-- and store caregiver job applications so the admin dashboard can manage them.

update public.stores
   set name = 'SamBee Care Essentials',
       slug = 'sambee-care-essentials',
       description = 'Everyday care supplies chosen by the SamBee Son and Daughter Home Care team in Assin Foso. Delivery across Assin Foso and the Central Region.'
 where slug = 'sambea-care-essentials';

update public.categories set name = 'Home essentials', slug = 'home-essentials', icon = 'home' where slug = 'home-bedroom';
update public.categories set name = 'Fashion & clothing', slug = 'fashion-clothing' where slug = 'clothing';
update public.categories set name = 'Gifts & more', slug = 'gifts-more' where slug = 'crafts-gifts';
insert into public.categories (name, slug, icon, sort) values
  ('Mobile accessories', 'mobile-accessories', 'smartphone', 9),
  ('Electronics', 'electronics', 'laptop', 10)
on conflict (slug) do nothing;

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (char_length(reference) between 4 and 40),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 160),
  phone text not null check (char_length(phone) between 6 and 30),
  role text not null check (char_length(role) <= 80),
  area text not null default 'Assin Foso' check (char_length(area) <= 80),
  availability text not null default '' check (char_length(availability) <= 80),
  experience text not null default '' check (char_length(experience) <= 4000),
  cv_name text not null default '' check (char_length(cv_name) <= 200),
  stage text not null default 'new' check (stage in ('new', 'screening', 'interview', 'offer', 'hired', 'declined')),
  notes text not null default '' check (char_length(notes) <= 4000),
  created_at timestamptz not null default now()
);
create index job_applications_created_idx on public.job_applications (created_at desc);
alter table public.job_applications enable row level security;
create policy "job_applications: anyone can apply" on public.job_applications for insert to anon, authenticated
  with check (stage = 'new' and notes = '');
create policy "job_applications: admin read" on public.job_applications for select to authenticated using ((select private.is_admin()));
create policy "job_applications: admin update" on public.job_applications for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "job_applications: admin delete" on public.job_applications for delete to authenticated using ((select private.is_admin()));
grant insert on public.job_applications to anon;
grant select, insert, update, delete on public.job_applications to authenticated;

-- Admins can remove abusive reviews and manage care requests/categories already; allow deleting care requests too.
create policy "care_requests: admin delete" on public.care_requests for delete to authenticated using ((select private.is_admin()));
grant delete on public.care_requests to authenticated;
