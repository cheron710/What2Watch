import PageHeader from "@/components/ui/PageHeader";
import MovieGrid from "@/components/ui/MovieGrid";
import { getStaffPicks, getMovies } from "@/services/adminService";
import { getMovieDetail } from "@/lib/tmdb/client";
import "./staff.css";

const CURATORS = [
  {
    initial: "S",
    name: "Sansheron W.",
    role: "Founder & Editor",
    note: "I look for films that trust their audience — the ones that leave room for you to feel your way through.",
    pick: "Manchester by the Sea",
  },
  {
    initial: "M",
    name: "Marguerite L.",
    role: "Contributing Critic",
    note: "Give me a bold formal swing over a safe masterpiece any day. Cinema should risk something.",
    pick: "Portrait of a Lady on Fire",
  },
  {
    initial: "T",
    name: "Tobias R.",
    role: "Guest Filmmaker",
    note: "The films that taught me my craft were never the loudest ones. Watch for the quiet decisions.",
    pick: "Paris, Texas",
  },
];

export default async function StaffPicksPage() {
  let shelf: any[] = [];
  try {
    const [collections, allMovies] = await Promise.all([getStaffPicks(), getMovies()]);
    const publishedCols = collections.filter((c) => c.is_published);
    const curatedMovieIds = Array.from(new Set(publishedCols.flatMap((c) => c.movies || [])));

    const movies = await Promise.all(
      curatedMovieIds.map(async (id) => {
        const local = allMovies.find((m) => m.id === id);
        if (local) return local;
        try {
          const external = await getMovieDetail(id);
          return {
            id: external.id,
            title: external.title,
            poster_path: external.poster_path,
            release_date: external.release_date,
            vote_average: external.vote_average,
          };
        } catch {
          return null;
        }
      })
    );
    shelf = movies.filter((m) => m !== null);
  } catch (e) {
    console.error("Failed to load staff picks curation:", e);
    shelf = [];
  }

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Staff Picks"
        title={<>Curated by people, not algorithms</>}
        lede={
          <>
            Every month the What2Watch team — plus invited critics and filmmakers — share the films they
            can&apos;t stop thinking about. Personal, opinionated, and always with a reason.
          </>
        }
      />

      <section className="ed-section">
        <div className="ed-container">
          <span className="ed-section-label">This Month&apos;s Curators</span>
          <h2 className="ed-section-title" style={{ marginBottom: 32 }}>
            The people behind the picks
          </h2>
          <div className="ed-grid ed-grid-3">
            {CURATORS.map((c) => (
              <article key={c.name} className="staff-card">
                <div className="staff-avatar">{c.initial}</div>
                <h3 className="staff-name">{c.name}</h3>
                <span className="staff-role">{c.role}</span>
                <p className="staff-note">“{c.note}”</p>
                <div className="staff-pick">
                  <span className="staff-pick-label">This month&apos;s pick</span>
                  <span className="staff-pick-title">{c.pick}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ed-section" style={{ paddingTop: 0 }}>
        <div className="ed-container">
          <span className="ed-section-label">The Staff Shelf</span>
          <h2 className="ed-section-title" style={{ marginBottom: 32 }}>
            Consensus favourites
          </h2>
          <MovieGrid movies={shelf} emptyMessage="The shelf is being restocked — check back shortly." />
        </div>
      </section>
    </div>
  );
}
