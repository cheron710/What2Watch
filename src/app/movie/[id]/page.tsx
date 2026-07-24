import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getMoviePageData } from "@/services/movies";
import { getMovies } from "@/services/adminService";
import { tmdbImageUrl } from "@/lib/tmdb/client";
import { getSessionUser } from "@/lib/auth/session";
import { getLibraryState } from "@/services/library";
import PosterCard from "@/components/ui/PosterCard";
import SaveActions from "@/components/movie/SaveActions";
import TrailerModal from "@/components/movie/TrailerModal";
import "../movie.css";

export const dynamic = "force-dynamic";

function formatRuntime(mins: number | null): string | null {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function formatMoney(value: number): string | null {
  if (!value) return null;
  return `$${(value / 1_000_000).toFixed(value >= 100_000_000 ? 0 : 1)}M`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const movieId = Number(id);
    const allMovies = await getMovies();
    const dbMovie = allMovies.find((m) => m.id === movieId);
    if (!dbMovie || dbMovie.visibility === "hidden" || dbMovie.status === "draft") {
      return { title: "Film Not Found — What2Watch" };
    }
    const { movie } = await getMoviePageData(movieId);
    const displayTitle = dbMovie.title || movie.title;
    const year = movie.release_date ? ` (${movie.release_date.slice(0, 4)})` : "";
    return {
      title: `${displayTitle}${year} — What2Watch`,
      description: movie.overview?.slice(0, 160) ?? "Discover this film on What2Watch.",
    };
  } catch {
    return { title: "Film — What2Watch" };
  }
}

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isInteger(movieId) || movieId <= 0) notFound();

  // Enforce visibility of only admin uploads
  const allMovies = await getMovies();
  const dbMovie = allMovies.find((m) => m.id === movieId);
  if (!dbMovie || dbMovie.visibility === "hidden" || dbMovie.status === "draft") {
    notFound();
  }

  const data = await getMoviePageData(movieId);
  const { movie, directors, writers, topCast, trailer, providers, recommendations, editorial } = data;

  // Override movie fields with database customized values
  if (dbMovie.title) movie.title = dbMovie.title;
  if (dbMovie.poster_path) movie.poster_path = dbMovie.poster_path;
  if (dbMovie.backdrop_path) movie.backdrop_path = dbMovie.backdrop_path;
  
  const displayEditorial = dbMovie.custom_editorial_description || editorial;

  // Filter recommendations to show only other admin-uploaded and visible movies
  const filteredRecommendations = recommendations.filter((rec) =>
    allMovies.some((m) => m.id === rec.id && m.visibility !== "hidden" && m.status !== "draft")
  );

  const user = await getSessionUser();
  const libraryState = user
    ? await getLibraryState(user.id, movie.id)
    : { inWatchlist: false, inFavorites: false };

  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const runtime = formatRuntime(movie.runtime);
  const country = movie.production_countries?.[0]?.name;
  const language = movie.spoken_languages?.[0]?.name;
  const budget = formatMoney(movie.budget);
  const revenue = formatMoney(movie.revenue);
  const streaming = [...providers.flatrate, ...providers.rent, ...providers.buy]
    .filter((p, i, arr) => arr.findIndex((x) => x.provider_id === p.provider_id) === i)
    .slice(0, 8);

  const seed = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    overview: movie.overview,
    vote_average: movie.vote_average,
    genre_ids: movie.genres?.map((g) => g.id) ?? [],
  };

  return (
    <div className="mv-page">
      {/* ── Hero ── */}
      <section className="mv-hero">
        {movie.backdrop_path && (
          <Image
            src={tmdbImageUrl(movie.backdrop_path, "w1280")}
            alt=""
            fill
            priority
            sizes="100vw"
            className="mv-hero-bg"
          />
        )}
        <div className="mv-hero-scrim" />
        <div className="mv-hero-inner">
          <div className="mv-poster">
            <Image
              src={tmdbImageUrl(movie.poster_path, "w500")}
              alt={`${movie.title} poster`}
              fill
              sizes="260px"
              priority
            />
          </div>
          <div>
            <div className="mv-head-eyebrow">
              {movie.genres?.slice(0, 3).map((g) => (
                <span key={g.id}>{g.name}</span>
              ))}
            </div>
            <h1 className="mv-title">{movie.title}</h1>
            {movie.tagline && <p className="mv-tagline">{movie.tagline}</p>}

            <div className="mv-meta-row">
              {year && <span className="mv-meta-item">{year}</span>}
              {runtime && (
                <>
                  <span className="mv-meta-dot" />
                  <span className="mv-meta-item">{runtime}</span>
                </>
              )}
              {directors[0] && (
                <>
                  <span className="mv-meta-dot" />
                  <span className="mv-meta-item">Dir. {directors[0].name}</span>
                </>
              )}
              {movie.vote_average > 0 && (
                <>
                  <span className="mv-meta-dot" />
                  <span className="mv-meta-item">
                    <span className="mv-star">★</span> {movie.vote_average.toFixed(1)}
                  </span>
                </>
              )}
            </div>

            <div className="mv-cta-row">
              {trailer && <TrailerModal youtubeKey={trailer.key} />}
              <SaveActions
                seed={seed}
                isAuthenticated={user !== null}
                initialInWatchlist={libraryState.inWatchlist}
                initialInFavorites={libraryState.inFavorites}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="mv-body">
        <main>
          {movie.overview && (
            <section className="mv-section">
              <span className="mv-section-label">Overview</span>
              <p className="mv-overview">{movie.overview}</p>
            </section>
          )}

          <section className="mv-section">
            <span className="mv-section-label">The What2Watch Take</span>
            <p className="mv-editorial">{displayEditorial}</p>
          </section>

          {topCast.length > 0 && (
            <section className="mv-section">
              <span className="mv-section-label">Cast</span>
              <div className="mv-cast-grid">
                {topCast.map((c) => (
                  <Link key={c.id} href={`/person/${c.id}`} className="mv-cast-card">
                    <div className="mv-cast-photo">
                      <Image
                        src={tmdbImageUrl(c.profile_path, "w185")}
                        alt={c.name}
                        fill
                        sizes="120px"
                      />
                    </div>
                    <div className="mv-cast-name">{c.name}</div>
                    <div className="mv-cast-role">{c.character}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(movie.genres?.length ?? 0) > 0 && (
            <section className="mv-section">
              <span className="mv-section-label">Genres</span>
              <div className="mv-chips">
                {movie.genres.map((g) => (
                  <Link key={g.id} href={`/genre/${g.id}`} className="mv-chip">
                    {g.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {filteredRecommendations.length > 0 && (
            <section className="mv-section">
              <span className="mv-section-label">More Like This — and why</span>
              <div className="mv-rec-grid">
                {filteredRecommendations.slice(0, 8).map((rec) => (
                  <PosterCard key={rec.id} movie={rec} reason={rec.reason} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* ── Aside: facts + providers ── */}
        <aside className="mv-aside">
          {streaming.length > 0 && (
            <div className="mv-fact-block">
              <div className="mv-fact">
                <div className="mv-fact-label">Where to Watch</div>
                <div className="mv-providers">
                  {streaming.map((p) => (
                    <span key={p.provider_id} className="mv-provider-logo" title={p.provider_name}>
                      <Image
                        src={tmdbImageUrl(p.logo_path, "w92")}
                        alt={p.provider_name}
                        fill
                        sizes="44px"
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mv-fact-block">
            {directors.length > 0 && (
              <div className="mv-fact">
                <div className="mv-fact-label">Director</div>
                <div className="mv-fact-value">
                  {directors.map((d, i) => (
                    <span key={d.id}>
                      <Link href={`/person/${d.id}`}>{d.name}</Link>
                      {i < directors.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {writers.length > 0 && (
              <div className="mv-fact">
                <div className="mv-fact-label">Writers</div>
                <div className="mv-fact-value">{writers.map((w) => w.name).join(", ")}</div>
              </div>
            )}
            {movie.status && (
              <div className="mv-fact">
                <div className="mv-fact-label">Status</div>
                <div className="mv-fact-value">{movie.status}</div>
              </div>
            )}
            {language && (
              <div className="mv-fact">
                <div className="mv-fact-label">Language</div>
                <div className="mv-fact-value">{language}</div>
              </div>
            )}
            {country && (
              <div className="mv-fact">
                <div className="mv-fact-label">Country</div>
                <div className="mv-fact-value">{country}</div>
              </div>
            )}
            {budget && (
              <div className="mv-fact">
                <div className="mv-fact-label">Budget</div>
                <div className="mv-fact-value">{budget}</div>
              </div>
            )}
            {revenue && (
              <div className="mv-fact">
                <div className="mv-fact-label">Box Office</div>
                <div className="mv-fact-value">{revenue}</div>
              </div>
            )}
            {movie.imdb_id && (
              <div className="mv-fact">
                <div className="mv-fact-label">Links</div>
                <div className="mv-fact-value">
                  <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noopener noreferrer">
                    IMDb ↗
                  </a>
                  {movie.homepage && (
                    <>
                      {" · "}
                      <a href={movie.homepage} target="_blank" rel="noopener noreferrer">
                        Official site ↗
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
