// src/services/library.ts
// Server-side reads for a user's library (watchlist, favorites, history).
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type MovieRow = Database["public"]["Tables"]["movies"]["Row"];
export type WatchlistRow = Database["public"]["Tables"]["watchlist"]["Row"];

export interface WatchlistEntry extends WatchlistRow {
  movie: MovieRow;
}
export interface FavoriteEntry {
  id: string;
  added_at: string;
  movie: MovieRow;
}
export interface HistoryEntry {
  id: string;
  reason: string | null;
  source: string;
  created_at: string;
  movie: MovieRow;
}

export async function getWatchlist(userId: string): Promise<WatchlistEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist")
    .select("*, movie:movies(*)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  return (data as WatchlistEntry[] | null)?.filter((e) => e.movie) ?? [];
}

export async function getFavorites(userId: string): Promise<FavoriteEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("id, added_at, movie:movies(*)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  return (data as unknown as FavoriteEntry[] | null)?.filter((e) => e.movie) ?? [];
}

export async function getRecommendationHistory(userId: string): Promise<HistoryEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recommendation_history")
    .select("id, reason, source, created_at, movie:movies(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(60);
  return (data as unknown as HistoryEntry[] | null)?.filter((e) => e.movie) ?? [];
}

/** Which of the given movie ids are already in the user's watchlist / favorites. */
export async function getLibraryState(
  userId: string,
  movieId: number
): Promise<{ inWatchlist: boolean; inFavorites: boolean }> {
  const supabase = await createClient();
  const [{ data: w }, { data: f }] = await Promise.all([
    supabase.from("watchlist").select("id").eq("user_id", userId).eq("movie_id", movieId).maybeSingle(),
    supabase.from("favorites").select("id").eq("user_id", userId).eq("movie_id", movieId).maybeSingle(),
  ]);
  return { inWatchlist: !!w, inFavorites: !!f };
}
