create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  grade smallint not null check (grade between 9 and 12),
  subject text not null,
  title text not null,
  content text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes
  add column if not exists pdf_path text;

create table if not exists public.subjects (
  grade smallint not null check (grade between 9 and 12),
  id text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (grade, id),
  unique (grade, name)
);

insert into public.subjects (grade, id, name) values
  (9, 'computer-fundamentals', 'Computer Fundamentals'),
  (9, 'operating-system', 'Operating System'),
  (9, 'office-applications', 'Office Applications'),
  (9, 'internet-and-email', 'Internet and Email'),
  (9, 'computer-security', 'Computer Security'),
  (10, 'computer-system', 'Computer System'),
  (10, 'number-system-and-logic', 'Number System and Boolean Logic'),
  (10, 'programming', 'Programming'),
  (10, 'web-technology', 'Web Technology'),
  (10, 'database', 'Database'),
  (10, 'cybersecurity', 'Cybersecurity and Digital Citizenship'),
  (11, 'computer-system-and-architecture', 'Computer System and Architecture'),
  (11, 'software-and-programming', 'Software and Programming'),
  (11, 'web-technology', 'Web Technology'),
  (11, 'multimedia', 'Multimedia'),
  (11, 'information-security', 'Information Security'),
  (12, 'database-management', 'Database Management System'),
  (12, 'data-structures-and-algorithms', 'Data Structures and Algorithms'),
  (12, 'computer-network', 'Computer Network'),
  (12, 'software-engineering', 'Software Engineering'),
  (12, 'programming-in-c', 'Programming in C'),
  (12, 'object-oriented-programming', 'Object-Oriented Programming')
on conflict (grade, id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'notes_grade_subject_fkey'
      and conrelid = 'public.notes'::regclass
  ) then
    alter table public.notes
      add constraint notes_grade_subject_fkey
      foreign key (grade, subject)
      references public.subjects (grade, id)
      on update cascade
      on delete restrict;
  end if;
end;
$$;

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null default current_date,
  excerpt text not null,
  tag text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blogs
  add column if not exists image_path text;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tech text not null,
  description text not null,
  github_url text,
  live_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects
  add column if not exists image_path text,
  add column if not exists video_path text;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

drop trigger if exists blogs_set_updated_at on public.blogs;
create trigger blogs_set_updated_at
  before update on public.blogs
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists subjects_set_updated_at on public.subjects;
create trigger subjects_set_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
revoke all on public.admin_users from anon, authenticated;

grant select on public.notes, public.blogs, public.projects to anon, authenticated;
grant insert, update, delete on public.notes, public.blogs, public.projects to authenticated;
grant select on public.subjects to anon, authenticated;
grant insert, update, delete on public.subjects to authenticated;

alter table public.notes enable row level security;
alter table public.blogs enable row level security;
alter table public.projects enable row level security;
alter table public.subjects enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public can read subjects" on public.subjects;
create policy "Public can read subjects"
  on public.subjects for select to anon, authenticated
  using (true);
drop policy if exists "Admins can insert subjects" on public.subjects;
create policy "Admins can insert subjects"
  on public.subjects for insert to authenticated
  with check (public.is_admin());
drop policy if exists "Admins can update subjects" on public.subjects;
create policy "Admins can update subjects"
  on public.subjects for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete subjects" on public.subjects;
create policy "Admins can delete subjects"
  on public.subjects for delete to authenticated
  using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-note-pdfs', 'portfolio-note-pdfs', false, 20971520, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = 20971520,
    allowed_mime_types = array['application/pdf'];

drop policy if exists "Public can read published note PDFs" on storage.objects;
create policy "Public can read published note PDFs"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'portfolio-note-pdfs'
    and (
      public.is_admin()
      or exists (
        select 1 from public.notes
        where notes.pdf_path = storage.objects.name
          and notes.published
      )
    )
  );
drop policy if exists "Admins can upload note PDFs" on storage.objects;
create policy "Admins can upload note PDFs"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-note-pdfs' and public.is_admin());
drop policy if exists "Admins can update note PDFs" on storage.objects;
create policy "Admins can update note PDFs"
  on storage.objects for update to authenticated
  using (bucket_id = 'portfolio-note-pdfs' and public.is_admin())
  with check (bucket_id = 'portfolio-note-pdfs' and public.is_admin());
drop policy if exists "Admins can delete note PDFs" on storage.objects;
create policy "Admins can delete note PDFs"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-note-pdfs' and public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do update
set public = false,
    file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

drop policy if exists "Public can read published portfolio media" on storage.objects;
create policy "Public can read published portfolio media"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'portfolio-media'
    and (
      public.is_admin()
      or exists (
        select 1 from public.blogs
        where blogs.image_path = storage.objects.name
          and blogs.published
      )
      or exists (
        select 1 from public.projects
        where (projects.image_path = storage.objects.name or projects.video_path = storage.objects.name)
          and projects.published
      )
    )
  );
drop policy if exists "Admins can upload portfolio media" on storage.objects;
create policy "Admins can upload portfolio media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin());
drop policy if exists "Admins can update portfolio media" on storage.objects;
create policy "Admins can update portfolio media"
  on storage.objects for update to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin())
  with check (bucket_id = 'portfolio-media' and public.is_admin());
drop policy if exists "Admins can delete portfolio media" on storage.objects;
create policy "Admins can delete portfolio media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

drop policy if exists "Public can read published notes" on public.notes;
create policy "Public can read published notes"
  on public.notes for select to anon, authenticated
  using (published or public.is_admin());
drop policy if exists "Admins can insert notes" on public.notes;
create policy "Admins can insert notes"
  on public.notes for insert to authenticated
  with check (public.is_admin());
drop policy if exists "Admins can update notes" on public.notes;
create policy "Admins can update notes"
  on public.notes for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete notes" on public.notes;
create policy "Admins can delete notes"
  on public.notes for delete to authenticated
  using (public.is_admin());

drop policy if exists "Public can read published blogs" on public.blogs;
create policy "Public can read published blogs"
  on public.blogs for select to anon, authenticated
  using (published or public.is_admin());
drop policy if exists "Admins can insert blogs" on public.blogs;
create policy "Admins can insert blogs"
  on public.blogs for insert to authenticated
  with check (public.is_admin());
drop policy if exists "Admins can update blogs" on public.blogs;
create policy "Admins can update blogs"
  on public.blogs for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete blogs" on public.blogs;
create policy "Admins can delete blogs"
  on public.blogs for delete to authenticated
  using (public.is_admin());

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
  on public.projects for select to anon, authenticated
  using (published or public.is_admin());
drop policy if exists "Admins can insert projects" on public.projects;
create policy "Admins can insert projects"
  on public.projects for insert to authenticated
  with check (public.is_admin());
drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
  on public.projects for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects"
  on public.projects for delete to authenticated
  using (public.is_admin());

insert into public.blogs (title, date, excerpt, tag)
select
  'Pagal Basti: Exploring Love, Ego, and Existential Madness',
  '2026-07-21',
  'Set against the scenic backdrops of Pokhara and the remote Himalayan village of Ghandruk, the narrative begins through the eyes of a curious journalist drawn to tales of an isolated, unconventional community. Sarubhakta uses an experimental storytelling structure: starting as a first-person journalistic account of a mysterious haven, the story gradually shifts into a deep, third-person psychological character study that breaks standard literary conventions.',
  'Review of novel pagal-Basti'
where not exists (
  select 1 from public.blogs where title = 'Pagal Basti: Exploring Love, Ego, and Existential Madness'
);

insert into public.blogs (title, date, excerpt, tag)
select
  'Building REST APIs with Node.js',
  '2026-02-28',
  'Step-by-step walkthrough of creating scalable RESTful APIs using Express.js and PostgreSQL.',
  'Backend'
where not exists (select 1 from public.blogs where title = 'Building REST APIs with Node.js');

insert into public.blogs (title, date, excerpt, tag)
select
  'My Journey into IoT with Arduino',
  '2026-01-10',
  'How I built my first IoT project — a smart sensor dashboard connected to the cloud.',
  'IoT'
where not exists (select 1 from public.blogs where title = 'My Journey into IoT with Arduino');

insert into public.projects (title, tech, description)
select
  'MACHINE LEARNING BASED EVENTS PARTICIPANTS PRESENCE PREDICTION SYSTEM WITH FACIAL ATTENDANCE',
  'Python,Fullstack',
  'ML based events participants presence prediction system with facial attendence where admin can view attendance of participants and also predict the participants if he/she comes or not on events.'
where not exists (
  select 1 from public.projects where title = 'MACHINE LEARNING BASED EVENTS PARTICIPANTS PRESENCE PREDICTION SYSTEM WITH FACIAL ATTENDANCE'
);

insert into public.projects (title, tech, description)
select
  'E-Commerce Platform',
  'Full-stack (MERN)',
  'Full-stack web application with payment integration, inventory management, and analytics dashboard. such as e-learning,ecommerce'
where not exists (select 1 from public.projects where title = 'E-Commerce Platform');

insert into public.projects (title, tech, description)
select
  'Portfolio & Blog CMS',
  'Next.js · Tailwind · Supabase',
  'Custom content management system with markdown support, SEO optimization, and dynamic theming.'
where not exists (select 1 from public.projects where title = 'Portfolio & Blog CMS');

insert into public.projects (title, tech, description)
select
  'IoT Smart Dashboard',
  'React · MQTT · Arduino',
  'Web dashboard for monitoring IoT sensor data in real-time with alerts and data visualization.'
where not exists (select 1 from public.projects where title = 'IoT Smart Dashboard');

-- After creating your user in Supabase Auth, grant admin access with:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'your-admin-email@example.com'
-- on conflict (user_id) do nothing;

notify pgrst, 'reload schema';
