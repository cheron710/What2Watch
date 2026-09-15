import type { Metadata } from "next";
import CinemaByExperiencePage from "@/app/customer/CinemaByExperiencePage";

export const metadata: Metadata = {
  title: "Cinema by Experience — What2Watch",
  description:
    "Films chosen for their craft — visual style, sound, performance, direction and story twists.",
};

export default function CinemaByExperienceRoutePage() {
  return <CinemaByExperiencePage />;
}
