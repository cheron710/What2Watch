// src/services/movies.ts
// Server-side orchestration for the movie detail page: fetches the full TMDb
// record, derives the best trailer / director / providers, and computes
// content-based recommendations (with explanations) from the "similar" pool.
import {
  getMovieDetail,
  pickTrailer,
  findDirectors,
  type TMDbMovieDetail,
  type TMDbCastMember,
  type TMDbCrewMember,
  type TMDbVideo,
  type TMDbProvider,
} from "@/lib/tmdb/client";
import {
  getRecommendations,
  type ScoredMovie,
} from "@/lib/recommendations/engine";

export interface MoviePageData {
  movie: TMDbMovieDetail;
  directors: TMDbCrewMember[];
  writers: TMDbCrewMember[];
  topCast: TMDbCastMember[];
  trailer: TMDbVideo | null;
  providers: { flatrate: TMDbProvider[]; rent: TMDbProvider[]; buy: TMDbProvider[]; link: string | null };
  recommendations: ScoredMovie[];
  editorial: string;
}

/** Compose a deterministic, magazine-voiced editorial blurb for the film. */
export function composeEditorial(movie: TMDbMovieDetail, directors: TMDbCrewMember[]): string {
  const dir = directors[0]?.name;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const genres = movie.genres?.map((g) => g.name.toLowerCase()) ?? [];
  const primary = genres[0];
  const rating = movie.vote_average;

  const opening = movie.tagline?.trim()
    ? `“${movie.tagline.trim()}” — `
    : "";

  const craft = dir
    ? `${dir}'s ${year ?? "film"} ${primary ? `${primary} ` : ""}feature`
    : `This ${year ?? ""} ${primary ? `${primary} ` : ""}feature`.trim();

  const reception =
    rating >= 7.5
      ? "arrives as one of the more quietly assured pictures of its moment"
      : rating >= 6
      ? "rewards viewers willing to meet it on its own terms"
      : "trades polish for personality";

  const genreClause =
    genres.length >= 2
      ? ` It moves between ${genres.slice(0, 2).join(" and ")} without losing its footing,`
      : primary
      ? ` Rooted firmly in ${primary},`
      : "";

  return `${opening}${craft} ${reception}.${genreClause} leaving you with the sense that its images were composed rather than captured.`.trim();
}

export async function getMoviePageData(id: number): Promise<MoviePageData> {
  const movie = await getMovieDetail(id);

  const directors = findDirectors(movie.credits?.crew ?? []);
  const writers = (movie.credits?.crew ?? []).filter(
    (c) => c.department === "Writing"
  );
  // De-duplicate writers by name.
  const seenWriters = new Set<string>();
  const uniqueWriters = writers.filter((w) => {
    if (seenWriters.has(w.name)) return false;
    seenWriters.add(w.name);
    return true;
  });

  const topCast = (movie.credits?.cast ?? []).slice(0, 12);
  const trailer = pickTrailer(movie.videos?.results ?? []);

  const region = movie["watch/providers"]?.results?.US ?? null;
  const providers = {
    flatrate: region?.flatrate ?? [],
    rent: region?.rent ?? [],
    buy: region?.buy ?? [],
    link: region?.link ?? null,
  };

  const recommendations = getRecommendations(movie, movie.similar?.results ?? [], 8);
  const editorial = composeEditorial(movie, directors);

  return {
    movie,
    directors,
    writers: uniqueWriters.slice(0, 4),
    topCast,
    trailer,
    providers,
    recommendations,
    editorial,
  };
}
