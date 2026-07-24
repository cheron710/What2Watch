// src/app/api/search/route.ts
// Movie search proxy — keeps the TMDb key server-side and shapes a light
// response for the header search overlay and the /search page.
import { NextResponse } from "next/server";
import { searchMovies, tmdbImageUrl } from "@/lib/tmdb/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  if (query.length < 2) {
    return NextResponse.json({ results: [], total_results: 0, total_pages: 0 });
  }

  try {
    const data = await searchMovies(query, page);
    const results = data.results
      .filter((m) => m.poster_path || m.release_date)
      .slice(0, 12)
      .map((m) => ({
        id: m.id,
        title: m.title,
        year: m.release_date ? m.release_date.slice(0, 4) : "",
        poster: tmdbImageUrl(m.poster_path, "w185"),
        rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : null,
      }));

    return NextResponse.json({
      results,
      total_results: data.total_results,
      total_pages: data.total_pages,
    });
  } catch {
    return NextResponse.json(
      { results: [], error: "Search is temporarily unavailable." },
      { status: 502 }
    );
  }
}
