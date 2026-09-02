import "./home.css";
import HeroSection from "./components/HeroSection";
import PicksSection from "./components/PicksSection";
import SpectrumSection from "./components/SpectrumSection";
import ExploreSection from "./components/ExploreSection";
import GuillaumeSection from "./components/GuillaumeSection";
import { getMovies } from "@/services/adminService";

export const revalidate = 0; // Fetch fresh backend data on every request

export default async function Home() {
  let allMovies: any[] = [];
  try {
    allMovies = await getMovies();
  } catch (e) {
    console.error("Failed to load home page movies from backend:", e);
  }

  // Filter visible hero movies
  const heroMovies = allMovies.filter(
    (m) => m.is_homepage_hero && m.visibility !== "hidden" && m.status !== "draft"
  ).slice(0, 4);
  // Filter visible featured movies
  const featuredMovies = allMovies.filter(
    (m) => m.is_featured && m.visibility !== "hidden" && m.status !== "draft"
  );

  return (
    <>
      <HeroSection initialMovies={heroMovies} />
      <PicksSection initialMovies={featuredMovies} />
      <SpectrumSection />
      <ExploreSection />
      <GuillaumeSection />
    </>
  );
}
