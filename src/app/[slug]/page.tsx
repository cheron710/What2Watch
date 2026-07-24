import { Metadata } from "next";
import { notFound } from "next/navigation";
import CinemaByExperiencePage from "../customer/CinemaByExperiencePage";
import EmotionalSpectrumPage from "../customer/EmotionalSpectrumPage";
import FestivalSeasonPage from "../customer/FestivalSeasonPage";
import GriefHelperPage from "../customer/GriefHelperPage";
import GuillaumePage from "../customer/GuillaumePage";
import KidsPage from "../customer/KidsPage";
import StaffPicksPage from "../customer/StaffPicksPage";
import WatchWithSomeonePage from "../customer/WatchWithSomeonePage";
import { getKids, getSeasons, getMovies } from "@/services/adminService";

export const revalidate = 0; // Fetch fresh backend data on every request

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  switch (slug) {
    case "cinema-by-experience":
      return {
        title: "Cinema by Experience — What2Watch",
        description: "Discover films by craft: visual poetry, plot twists, adrenaline, and more.",
      };
    case "emotional-spectrum":
      return {
        title: "The Emotional Spectrum — What2Watch",
        description: "Discover films by feeling — from pure joy to luminous melancholy.",
      };
    case "festival-season":
      return {
        title: "Festival Season — What2Watch",
        description: "Where cinema is redefined — the acclaimed films of Cannes, Venice, Sundance, and Berlin.",
      };
    case "grief-helper":
      return {
        title: "The Grief Companion — What2Watch",
        description: "Gentle films for hard seasons — company for grief, not a cure for it.",
      };
    case "guillaume":
      return {
        title: "Your Film Concierge — Guillaume",
        description: "Tell me your mood, your occasion, or simply what you feel like. I'll find the right film.",
      };
    case "kids":
      return {
        title: "Kids Corner — What2Watch",
        description: "Magical adventures, funny friends, and stories that stay with you forever 🌟",
      };
    case "staff-picks":
      return {
        title: "Staff Picks — What2Watch",
        description: "Hand-picked films from the What2Watch team and invited critics and filmmakers.",
      };
    case "watch-with-someone":
      return {
        title: "Watch with Someone — What2Watch",
        description: "Films that matter most are the ones we watch together. They become part of our shared memory.",
      };
    default:
      return {};
  }
}

export async function generateStaticParams() {
  return [
    { slug: "cinema-by-experience" },
    { slug: "emotional-spectrum" },
    { slug: "festival-season" },
    { slug: "grief-helper" },
    { slug: "guillaume" },
    { slug: "kids" },
    { slug: "staff-picks" },
    { slug: "watch-with-someone" },
  ];
}

export default async function DynamicCustomerPage({ params }: Props) {
  const { slug } = await params;
  switch (slug) {
    case "cinema-by-experience":
      return <CinemaByExperiencePage />;
    case "emotional-spectrum":
      return <EmotionalSpectrumPage />;
    case "festival-season":
      return <FestivalSeasonPage />;
    case "grief-helper":
      return <GriefHelperPage />;
    case "guillaume":
      return <GuillaumePage />;
    case "kids": {
      const [categories, allMovies] = await Promise.all([getKids(), getMovies()]);
      return <KidsPage initialCategories={categories} allMovies={allMovies} />;
    }
    case "staff-picks":
      return <StaffPicksPage />;
    case "watch-with-someone": {
      const [seasons, allMovies] = await Promise.all([getSeasons(), getMovies()]);
      return <WatchWithSomeonePage initialSeasons={seasons} allMovies={allMovies} />;
    }
    default:
      notFound();
  }
}
