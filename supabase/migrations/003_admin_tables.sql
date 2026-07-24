-- ============================================================
-- What2Watch — Migration 003
-- Admin Panel Tables and Curation Schema Extensions
-- ============================================================

-- ── 1. Extend profiles and handle_new_user ────────────────
alter table public.profiles add column if not exists role text default 'user';

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

-- ── 2. Extend movies table ───────────────────────────────
alter table public.movies 
  add column if not exists custom_editorial_description text,
  add column if not exists emotional_tags text[] default '{}'::text[],
  add column if not exists context_tags text[] default '{}'::text[],
  add column if not exists craft_tags text[] default '{}'::text[],
  add column if not exists festival_tags text[] default '{}'::text[],
  add column if not exists is_featured boolean default false,
  add column if not exists is_homepage_hero boolean default false,
  add column if not exists visibility text default 'visible' check (visibility in ('visible', 'hidden')),
  add column if not exists status text default 'published' check (status in ('published', 'draft')),
  add column if not exists trailer_url text,
  add column if not exists streaming_providers jsonb default '[]'::jsonb,
  add column if not exists recommendation_score integer default 50;

-- ── 3. Create Settings Table ─────────────────────────────
create table if not exists public.system_settings (
  id text primary key default 'global',
  site_name text not null default 'What2Watch',
  logo_url text,
  favicon_url text,
  homepage_hero_title text,
  homepage_hero_subtitle text,
  footer_text text,
  social_links jsonb default '{}'::jsonb,
  tmdb_key text,
  claude_key text,
  openai_key text,
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_pass text,
  maintenance_mode boolean default false,
  email_settings jsonb default '{}'::jsonb,
  cache_settings jsonb default '{}'::jsonb,
  updated_at timestamptz default now() not null
);

-- RLS: system_settings public read, only admin write
alter table public.system_settings enable row level security;
create policy "System settings are publicly readable." on public.system_settings
  for select using (true);

-- ── 4. Create Staff Picks Tables ──────────────────────────
create table if not exists public.staff_pick_collections (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  featured_banner_url text,
  is_published boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.staff_pick_movies (
  collection_id uuid references public.staff_pick_collections(id) on delete cascade,
  movie_id integer references public.movies(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, movie_id)
);

alter table public.staff_pick_collections enable row level security;
alter table public.staff_pick_movies enable row level security;

create policy "Staff pick collections are viewable by everyone." on public.staff_pick_collections for select using (true);
create policy "Staff pick movies are viewable by everyone." on public.staff_pick_movies for select using (true);

-- ── 5. Create Festival Season Tables ──────────────────────
create table if not exists public.festival_collections (
  id uuid primary key default uuid_generate_v4(),
  festival_name text not null check (festival_name in ('Cannes', 'Venice', 'Berlin', 'Oscars', 'Toronto', 'Sundance')),
  year integer not null,
  title text not null,
  description text,
  is_published boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.festival_movies (
  collection_id uuid references public.festival_collections(id) on delete cascade,
  movie_id integer references public.movies(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, movie_id)
);

alter table public.festival_collections enable row level security;
alter table public.festival_movies enable row level security;

create policy "Festival collections are viewable by everyone." on public.festival_collections for select using (true);
create policy "Festival movies are viewable by everyone." on public.festival_movies for select using (true);

-- ── 6. Create Watch With Someone Tables ────────────────────
create table if not exists public.watch_with_someone_categories (
  id uuid primary key default uuid_generate_v4(),
  season text not null check (season in ('Spring', 'Summer', 'Autumn', 'Winter')),
  name text not null check (name in ('Partner', 'Family', 'Friends', 'Children', 'Parents', 'Alone', 'Date Night', 'Groups')),
  description text,
  featured_movie_id integer references public.movies(id) on delete set null,
  is_published boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.watch_with_someone_movies (
  category_id uuid references public.watch_with_someone_categories(id) on delete cascade,
  movie_id integer references public.movies(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (category_id, movie_id)
);

alter table public.watch_with_someone_categories enable row level security;
alter table public.watch_with_someone_movies enable row level security;

create policy "Watch categories are viewable by everyone." on public.watch_with_someone_categories for select using (true);
create policy "Watch movies are viewable by everyone." on public.watch_with_someone_movies for select using (true);

-- ── 7. Create Cinema by Experience Tables ─────────────────
create table if not exists public.cinema_experience_categories (
  id uuid primary key default uuid_generate_v4(),
  experience_type text not null check (experience_type in ('Visual', 'Sound', 'Performance', 'Storytelling', 'World Building')),
  name text not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.cinema_experience_movies (
  category_id uuid references public.cinema_experience_categories(id) on delete cascade,
  movie_id integer references public.movies(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (category_id, movie_id)
);

alter table public.cinema_experience_categories enable row level security;
alter table public.cinema_experience_movies enable row level security;

create policy "Experience categories are viewable by everyone." on public.cinema_experience_categories for select using (true);
create policy "Experience movies are viewable by everyone." on public.cinema_experience_movies for select using (true);

-- ── 8. Create Kids Section Tables ──────────────────────────
create table if not exists public.kids_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null check (name in ('Toddlers', 'Kids', 'Pre-teens')),
  min_age integer not null,
  max_age integer not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.kids_movies (
  category_id uuid references public.kids_categories(id) on delete cascade,
  movie_id integer references public.movies(id) on delete cascade,
  safety_rating text,
  educational_tags text[] default '{}'::text[],
  family_tags text[] default '{}'::text[],
  sort_order integer not null default 0,
  primary key (category_id, movie_id)
);

alter table public.kids_categories enable row level security;
alter table public.kids_movies enable row level security;

create policy "Kids categories are viewable by everyone." on public.kids_categories for select using (true);
create policy "Kids movies are viewable by everyone." on public.kids_movies for select using (true);

-- ── 9. Create Emotional Spectrum Tables ───────────────────
create table if not exists public.emotions (
  id uuid primary key default uuid_generate_v4(),
  name text not null check (name in ('Joy', 'Fear', 'Hope', 'Grief', 'Healing', 'Loneliness', 'Wonder', 'Love', 'Nostalgia')),
  slug text unique not null,
  description text,
  featured_movie_id integer references public.movies(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.emotion_movies (
  emotion_id uuid references public.emotions(id) on delete cascade,
  movie_id integer references public.movies(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (emotion_id, movie_id)
);

alter table public.emotions enable row level security;
alter table public.emotion_movies enable row level security;

create policy "Emotions are viewable by everyone." on public.emotions for select using (true);
create policy "Emotion movies are viewable by everyone." on public.emotion_movies for select using (true);

-- ── 10. Create Activity and AI Logs Tables ────────────────
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  action_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

create table if not exists public.ai_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  prompt text not null,
  response text,
  model text,
  tokens_used integer,
  temperature numeric(3,2),
  status text not null,
  error_message text,
  created_at timestamptz default now() not null
);

alter table public.activity_logs enable row level security;
alter table public.ai_logs enable row level security;

-- Only admins can select logs
create policy "Admins can view activity logs." on public.activity_logs
  for select using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can view AI logs." on public.ai_logs
  for select using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Allow public insert of activity logs for telemetry (authenticated or anonymous)
create policy "Anyone can insert activity logs." on public.activity_logs
  for insert with check (true);

create policy "Anyone can insert AI logs." on public.ai_logs
  for insert with check (true);

-- ── 11. Triggers for updated_at ─────────────────────────
create trigger set_system_settings_updated_at before update on public.system_settings
  for each row execute procedure public.set_updated_at();

create trigger set_staff_pick_collections_updated_at before update on public.staff_pick_collections
  for each row execute procedure public.set_updated_at();

create trigger set_festival_collections_updated_at before update on public.festival_collections
  for each row execute procedure public.set_updated_at();

create trigger set_watch_categories_updated_at before update on public.watch_with_someone_categories
  for each row execute procedure public.set_updated_at();

create trigger set_experience_categories_updated_at before update on public.cinema_experience_categories
  for each row execute procedure public.set_updated_at();

create trigger set_kids_categories_updated_at before update on public.kids_categories
  for each row execute procedure public.set_updated_at();

create trigger set_emotions_updated_at before update on public.emotions
  for each row execute procedure public.set_updated_at();
