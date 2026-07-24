import PageHeader from "@/components/ui/PageHeader";
import CollectionHub from "@/components/discovery/CollectionHub";
import { EXPERIENCES } from "@/lib/discovery/collections";

export default function CinemaByExperiencePage() {
  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Cinema by Experience"
        title={<>Discover by Craft</>}
        lede={
          <>
            Move beyond emotion. Choose the <em>experience</em> you&apos;re after — the composition,
            the twist, the built world — and find the films that deliver it best.
          </>
        }
      />
      <section className="ed-section">
        <div className="ed-container">
          <CollectionHub group="experience" collections={EXPERIENCES} />
        </div>
      </section>
    </div>
  );
}
