// src/lib/tmdb/client.ts
// TMDb API v3 client — all calls go through this module.
// Set TMDB_API_KEY in .env.local (never NEXT_PUBLIC_)

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const tmdbImageUrl = (path: string | null, size = "w500"): string =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : "/placeholder-poster.svg";

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY!);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`TMDb fetch failed: ${res.status} ${url.pathname}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TMDbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
}

export interface TMDbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDbVideo {
  id: string;
  key: string;
  name: string;
  site: string; // "YouTube"
  type: string; // "Trailer", "Teaser", …
  official: boolean;
}

export interface TMDbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

export interface TMDbMovieDetail extends TMDbMovie {
  runtime: number;
  tagline: string;
  imdb_id: string;
  status: string;
  budget: number;
  revenue: number;
  homepage: string | null;
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  spoken_languages: { iso_639_1: string; name: string }[];
  credits: {
    cast: TMDbCastMember[];
    crew: TMDbCrewMember[];
  };
  similar: TMDbSearchResult;
  keywords: { keywords: { id: number; name: string }[] };
  videos: { results: TMDbVideo[] };
  "watch/providers": {
    results: Record<
      string,
      {
        link: string;
        flatrate?: TMDbProvider[];
        rent?: TMDbProvider[];
        buy?: TMDbProvider[];
      }
    >;
  };
}

export interface TMDbSearchResult {
  page: number;
  results: TMDbMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDbPersonCredits {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  known_for_department: string;
  combined_credits?: { cast: TMDbMovie[]; crew: (TMDbMovie & { job: string })[] };
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/** Full text search for movies */
export function searchMovies(query: string, page = 1) {
  return tmdbFetch<TMDbSearchResult>("/search/movie", { query, page, include_adult: 0 });
}

/** Trending movies (day or week) */
export function getTrending(window: "day" | "week" = "week") {
  return tmdbFetch<TMDbSearchResult>(`/trending/movie/${window}`);
}

/** Top-rated movies */
export function getTopRated(page = 1) {
  return tmdbFetch<TMDbSearchResult>("/movie/top_rated", { page });
}

/** Movies by genre */
export function discoverByGenre(genreIds: number[], page = 1) {
  return tmdbFetch<TMDbSearchResult>("/discover/movie", {
    with_genres: genreIds.join(","),
    sort_by: "popularity.desc",
    page,
    "vote_count.gte": 100,
  });
}

/** Full movie detail, incl. credits, similar, keywords, videos and providers */
export function getMovieDetail(movieId: number) {
  return tmdbFetch<TMDbMovieDetail>(`/movie/${movieId}`, {
    append_to_response: "credits,similar,keywords,videos,watch/providers",
  });
}

/** Now-playing movies */
export function getNowPlaying(page = 1) {
  return tmdbFetch<TMDbSearchResult>("/movie/now_playing", { page });
}

/** Popular movies */
export function getPopular(page = 1) {
  return tmdbFetch<TMDbSearchResult>("/movie/popular", { page });
}

/** Upcoming movies */
export function getUpcoming(page = 1) {
  return tmdbFetch<TMDbSearchResult>("/movie/upcoming", { page });
}

/** Person (director / actor) with combined credits */
export function getPerson(personId: number) {
  return tmdbFetch<TMDbPersonCredits>(`/person/${personId}`, {
    append_to_response: "combined_credits",
  });
}

/** Discover with an arbitrary parameter map (used by mood/experience pages) */
export function discover(params: Record<string, string | number>) {
  return tmdbFetch<TMDbSearchResult>("/discover/movie", {
    sort_by: "popularity.desc",
    "vote_count.gte": 100,
    include_adult: 0,
    ...params,
  });
}

/** Genre list */
export function getGenres() {
  return tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/movie/list");
}

/** Pick the best trailer from a videos payload (YouTube, official trailer preferred) */
export function pickTrailer(videos: TMDbVideo[]): TMDbVideo | null {
  const youtube = videos.filter((v) => v.site === "YouTube");
  return (
    youtube.find((v) => v.type === "Trailer" && v.official) ??
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser") ??
    youtube[0] ??
    null
  );
}

/** Extract the director(s) from a crew list */
export function findDirectors(crew: TMDbCrewMember[]): TMDbCrewMember[] {
  return crew.filter((c) => c.job === "Director");
}
