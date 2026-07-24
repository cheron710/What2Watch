import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { discoverByGenre } from "@/lib/tmdb/client";
import { genreName } from "@/lib/tmdb/genres";
import PageHeader from "@/components/ui/PageHeader";
import MovieGrid from "@/components/ui/MovieGrid";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const name = genreName(Number(id));
  return { title: name ? `${name} Films — What2Watch` : "Genre — What2Watch" };
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const genreId = Number(id);
  const name = genreName(genreId);
  if (!name) notFound();

  let movies: Awaited<ReturnType<typeof discoverByGenre>>["results"] = [];
  try {
    const data = await discoverByGenre([genreId], 1);
    movies = data.results;
  } catch {
    movies = [];
  }

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Browse by Genre"
        title={<>{name}</>}
        lede={
          <>
            The essential {name.toLowerCase()} films — ranked by resonance, not just
            box office. A living shelf, refreshed as new work earns its place.
          </>
        }
      />
      <section className="ed-section">
        <div className="ed-container">
          <MovieGrid
            movies={movies}
            emptyMessage="We couldn't load this genre right now. Please try again shortly."
          />
        </div>
      </section>
    </div>
  );
}
