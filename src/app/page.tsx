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

  // Filter visible hero spotlight movies — ONLY movies explicitly marked by Admin
  const heroMovies = allMovies.filter(
    (m) => (Boolean(m.is_homepage_hero) || Boolean(m.is_hero)) && m.visibility !== "hidden" && m.status !== "draft"
  ).slice(0, 4);

  // Filter visible featured movies
  const featuredMovies = allMovies.filter(
    (m) => Boolean(m.is_featured) && m.visibility !== "hidden" && m.status !== "draft"
  );

  // Filter visible movies for spectrum and other sections
  const visibleMovies = allMovies.filter(
    (m) => m.visibility !== "hidden" && m.status !== "draft"
  );

  return (
    <>
      {heroMovies.length > 0 && <HeroSection initialMovies={heroMovies} />}
      <PicksSection initialMovies={featuredMovies} />
      <SpectrumSection initialMovies={visibleMovies} initialEmotions={emotions} />
      <ExploreSection />
      <GuillaumeSection />
    </>
  );
}
