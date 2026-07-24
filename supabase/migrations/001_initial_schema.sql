-- ============================================================
-- What2Watch — Supabase Database Schema
-- Run in the Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- Enable UUID extension (usually enabled by default)
create extension if not exists "uuid-ossp";

-- ── profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique,
  display_name text,
  avatar_url   text,
  bio          text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- ── movies ──────────────────────────────────────────────────
create table if not exists public.movies (
  id             integer primary key,            -- TMDb ID
  title          text not null,
  original_title text,
  overview       text,
  release_date   date,
  poster_path    text,
  backdrop_path  text,
  genre_ids      integer[],
  vote_average   numeric(4,2),
  vote_count     integer,
  popularity     numeric(10,3),
  runtime        integer,
  tagline        text,
  imdb_id        text,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

-- RLS: movies are public read, only service role can write
alter table public.movies enable row level security;
create policy "Movies are publicly readable." on public.movies
  for select using (true);

-- ── watchlist ────────────────────────────────────────────────
-- Postgres has no "create type if not exists"; guard with a DO block.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'watchlist_status') then
    create type watchlist_status as enum ('want_to_watch', 'watching', 'watched');
  end if;
end$$;

create table if not exists public.watchlist (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  movie_id   integer not null references public.movies(id) on delete cascade,
  status     watchlist_status default 'want_to_watch' not null,
  rating     smallint check (rating >= 1 and rating <= 10),
  notes      text,
  added_at   timestamptz default now() not null,
  watched_at timestamptz,
  unique (user_id, movie_id)
);

alter table public.watchlist enable row level security;
create policy "Users can view own watchlist." on public.watchlist
  for select using (auth.uid() = user_id);
create policy "Users can insert into own watchlist." on public.watchlist
  for insert with check (auth.uid() = user_id);
create policy "Users can update own watchlist entries." on public.watchlist
  for update using (auth.uid() = user_id);
create policy "Users can delete own watchlist entries." on public.watchlist
  for delete using (auth.uid() = user_id);

-- ── user_preferences ─────────────────────────────────────────
create table if not exists public.user_preferences (
  user_id              uuid primary key references public.profiles(id) on delete cascade,
  favourite_genre_ids  integer[],
  preferred_languages  text[],
  min_rating           numeric(4,2),
  max_runtime_mins     integer,
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null
);

alter table public.user_preferences enable row level security;
create policy "Users can view own preferences." on public.user_preferences
  for select using (auth.uid() = user_id);
create policy "Users can insert own preferences." on public.user_preferences
  for insert with check (auth.uid() = user_id);
create policy "Users can update own preferences." on public.user_preferences
  for update using (auth.uid() = user_id);

-- ── guillaume_conversations ───────────────────────────────────
create table if not exists public.guillaume_conversations (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete set null,
  messages   jsonb not null default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.guillaume_conversations enable row level security;
create policy "Users can view own conversations." on public.guillaume_conversations
  for select using (auth.uid() = user_id or user_id is null);
create policy "Users can insert conversations." on public.guillaume_conversations
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users can update own conversations." on public.guillaume_conversations
  for update using (auth.uid() = user_id);

-- ── updated_at trigger ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_movies_updated_at before update on public.movies
  for each row execute procedure public.set_updated_at();
create trigger set_watchlist_updated_at before update on public.watchlist
  for each row execute procedure public.set_updated_at();
create trigger set_user_prefs_updated_at before update on public.user_preferences
  for each row execute procedure public.set_updated_at();
create trigger set_convo_updated_at before update on public.guillaume_conversations
  for each row execute procedure public.set_updated_at();
