import type { Metadata } from "next";
import FestivalSeasonPage from "@/app/customer/FestivalSeasonPage";

export const metadata: Metadata = {
  title: "Festival Season — What2Watch",
  description:
    "Ten years of top prizes from the Academy Awards, Cannes, Venice, Berlin, BAFTA and the Golden Globes — the films the juries chose, and why they hold up.",
};

export default function FestivalSeasonRoutePage() {
  return <FestivalSeasonPage />;
}
