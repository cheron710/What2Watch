import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { withSupabaseTimeout } from "@/lib/supabase/resilient";
import fs from "fs";
import path from "path";

// No hardcoded movies — all movies are imported from TMDB API via the Admin panel
export const MOCK_MOVIES: any[] = [];

const MOCK_DB_PATH = path.join(process.cwd(), "src/services/mockDb.json");

function getLocalMovies(): any[] {
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      const db = JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf8"));
      if (db.movies && Array.isArray(db.movies)) {
        return db.movies;
      }
    }
  } catch (e) {
    console.warn("Read mock database error in getMoviesDb:", e);
  }
  return MOCK_MOVIES;
}

export async function getMoviesDb(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return getLocalMovies();
  }

  return withSupabaseTimeout(
    async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("popularity", { ascending: false });
      if (error) throw error;

      const merged = [...(data || [])];
      const localList = getLocalMovies();
      localList.forEach((mock: any) => {
        if (!merged.some((m) => m.id === mock.id)) {
          merged.push(mock);
        }
      });
      return merged;
    },
    () => getLocalMovies()
  );
}
