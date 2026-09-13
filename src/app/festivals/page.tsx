import type { Metadata } from "next";
import FestivalSeasonPage from "@/app/customer/FestivalSeasonPage";

export const metadata: Metadata = {
  title: "Festival Season — What2Watch",
  description: "Where cinema is redefined — the acclaimed films of Cannes, Venice, Sundance, and Berlin.",
};

export default function FestivalsRoutePage() {
  return <FestivalSeasonPage />;
}
