import { findCollection, type CollectionGroup } from "@/lib/discovery/collections";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import MovieGrid from "@/components/ui/MovieGrid";
import { 
  getEmotions, 
  getExperiences, 
  getFestivals, 
  getSeasons, 
  getMovies 
} from "@/services/adminService";
import { getMovieDetail } from "@/lib/tmdb/client";

// Helper to slugify strings for matching
const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Renders a single discovery collection (header + backend-backed grid) for any
 * group. Shared by every /emotion, /experience, /season and /festival route.
 */
export default async function CollectionView({
  group,
  slug,
}: {
  group: CollectionGroup;
  slug: string;
}) {
  const collection = findCollection(group, slug);
  if (!collection) notFound();

  let curatedMovieIds: number[] = [];
  let displayTitle = collection.title;
  let displayLede = collection.lede;

  try {
    if (group === "emotion") {
      const emotions = await getEmotions();
      const found = emotions.find((e) => slugify(e.name) === slug || e.slug === slug);
      if (found) {
        curatedMovieIds = found.movies || [];
        if (found.name) displayTitle = found.name;
        if (found.description) displayLede = found.description;
      }
    } else if (group === "experience") {
      const experiences = await getExperiences();
      const found = experiences.find((e) => slugify(e.name) === slug || slugify(e.experience_type) === slug);
      if (found) {
        curatedMovieIds = found.movies || [];
        if (found.name) displayTitle = found.name;
        if (found.description) displayLede = found.description;
      }
    } else if (group === "festival") {
      const festivals = await getFestivals();
      const found = festivals.find((f) => slugify(f.festival_name) === slug || slugify(f.title) === slug);
      if (found) {
        curatedMovieIds = found.movies || [];
        if (found.title || found.festival_name) displayTitle = found.title || found.festival_name;
        if (found.description) displayLede = found.description;
      }
    } else if (group === "season") {
      const seasons = await getSeasons();
      const found = seasons.find((s) => slugify(s.season) === slug || slugify(s.name) === slug);
      if (found) {
        curatedMovieIds = found.movies || [];
        if (found.name || found.season) displayTitle = found.name || found.season;
        if (found.description) displayLede = found.description;
      }
    }
  } catch (e) {
    console.error("Failed to load curation categories from backend:", e);
  }

  let movies: any[] = [];
  try {
    const allMovies = await getMovies();
    const resolved = await Promise.all(
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
    movies = resolved.filter((m) => m !== null);
  } catch (e) {
    console.error("Failed to resolve curation movies detail:", e);
    movies = [];
  }

  return (
    <div className="ed-page">
      <PageHeader eyebrow={collection.eyebrow} title={displayTitle} lede={displayLede} />
      <section className="ed-section">
        <div className="ed-container">
          <MovieGrid
            movies={movies}
            emptyMessage="There are no films curated for this category yet. Check back shortly!"
          />
        </div>
      </section>
    </div>
  );
}
