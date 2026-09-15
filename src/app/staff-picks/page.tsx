import type { Metadata } from "next";
import StaffPicksPage from "@/app/customer/StaffPicksPage";

export const metadata: Metadata = {
  title: "Staff Picks — What2Watch",
  description:
    "Hand-picked films from the What2Watch Founder & Editor and master directors — Martin Scorsese, Christopher Nolan, Steven Spielberg, Akira Kurosawa, and Stanley Kubrick.",
};

export default function StaffPicksRoutePage() {
  return <StaffPicksPage />;
}
