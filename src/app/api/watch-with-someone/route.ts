import { NextRequest, NextResponse } from "next/server";
import { discover, tmdbImageUrl } from "@/lib/tmdb/client";

// Define genre mapping per season and companion
const GENRE_MAP: Record<string, Record<string, string>> = {
  winter: {
    "date-night": "10749,35",       // Romance, Comedy
    "family-movie": "10751,16,14",   // Family, Animation, Fantasy
    "friends-gathering": "35,28",    // Comedy, Action
    "solo-viewing": "18,10749",      // Drama, Romance
  },
  fall: {
    "date-night": "9648,10749,27",   // Mystery, Romance, Horror
    "family-movie": "10751,14,16",   // Family, Fantasy, Animation
    "friends-gathering": "27,35,53", // Horror, Comedy, Thriller
    "solo-viewing": "27,9648,18",    // Horror, Mystery, Drama
  },
  summer: {
    "date-night": "10749,35",        // Romance, Comedy
    "family-movie": "12,10751,16",   // Adventure, Family, Animation
    "friends-gathering": "28,35,12", // Action, Comedy, Adventure
    "solo-viewing": "18,12,878",     // Drama, Adventure, Sci-Fi
  },
  spring: {
    "date-night": "10749,18",        // Romance, Drama
    "family-movie": "10751,16",      // Family, Animation
    "friends-gathering": "35,18",     // Comedy, Drama
    "solo-viewing": "18,14,9648",    // Drama, Fantasy, Mystery
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season") || "winter";
  const withKey = searchParams.get("with") || "date-night";
  const page = Math.max(1, Math.min(50, parseInt(searchParams.get("page") || "1", 10)));

  try {
    const with_genres = GENRE_MAP[season]?.[withKey] || "35,18";

    // Build params for TMDB discover
    const params: Record<string, string | number> = {
      with_genres,
      sort_by: "popularity.desc",
      page,
      "vote_count.gte": 40,
      include_adult: 0,
    };

    let data;
    try {
      data = await discover(params);
    } catch (e) {
      console.warn("TMDB discover failed in watch-with-someone API:", e);
    }

    if (!data || !data.results || data.results.length === 0) {
      return NextResponse.json({ results: [], total_pages: 50, page });
    }

    const movies = data.results.map((m: any) => ({
      id: m.id,
      t: m.title,
      y: m.release_date ? parseInt(m.release_date.split("-")[0], 10) : 2024,
      tags: [withKey],
      note: m.overview ? (m.overview.length > 130 ? m.overview.slice(0, 127) + "..." : m.overview) : "Recommended for this occasion.",
      poster: m.poster_path ? tmdbImageUrl(m.poster_path, "w500") : null,
    }));

    const total_pages = Math.max(50, Math.min(50, data.total_pages || 50));

    return NextResponse.json({
      results: movies,
      total_pages,
      page,
    });
  } catch (error: any) {
    console.error("WatchWithSomeone API error:", error);
    return NextResponse.json({ results: [], total_pages: 50, page, error: error.message }, { status: 500 });
  }
}
