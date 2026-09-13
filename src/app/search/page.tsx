import type { Metadata } from "next";
import { getMovies } from "@/services/adminService";
import { searchMovies, tmdbImageUrl } from "@/lib/tmdb/client";
import PageHeader from "@/components/ui/PageHeader";
import MovieGrid from "@/components/ui/MovieGrid";
import SearchBox from "./SearchBox";
import "./search.css";

export const metadata: Metadata = {
  title: "Search — What2Watch",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let results: any[] = [];
  let total = 0;
  let errored = false;

  if (query.length >= 2) {
    try {
      let data = null;
      let fallback = false;
      try {
        data = await searchMovies(query);
      } catch (err) {
        console.warn("TMDb search in page failed, falling back to DB:", err);
        fallback = true;
      }

      const allMovies = await getMovies();
      const visibleDbMovies = allMovies.filter((m) => m.visibility !== "hidden" && m.status !== "draft");
      const hiddenOrDraftIds = new Set(
        allMovies.filter((m) => m.visibility === "hidden" || m.status === "draft").map((m) => m.id)
      );

      const queryLower = query.toLowerCase();
      const dbMatching = visibleDbMovies.filter((m) => {
        const titleMatch = m.title?.toLowerCase().includes(queryLower);
        const originalTitleMatch = m.original_title?.toLowerCase().includes(queryLower);
        const overviewMatch = m.overview?.toLowerCase().includes(queryLower);
        return titleMatch || originalTitleMatch || overviewMatch;
      });

      const dbMapped = dbMatching.map((m) => ({
        id: m.id,
        title: m.title,
        poster_path: m.poster_path ? (m.poster_path.startsWith("http") ? m.poster_path : tmdbImageUrl(m.poster_path)) : "/placeholder-poster.svg",
        backdrop_path: m.backdrop_path ? (m.backdrop_path.startsWith("http") ? m.backdrop_path : tmdbImageUrl(m.backdrop_path)) : "/placeholder-backdrop.svg",
        release_date: m.release_date,
        vote_average: m.vote_average,
        genre_ids: m.genre_ids || []
      }));

      const seenIds = new Set(dbMapped.map((m) => m.id));

      let rawResults: any[] = [];
      if (!fallback && data && data.results && data.results.length > 0) {
        rawResults = data.results;
      }

      const tmdbMapped = rawResults
        .filter((m: any) => (m.poster_path || m.release_date) && !hiddenOrDraftIds.has(m.id) && !seenIds.has(m.id))
        .map((m: any) => {
          const dbOverride = visibleDbMovies.find((dm) => dm.id === m.id);
          return {
            id: m.id,
            title: dbOverride?.title || m.title,
            poster_path: dbOverride?.poster_path
              ? (dbOverride.poster_path.startsWith("http") ? dbOverride.poster_path : tmdbImageUrl(dbOverride.poster_path))
              : tmdbImageUrl(m.poster_path),
            backdrop_path: dbOverride?.backdrop_path
              ? (dbOverride.backdrop_path.startsWith("http") ? dbOverride.backdrop_path : tmdbImageUrl(dbOverride.backdrop_path))
              : tmdbImageUrl(m.backdrop_path),
            release_date: dbOverride?.release_date || m.release_date,
            vote_average: dbOverride?.vote_average ?? m.vote_average,
            genre_ids: dbOverride?.genre_ids || m.genre_ids || []
          };
        });

      results = [...dbMapped, ...tmdbMapped];
      
      total = results.length;
    } catch (e) {
      console.error("Error performing search page lookup:", e);
      errored = true;
    }
  }

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Search"
        title={query ? <>Results for “{query}”</> : <>Find a film</>}
        lede={
          query
            ? errored
              ? "Search is temporarily unavailable. Please try again shortly."
              : `${total.toLocaleString()} ${total === 1 ? "film" : "films"} matched your search.`
            : "Search the full TMDb catalogue by title. Results link straight to editorial film pages."
        }
      >
        <div style={{ marginTop: 32 }}>
          <SearchBox initialQuery={query} />
        </div>
      </PageHeader>

      <section className="ed-section">
        <div className="ed-container">
          {query.length >= 2 ? (
            <MovieGrid
              movies={results}
              emptyMessage={
                errored
                  ? "Something went wrong. Please try again."
                  : `No films found for “${query}”. Try another title.`
              }
            />
          ) : (
            <p className="movie-grid-empty">Type at least two characters to search.</p>
          )}
        </div>
      </section>
    </div>
  );
}
