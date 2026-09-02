import { NextResponse } from "next/server";
import { searchMovies, tmdbImageUrl } from "@/lib/tmdb/client";
import { getMoviesDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  if (query.length < 2) {
    return NextResponse.json({ results: [], total_results: 0, total_pages: 0 });
  }

  try {
    let data = null;
    let fallback = false;
    try {
      data = await searchMovies(query, page);
    } catch (e) {
      console.warn("TMDb API search failed, falling back to local DB:", e);
      fallback = true;
    }

    const allMovies = await getMoviesDb();
    let results: any[] = [];

    if (!fallback && data && data.results && data.results.length > 0) {
      results = data.results
        .filter((m) => m.poster_path || m.release_date)
        .filter((m) => {
          const dbMovie = allMovies.find((dm) => dm.id === m.id);
          if (dbMovie) {
            return dbMovie.visibility !== "hidden" && dbMovie.status !== "draft";
          }
          return true;
        })
        .slice(0, 12)
        .map((m) => ({
          id: m.id,
          title: m.title,
          year: m.release_date ? m.release_date.slice(0, 4) : "",
          poster: tmdbImageUrl(m.poster_path, "w185"),
          rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : null,
        }));
    } else {
      fallback = true;
    }

    if (fallback) {
      const queryLower = query.toLowerCase();
      const matched = allMovies.filter((m) => {
        const titleMatch = m.title?.toLowerCase().includes(queryLower);
        const originalTitleMatch = m.original_title?.toLowerCase().includes(queryLower);
        const overviewMatch = m.overview?.toLowerCase().includes(queryLower);
        const visible = m.visibility !== "hidden" && m.status !== "draft";
        return (titleMatch || originalTitleMatch || overviewMatch) && visible;
      });

      results = matched.slice((page - 1) * 12, page * 12).map((m) => ({
        id: m.id,
        title: m.title,
        year: m.release_date ? m.release_date.slice(0, 4) : "",
        poster: m.poster_path ? (m.poster_path.startsWith("http") ? m.poster_path : tmdbImageUrl(m.poster_path, "w185")) : "/placeholder-poster.svg",
        rating: m.vote_average ? Number(Number(m.vote_average).toFixed(1)) : null,
      }));
    }

    return NextResponse.json({
      results,
      total_results: fallback ? results.length : data?.total_results ?? 0,
      total_pages: fallback ? Math.ceil(results.length / 12) : data?.total_pages ?? 0,
    });
  } catch (e: any) {
    console.error("Error in search API route:", e);
    return NextResponse.json(
      { results: [], error: "Search is temporarily unavailable." },
      { status: 502 }
    );
  }
}
