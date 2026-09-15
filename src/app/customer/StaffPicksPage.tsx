import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import MovieGrid from "@/components/ui/MovieGrid";
import { getStaffPicks, getMovies } from "@/services/adminService";
import { getMovieDetail, searchMovies } from "@/lib/tmdb/client";
import "./staff.css";

export default async function StaffPicksPage() {
  let teamMembers: any[] = [];
  let shelf: any[] = [];

  try {
    const [rawPicks, allMovies] = await Promise.all([
      getStaffPicks().catch(() => []),
      getMovies().catch(() => []),
    ]);

    const published = rawPicks.filter((item: any) => item.is_published !== false);

    const resolved = await Promise.all(
      published.map(async (dev: any) => {
        const name = dev.name || dev.title || "Staff Member";
        const role = dev.role || dev.description || "Developer";
        const note = dev.note || dev.description || "Curated selection.";
        const rawPickStr = dev.pick || dev.title || "";
        const initial =
          dev.initial ||
          name
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

        // Collect all target movie IDs for this developer
        const movieIds: number[] = Array.isArray(dev.movies) ? dev.movies : [];
        if (dev.tmdbId && !movieIds.includes(Number(dev.tmdbId))) {
          movieIds.unshift(Number(dev.tmdbId));
        }

        const resolvedMovies: any[] = [];

        // 1. Resolve from movieIds array
        for (const mid of movieIds) {
          const localMatch = allMovies.find((m: any) => Number(m.id) === Number(mid));
          if (localMatch && localMatch.visibility !== "hidden") {
            resolvedMovies.push(localMatch);
          } else {
            try {
              const external = await getMovieDetail(mid);
              resolvedMovies.push({
                id: external.id,
                title: external.title,
                poster_path: external.poster_path,
                release_date: external.release_date,
                vote_average: external.vote_average,
                overview: external.overview,
              });
            } catch (err) {
              console.warn(`Failed to fetch TMDB movie ${mid}:`, err);
            }
          }
        }

        // 2. Fallback: if no movies resolved via ID, search by comma-separated pick titles
        if (resolvedMovies.length === 0 && rawPickStr) {
          const titles = rawPickStr.split(",").map((t: string) => t.trim()).filter(Boolean);
          for (const titleText of titles) {
            try {
              const searchRes = await searchMovies(titleText);
              if (searchRes.results && searchRes.results.length > 0) {
                const topHit = searchRes.results[0];
                resolvedMovies.push({
                  id: topHit.id,
                  title: topHit.title,
                  poster_path: topHit.poster_path,
                  release_date: topHit.release_date,
                  vote_average: topHit.vote_average,
                  overview: topHit.overview,
                });
              }
            } catch (err) {
              console.warn(`Failed to search TMDB for "${titleText}":`, err);
            }
          }
        }

        return {
          id: dev.id,
          name,
          role,
          initial,
          note,
          rawPickStr,
          picks: resolvedMovies,
        };
      })
    );

    teamMembers = resolved;

    // Collect all unique resolved movies across all developers for the Staff Shelf grid
    const shelfList: any[] = [];
    const seenIds = new Set<number>();

    resolved.forEach((dev) => {
      dev.picks.forEach((movie: any) => {
        if (movie && !seenIds.has(movie.id)) {
          seenIds.add(movie.id);
          shelfList.push(movie);
        }
      });
    });

    shelf = shelfList;
  } catch (e) {
    console.error("Failed to load staff picks curation:", e);
    teamMembers = [];
    shelf = [];
  }

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Staff Picks"
        title={<>Curated by the Development Team</>}
        lede={
          <>
            Meet the people building What2Watch — engineers, designers, and curators sharing the
            films that inspire their craft. Set and managed directly from the Admin Panel.
          </>
        }
      />

      {/* Developer Team Curators Section */}
      <section className="ed-section">
        <div className="ed-container">
          <span className="ed-section-label">The Development Team</span>
          <h2 className="ed-section-title" style={{ marginBottom: 32 }}>
            Team Curators &amp; Favorite Films
          </h2>
          <div className="ed-grid ed-grid-3">
            {teamMembers.map((c) => (
              <article key={c.id || c.name} className="staff-card">
                <div className="staff-avatar">{c.initial}</div>
                <h3 className="staff-name">{c.name}</h3>
                <span className="staff-role">{c.role}</span>
                <p className="staff-note">“{c.note}”</p>
                <div className="staff-pick">
                  <span className="staff-pick-label">
                    {c.picks.length > 1 ? "Favorite Picks" : "Favorite Pick"}
                  </span>
                  {c.picks.length > 0 ? (
                    <div className="flex flex-col gap-1 mt-1">
                      {c.picks.map((m: any) => (
                        <Link
                          key={m.id}
                          href={`/movie/${m.id}`}
                          className="staff-pick-title hover:underline text-sm font-semibold flex items-center justify-between"
                        >
                          <span>{m.title}</span>
                          <span className="text-[10px] text-[var(--color-text-3)] font-mono">
                            ★ {m.vote_average ? Number(m.vote_average).toFixed(1) : "N/A"} →
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="staff-pick-title">{c.rawPickStr || "Not assigned"}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Shelf */}
      <section className="ed-section" style={{ paddingTop: 0 }}>
        <div className="ed-container">
          <span className="ed-section-label">The Staff Shelf</span>
          <h2 className="ed-section-title" style={{ marginBottom: 32 }}>
            Team Consensus Favorites
          </h2>
          <MovieGrid
            movies={shelf}
            emptyMessage="The staff shelf is being restocked — check back shortly."
          />
        </div>
      </section>
    </div>
  );
}


