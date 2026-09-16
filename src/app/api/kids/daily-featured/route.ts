import { NextRequest, NextResponse } from "next/server";
import { getKidsSpotlight } from "@/services/adminService";
import { getMovieDetail, tmdbImageUrl } from "@/lib/tmdb/client";

export const revalidate = 0; // Don't cache stale lists — return instant Admin updates!

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Get Admin-managed Spotlight Kids Movies list (or default fallback)
    const spotlightMovieIds = await getKidsSpotlight();
    if (!spotlightMovieIds || spotlightMovieIds.length === 0) {
      return NextResponse.json({ todayIndex: 0, todayDate: "", items: [] });
    }

    const dailyIndex = dayOfYear % spotlightMovieIds.length;

    // Fetch full live metadata from TMDB for ALL movies in the spotlight list
    const featuredItems = await Promise.all(
      spotlightMovieIds.map(async (mid: number, idx: number) => {
        try {
          const detail = await getMovieDetail(mid);
          const year = detail.release_date ? detail.release_date.split("-")[0] : "";
          const genresStr = detail.genres?.map((g) => g.name).join(" · ") || "Animation · Family";

          return {
            id: detail.id,
            title: detail.title,
            year,
            rating: detail.vote_average ? Number(detail.vote_average.toFixed(1)) : 8.0,
            voteCount: detail.vote_count || 0,
            runtime: detail.runtime ? `${detail.runtime} mins` : "",
            overview: detail.overview || "A delightful, famous movie for kids and families.",
            tagline: detail.tagline || (detail.overview?.slice(0, 100) ? `"${detail.overview.slice(0, 100)}..."` : "Family favorite"),
            genres: genresStr,
            posterPath: detail.poster_path ? tmdbImageUrl(detail.poster_path, "w500") : null,
            backdropPath: detail.backdrop_path ? tmdbImageUrl(detail.backdrop_path, "w1280") : null,
            age: "All Ages",
            highlight: detail.tagline || detail.overview?.slice(0, 110) || "A famous animated masterpiece from TMDB",
            isToday: idx === dailyIndex,
          };
        } catch (e) {
          return {
            id: mid,
            title: `TMDB Movie ${mid}`,
            year: "Classic",
            rating: 8.0,
            overview: "A delightful, famous movie for kids and families.",
            tagline: "Family favorite",
            genres: "Animation · Family",
            posterPath: null,
            backdropPath: null,
            age: "All Ages",
            highlight: "Family favorite from TMDB",
            isToday: idx === dailyIndex,
          };
        }
      })
    );

    return NextResponse.json({
      todayIndex: dailyIndex,
      todayDate: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      items: featuredItems,
    });
  } catch (error: any) {
    console.error("Error fetching daily kids featured movies:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
