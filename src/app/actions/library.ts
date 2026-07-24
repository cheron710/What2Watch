"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type MovieInsert = Database["public"]["Tables"]["movies"]["Insert"];

// A movie must exist in `public.movies` before it can be referenced by the
// watchlist / favorites foreign keys. The client sends the minimal TMDb fields.
const MovieSeed = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  vote_average: z.number().nullable().optional(),
  genre_ids: z.array(z.number()).nullable().optional(),
});
export type MovieSeedInput = z.infer<typeof MovieSeed>;

interface ActionResult {
  ok: boolean;
  error?: string;
  active?: boolean;
}

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

/** Ensure the TMDb movie is cached locally so FKs resolve. */
async function ensureMovieCached(
  supabase: Awaited<ReturnType<typeof createClient>>,
  seed: MovieSeedInput
) {
  const row: MovieInsert = {
    id: seed.id,
    title: seed.title,
    poster_path: seed.poster_path ?? null,
    backdrop_path: seed.backdrop_path ?? null,
    release_date: seed.release_date || null,
    overview: seed.overview ?? null,
    vote_average: seed.vote_average ?? null,
    genre_ids: seed.genre_ids ?? null,
  };
  await supabase.from("movies").upsert(row, { onConflict: "id" });
}

export async function toggleWatchlist(seedRaw: MovieSeedInput): Promise<ActionResult> {
  const seed = MovieSeed.safeParse(seedRaw);
  if (!seed.success) return { ok: false, error: "Invalid movie data." };

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "Please sign in to save films." };

  const { data: existing } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", userId)
    .eq("movie_id", seed.data.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("watchlist").delete().eq("id", existing.id);
    revalidatePath("/watchlist");
    return { ok: true, active: false };
  }

  await ensureMovieCached(supabase, seed.data);
  const { error } = await supabase
    .from("watchlist")
    .insert({ user_id: userId, movie_id: seed.data.id });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
  return { ok: true, active: true };
}

export async function toggleFavorite(seedRaw: MovieSeedInput): Promise<ActionResult> {
  const seed = MovieSeed.safeParse(seedRaw);
  if (!seed.success) return { ok: false, error: "Invalid movie data." };

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "Please sign in to save films." };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("movie_id", seed.data.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    revalidatePath("/favorites");
    return { ok: true, active: false };
  }

  await ensureMovieCached(supabase, seed.data);
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, movie_id: seed.data.id });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/favorites");
  revalidatePath("/dashboard");
  return { ok: true, active: true };
}

const StatusSchema = z.enum(["want_to_watch", "watching", "watched"]);

export async function updateWatchlistStatus(
  movieId: number,
  status: z.infer<typeof StatusSchema>
): Promise<ActionResult> {
  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid status." };

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "Please sign in." };

  const patch =
    parsed.data === "watched"
      ? { status: parsed.data, watched_at: new Date().toISOString() }
      : { status: parsed.data, watched_at: null };

  const { error } = await supabase
    .from("watchlist")
    .update(patch)
    .eq("user_id", userId)
    .eq("movie_id", movieId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/watchlist");
  return { ok: true };
}

export async function removeFromWatchlist(movieId: number): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "Please sign in." };
  await supabase.from("watchlist").delete().eq("user_id", userId).eq("movie_id", movieId);
  revalidatePath("/watchlist");
  return { ok: true };
}

export async function removeFromFavorites(movieId: number): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "Please sign in." };
  await supabase.from("favorites").delete().eq("user_id", userId).eq("movie_id", movieId);
  revalidatePath("/favorites");
  return { ok: true };
}
