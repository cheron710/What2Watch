import { NextRequest, NextResponse } from "next/server";
import { discover, tmdbImageUrl } from "@/lib/tmdb/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const category = searchParams.get("category") || "all";

  try {
    let genreStr = "10751,16"; // Family, Animation
    if (category === "adventure") genreStr = "10751,12";
    if (category === "comedy") genreStr = "10751,35";
    if (category === "fantasy") genreStr = "10751,14";

    const data = await discover({
      with_genres: genreStr,
      sort_by: "popularity.desc",
      page,
      "vote_count.gte": 80,
      include_adult: 0,
    });

    if (!data || !data.results) {
      return NextResponse.json({ results: [] });
    }

    const movies = data.results.map((m: any) => ({
      id: m.id,
      title: m.title,
      year: m.release_date ? parseInt(m.release_date.split("-")[0], 10) : 2024,
      director: "Pixar / Disney / Animation",
      tagline: m.overview ? (m.overview.length > 110 ? m.overview.slice(0, 107) + "..." : m.overview) : "A magical adventure for the whole family.",
      tag: m.genre_ids?.includes(16) ? "Animation" : "Family",
      tagColor: m.genre_ids?.includes(16) ? "#B57BF7" : "#5BB8F5",
      age: "All Ages",
      poster: m.poster_path ? tmdbImageUrl(m.poster_path, "w500") : null,
      rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : null,
    }));

    return NextResponse.json({ results: movies, total_pages: data.total_pages || 1 });
  } catch (error: any) {
    console.error("Error in kids API route:", error);
    return NextResponse.json({ results: [], error: error.message }, { status: 500 });
  }
}
