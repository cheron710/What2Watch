import "./home.css";
import HeroSection from "./components/HeroSection";
import PicksSection from "./components/PicksSection";
import SpectrumSection from "./components/SpectrumSection";
import ExploreSection from "./components/ExploreSection";
import GuillaumeSection from "./components/GuillaumeSection";
import { getMovies, getEmotions } from "@/services/adminService";

export const revalidate = 0; // Fetch fresh backend data on every request
export const dynamic = "force-dynamic";

export default async function Home() {
  let allMovies: any[] = [];
  let emotions: any[] = [];
  try {
    const [moviesRes, emotionsRes] = await Promise.all([
      getMovies().catch(() => []),
      getEmotions().catch(() => []),
    ]);
    allMovies = moviesRes;
    emotions = emotionsRes;
  } catch (e) {
    console.error("Failed to load home page data from backend:", e);
  }

  // Filter visible hero spotlight movies
  let heroMovies = allMovies.filter(
    (m) => (Boolean(m.is_homepage_hero) || Boolean(m.is_hero)) && m.visibility !== "hidden" && m.status !== "draft"
  ).slice(0, 4);

  // Fallback: if fewer than 4 explicitly tagged as hero spotlight, append active DB movies
  if (heroMovies.length < 4 && allMovies.length > 0) {
    const existingIds = new Set(heroMovies.map((m) => String(m.id)));
    const additional = allMovies.filter(
      (m) => !existingIds.has(String(m.id)) && m.visibility !== "hidden" && m.status !== "draft"
    ).slice(0, 4 - heroMovies.length);
    heroMovies = [...heroMovies, ...additional];
  }

  // Filter visible featured movies
  const featuredMovies = allMovies.filter(
    (m) => (Boolean(m.is_featured) || Boolean(m.is_homepage_hero)) && m.visibility !== "hidden" && m.status !== "draft"
  );

  // Filter visible movies for spectrum and other sections
  const visibleMovies = allMovies.filter(
    (m) => m.visibility !== "hidden" && m.status !== "draft"
  );

  return (
    <>
      <HeroSection initialMovies={heroMovies} />
      <PicksSection initialMovies={featuredMovies} />
      <SpectrumSection initialMovies={visibleMovies} initialEmotions={emotions} />
      <ExploreSection />
      <GuillaumeSection />
    </>
  );
}
