import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import CollectionHub from "@/components/discovery/CollectionHub";
import { SEASONS, Collection } from "@/lib/discovery/collections";
import { getSeasons } from "@/services/adminService";

export const metadata: Metadata = {
  title: "Seasonal Collections — What2Watch",
  description: "Films for the time of year — summer, fall, winter, and spring.",
};

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const SEASON_COLORS = ["#D4A537", "#A0714F", "#6BA3C8", "#7CB342", "#C9A96A", "#8FAF6B"];

export default async function SeasonsPage() {
  let collections: Collection[] = [...SEASONS];

  try {
    const adminSeasons = await getSeasons();
    const published = adminSeasons.filter((s) => s.is_published !== false);

    if (published.length > 0) {
      const dynamicCollections: Collection[] = published.map((s, i) => {
        const title = s.name || s.season || "Seasonal Cinema";
        const slug = slugify(title || s.season || s.id);
        const count = s.movies?.length || 0;
        return {
          slug,
          eyebrow: s.season ? `${s.season} Collection` : "Seasonal Collections",
          title,
          teaser: `${count} film${count === 1 ? "" : "s"} curated`,
          lede: s.description || `Special seasonal curation for ${s.season || "the platform"}.`,
          color: SEASON_COLORS[i % SEASON_COLORS.length],
          query: {},
        };
      });

      // Merge: append static seasons that aren't represented in dynamic collections
      const dynamicSlugs = new Set(dynamicCollections.map((c) => c.slug));
      const remainingStatic = SEASONS.filter((s) => !dynamicSlugs.has(s.slug));
      collections = [...dynamicCollections, ...remainingStatic];
    }
  } catch (e) {
    console.error("Failed to load admin season curations:", e);
  }

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
          <CollectionHub group="season" collections={collections} />
        </div>
      </section>
    </div>
  );
}
