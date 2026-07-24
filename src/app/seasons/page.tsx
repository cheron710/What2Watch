import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import CollectionHub from "@/components/discovery/CollectionHub";
import { SEASONS } from "@/lib/discovery/collections";

export const metadata: Metadata = {
  title: "Seasonal Collections — What2Watch",
  description: "Films for the time of year — summer, fall, winter, and spring.",
};

export default function SeasonsPage() {
  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Seasonal Collections"
        title={<>Films for the Season</>}
        lede={
          <>
            Cinema keeps time with the calendar. Pick a season and settle into films that match
            its light and its mood — or plan a night around{" "}
            <Link href="/watch-with-someone" className="ed-link">who you&apos;re watching with</Link>.
          </>
        }
      />
      <section className="ed-section">
        <div className="ed-container">
          <CollectionHub group="season" collections={SEASONS} />
        </div>
      </section>
    </div>
  );
}
