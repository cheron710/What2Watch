import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { getWatchlist, getFavorites, type MovieRow } from "@/services/library";
import { getPopular, type TMDbMovie } from "@/lib/tmdb/client";
import { getRecommendationsFromWatchlist } from "@/lib/recommendations/engine";
import PageHeader from "@/components/ui/PageHeader";
import MovieGrid from "@/components/ui/MovieGrid";
import "./account.css";

export const metadata: Metadata = { title: "Dashboard — What2Watch" };

/** A cached movie row carries enough features to seed the engine. */
function rowToMovie(row: MovieRow): TMDbMovie {
  return {
    id: row.id,
    title: row.title,
    original_title: row.original_title ?? row.title,
    overview: row.overview ?? "",
    release_date: row.release_date ?? "",
    poster_path: row.poster_path,
    backdrop_path: row.backdrop_path,
    genre_ids: row.genre_ids ?? [],
    vote_average: row.vote_average ?? 0,
    vote_count: row.vote_count ?? 0,
    popularity: row.popularity ?? 0,
  };
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  const [watchlist, favorites] = await Promise.all([
    getWatchlist(user.id),
    getFavorites(user.id),
  ]);

  // Personalised recommendations seeded by the user's watchlist.
  let recommendations: TMDbMovie[] = [];
  if (watchlist.length > 0) {
    try {
      const pool = await getPopular();
      const seeds = watchlist.map((w) => rowToMovie(w.movie));
      recommendations = getRecommendationsFromWatchlist(seeds, pool.results, 10);
    } catch {
      recommendations = [];
    }
  }

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow={`Welcome back, ${user.name}`}
        title={<>Your dashboard</>}
        lede={<>Everything you&apos;re tracking, and a few films chosen just for you.</>}
      />

      <section className="ed-section">
        <div className="ed-container">
          <div className="acct-stats">
            <Link href="/watchlist" className="acct-stat">
              <span className="acct-stat-num">{watchlist.length}</span>
              <span className="acct-stat-label">In Watchlist</span>
            </Link>
            <Link href="/favorites" className="acct-stat">
              <span className="acct-stat-num">{favorites.length}</span>
              <span className="acct-stat-label">Favorites</span>
            </Link>
            <Link href="/history" className="acct-stat">
              <span className="acct-stat-num">
                {watchlist.filter((w) => w.status === "watched").length}
              </span>
              <span className="acct-stat-label">Watched</span>
            </Link>
          </div>
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="ed-section" style={{ paddingTop: 0 }}>
          <div className="ed-container">
            <span className="ed-section-label">Because of your watchlist</span>
            <h2 className="ed-section-title" style={{ marginBottom: 32 }}>
              Chosen for you
            </h2>
            <MovieGrid movies={recommendations} />
          </div>
        </section>
      )}

      <section className="ed-section" style={{ paddingTop: recommendations.length ? 0 : undefined }}>
        <div className="ed-container">
          <span className="ed-section-label">Recently added</span>
          <h2 className="ed-section-title" style={{ marginBottom: 32 }}>
            Your watchlist
          </h2>
          <MovieGrid
            movies={watchlist.slice(0, 10).map((w) => w.movie)}
            emptyMessage="Your watchlist is empty. Start exploring and tap the bookmark on any film."
          />
          {watchlist.length === 0 && (
            <div className="acct-quicklinks" style={{ marginTop: 24 }}>
              <Link href="/emotional-spectrum" className="ed-btn">Discover by mood</Link>
              <Link href="/guillaume" className="ed-link" style={{ alignSelf: "center" }}>
                Or ask Guillaume →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
