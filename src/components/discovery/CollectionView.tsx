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
import { getMovieDetail, discover } from "@/lib/tmdb/client";

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
  const staticCollection = findCollection(group, slug);

  let curatedMovieIds: number[] = [];
  let displayTitle = staticCollection?.title || "";
  let displayLede = staticCollection?.lede || "";
  let displayEyebrow = staticCollection?.eyebrow || (group === "festival" ? "Festival Season" : group === "season" ? "Seasonal Collections" : "Curated Collection");
  let foundBackend = false;

  try {
    if (group === "emotion") {
      const emotions = await getEmotions();
      const found = emotions.find((e) => slugify(e.name) === slug || e.slug === slug || e.id === slug);
      if (found) {
        foundBackend = true;
        curatedMovieIds = found.movies || [];
        if (found.name) displayTitle = found.name;
        if (found.description) displayLede = found.description;
      }
    } else if (group === "experience") {
      const experiences = await getExperiences();
      const found = experiences.find((e) => slugify(e.name) === slug || slugify(e.experience_type || "") === slug || e.id === slug);
      if (found) {
        foundBackend = true;
        curatedMovieIds = found.movies || [];
        if (found.name) displayTitle = found.name;
        if (found.description) displayLede = found.description;
      }
    } else if (group === "festival") {
      const festivals = await getFestivals();
      const found = festivals.find((f) => 
        slugify(f.title || f.festival_name || "") === slug || 
        slugify(f.festival_name || "") === slug || 
        f.id === slug
      );
      if (found) {
        foundBackend = true;
        curatedMovieIds = found.movies || [];
        displayTitle = found.title || found.festival_name || "Festival Showcase";
        if (found.description) displayLede = found.description;
        if (found.festival_name) {
          displayEyebrow = `${found.festival_name} ${found.year || ""}`.trim();
        }
      }
    } else if (group === "season") {
      const seasons = await getSeasons();
      const found = seasons.find((s) => 
        slugify(s.name || s.season || "") === slug || 
        slugify(s.season || "") === slug || 
        s.id === slug
      );
      if (found) {
        foundBackend = true;
        curatedMovieIds = found.movies || [];
        displayTitle = found.name || found.season || "Seasonal Curation";
        if (found.description) displayLede = found.description;
        if (found.season) {
          displayEyebrow = `${found.season} Collection`;
        }
      }
    }
  } catch (e) {
    console.error("Failed to load curation categories from backend:", e);
  }

  if (!staticCollection && !foundBackend) {
    notFound();
  }

  const collection = staticCollection || {
    slug,
    eyebrow: displayEyebrow,
    title: displayTitle,
    teaser: "",
    lede: displayLede,
    color: "#B84200",
    query: {},
  };

  let movies: any[] = [];
  try {
    const allMovies = await getMovies();
    const hiddenOrDraftIds = new Set(
      allMovies.filter((m) => m.visibility === "hidden" || m.status === "draft").map((m) => m.id)
    );

    if (curatedMovieIds.length > 0) {
      const resolved = await Promise.all(
        curatedMovieIds.map(async (id) => {
          const local = allMovies.find((m) => m.id === id);
          if (local) {
            if (local.visibility === "hidden" || local.status === "draft") return null;
            return local;
          }
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
      movies = resolved.filter((m): m is NonNullable<typeof m> => m !== null);
    } else {
      try {
        const discData = await discover(collection.query);
        if (discData?.results) {
          movies = discData.results
            .filter((m: any) => !hiddenOrDraftIds.has(m.id) && (m.poster_path || m.release_date))
            .map((m: any) => {
              const dbMovie = allMovies.find((dm) => dm.id === m.id);
              return {
                id: m.id,
                title: dbMovie?.title || m.title,
                poster_path: dbMovie?.poster_path || m.poster_path,
                release_date: dbMovie?.release_date || m.release_date,
                vote_average: dbMovie?.vote_average ?? m.vote_average,
              };
            });
        }
      } catch (err) {
        console.warn("Fallback discovery fetch failed:", err);
      }
    }
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
