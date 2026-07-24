import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import MovieGrid from "@/components/ui/MovieGrid";
import { getEmotions, getMovies } from "@/services/adminService";
import { getMovieDetail } from "@/lib/tmdb/client";

const WAYS = [
  {
    title: "To feel less alone",
    body: "Films that sit with loss honestly, so the ache on screen meets the one you're carrying.",
  },
  {
    title: "To let it out",
    body: "Sometimes you need permission to cry. These are the films that gently give it.",
  },
  {
    title: "To find a little light",
    body: "Tender, warm stories for when you're ready — not to move on, but to move gently forward.",
  },
];

export default async function GriefHelperPage() {
  let films: any[] = [];
  try {
    const [emotions, allMovies] = await Promise.all([getEmotions(), getMovies()]);
    
    // Find custom curated "grief" category
    const griefCat = emotions.find(
      (e) => e.slug === "grief" || e.name?.toLowerCase() === "grief"
    );
    const griefMovieIds = griefCat?.movies || [];

    // Also include any imported movies that have "Grief" in emotional_tags
    const taggedMovieIds = allMovies
      .filter((m) => m.emotional_tags?.includes("Grief") && m.visibility !== "hidden")
      .map((m) => m.id);

    // Combine unique IDs
    const combinedIds = Array.from(new Set([...griefMovieIds, ...taggedMovieIds]));

    const movies = await Promise.all(
      combinedIds.map(async (id) => {
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
    films = movies.filter((m) => m !== null);
  } catch (e) {
    console.error("Failed to load grief companion movies:", e);
    films = [];
  }

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="A Gentle Place"
        title={<>The Grief Companion</>}
        lede={
          <>
            Grief is not a problem to be solved. Sometimes the right film doesn&apos;t fix anything — it
            simply sits beside you for a couple of hours and lets you know you&apos;re not the only one.
            Take what helps, and leave the rest.
          </>
        }
      />

      <section className="ed-section">
        <div className="ed-container">
          <div className="ed-grid ed-grid-3">
            {WAYS.map((w, i) => (
              <article key={w.title} className="ed-card">
                <div className="ed-card-num">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="ed-card-title">{w.title}</h3>
                <p className="ed-card-body">{w.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ed-section" style={{ paddingTop: 0 }}>
        <div className="ed-container">
          <span className="ed-section-label">Films that keep you company</span>
          <h2 className="ed-section-title" style={{ marginBottom: 20 }}>
            Quiet, honest, and kind
          </h2>
          <p className="ed-section-sub" style={{ marginBottom: 32 }}>
            Chosen for their tenderness. If any feels like too much today, that&apos;s okay — it will still
            be here when you&apos;re ready.
          </p>
          <MovieGrid movies={films} emptyMessage="These films are loading — please try again shortly." />
        </div>
      </section>

      <section className="ed-section" style={{ paddingTop: 0 }}>
        <div className="ed-container">
          <div className="ed-prose">
            <p>
              If you&apos;re struggling and need to talk to someone, please reach out to a friend, a loved
              one, or a professional. A film can be company, but it is never a substitute for support.
              If you&apos;d like a more personal suggestion, {" "}
              <Link href="/guillaume">Guillaume is here to listen →</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
