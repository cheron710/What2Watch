-- ============================================================
-- What2Watch — Migration 002
-- Favorites, recommendation history, and performance indexes.
-- Run after 001_initial_schema.sql.
-- ============================================================

-- ── favorites ────────────────────────────────────────────────
create table if not exists public.favorites (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  movie_id  integer not null references public.movies(id) on delete cascade,
  added_at  timestamptz default now() not null,
  unique (user_id, movie_id)
);

alter table public.favorites enable row level security;

drop policy if exists "Users can view own favorites." on public.favorites;
create policy "Users can view own favorites." on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites." on public.favorites;
create policy "Users can insert own favorites." on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites." on public.favorites;
create policy "Users can delete own favorites." on public.favorites
  for delete using (auth.uid() = user_id);

-- ── recommendation_history ───────────────────────────────────
-- One row per film surfaced to a user, with the reason it was recommended.
create table if not exists public.recommendation_history (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  movie_id     integer not null references public.movies(id) on delete cascade,
  source       text not null default 'engine',   -- 'engine' | 'guillaume' | 'seed'
  reason       text,
  score        numeric(6,4),
  created_at   timestamptz default now() not null
);

alter table public.recommendation_history enable row level security;

drop policy if exists "Users can view own recommendation history." on public.recommendation_history;
create policy "Users can view own recommendation history." on public.recommendation_history
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own recommendation history." on public.recommendation_history;
create policy "Users can insert own recommendation history." on public.recommendation_history
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own recommendation history." on public.recommendation_history;
create policy "Users can delete own recommendation history." on public.recommendation_history
  for delete using (auth.uid() = user_id);

-- ── movies: allow authenticated users to cache TMDb rows ──────
-- Users need to write the movie row that backs a watchlist/favorite entry.
drop policy if exists "Authenticated users can cache movies." on public.movies;
create policy "Authenticated users can cache movies." on public.movies
  for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update cached movies." on public.movies;
create policy "Authenticated users can update cached movies." on public.movies
  for update to authenticated using (true) with check (true);

-- ── indexes ──────────────────────────────────────────────────
create index if not exists idx_watchlist_user on public.watchlist (user_id);
create index if not exists idx_watchlist_movie on public.watchlist (movie_id);
create index if not exists idx_favorites_user on public.favorites (user_id);
create index if not exists idx_favorites_movie on public.favorites (movie_id);
create index if not exists idx_rec_history_user on public.recommendation_history (user_id, created_at desc);
create index if not exists idx_movies_popularity on public.movies (popularity desc);
