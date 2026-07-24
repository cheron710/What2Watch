import PageHeader from "@/components/ui/PageHeader";
import CollectionHub from "@/components/discovery/CollectionHub";
import { FESTIVALS } from "@/lib/discovery/collections";

export default function FestivalSeasonPage() {
  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Festival Season"
        title={<>Where Cinema Is Redefined</>}
        lede={
          <>
            The festivals are where the year&apos;s most ambitious films first meet an audience.
            Explore the acclaimed, the divisive, and the destined-for-the-canon — one
            programme at a time.
          </>
        }
      />
      <section className="ed-section">
        <div className="ed-container">
          <CollectionHub group="festival" collections={FESTIVALS} />
        </div>
      </section>
    </div>
  );
}
