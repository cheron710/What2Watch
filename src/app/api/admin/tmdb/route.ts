// src/app/api/admin/tmdb/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchMovies, getMovieDetail, tmdbImageUrl, pickTrailer } from "@/lib/tmdb/client";
import { saveMovie } from "@/services/adminService";
import { createClient } from "@/lib/supabase/server";

// Verify admin permission for API routes
async function isAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return profile?.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const query = searchParams.get("query") || "";

  if (action === "search") {
    try {
      const res = await searchMovies(query);
      return NextResponse.json(res.results || []);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const idStr = searchParams.get("id");

  if (action === "import" && idStr) {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });

    try {
      const details = await getMovieDetail(id);
      const trailerVideo = details.videos?.results ? pickTrailer(details.videos.results) : null;
      const trailerUrl = trailerVideo ? `https://www.youtube.com/watch?v=${trailerVideo.key}` : "";
      
      const providers = details["watch/providers"]?.results?.US?.flatrate?.map(p => ({
        name: p.provider_name,
        price: "Subscription"
      })) || [];

      // Create movies row payload
      const movieRecord = {
        id: details.id,
        title: details.title,
        original_title: details.original_title,
        overview: details.overview,
        release_date: details.release_date || null,
        poster_path: details.poster_path ? tmdbImageUrl(details.poster_path) : null,
        backdrop_path: details.backdrop_path ? tmdbImageUrl(details.backdrop_path) : null,
        genre_ids: details.genres ? details.genres.map((g: any) => g.id) : [],
        vote_average: details.vote_average || 0.0,
        vote_count: details.vote_count || 0,
        popularity: details.popularity || 0.0,
        runtime: details.runtime || null,
        tagline: details.tagline || null,
        imdb_id: details.imdb_id || null,
        custom_editorial_description: "",
        emotional_tags: [],
        context_tags: [],
        craft_tags: [],
        festival_tags: [],
        is_featured: false,
        is_homepage_hero: false,
        visibility: "visible",
        status: "published",
        trailer_url: trailerUrl,
        streaming_providers: providers,
        recommendation_score: 50
      };

      const saved = await saveMovie(movieRecord);
      return NextResponse.json(saved);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
