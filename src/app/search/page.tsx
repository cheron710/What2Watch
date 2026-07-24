import type { Metadata } from "next";
import { getMovies } from "@/services/adminService";
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
      const allMovies = await getMovies();
      // Filter movies that are visible and matching the query
      const visibleMovies = allMovies.filter((m) => m.visibility !== "hidden");
      results = visibleMovies.filter(
        (m) =>
          m.title?.toLowerCase().includes(query.toLowerCase()) ||
          m.original_title?.toLowerCase().includes(query.toLowerCase()) ||
          m.overview?.toLowerCase().includes(query.toLowerCase())
      );
      total = results.length;
    } catch {
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
