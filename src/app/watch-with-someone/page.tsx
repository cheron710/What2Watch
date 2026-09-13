import type { Metadata } from "next";
import WatchWithSomeonePage from "@/app/customer/WatchWithSomeonePage";
import { getSeasons, getMovies } from "@/services/adminService";

export const revalidate = 0; // Fetch fresh backend data on every request

export const metadata: Metadata = {
  title: "Watch with Someone — What2Watch",
  description: "Films that matter most are the ones we watch together. Curated by Greta Gerwig.",
};

export default async function WatchWithSomeoneRoutePage() {
  const [seasons, allMovies] = await Promise.all([getSeasons(), getMovies()]);
  return <WatchWithSomeonePage initialSeasons={seasons} allMovies={allMovies} />;
}
