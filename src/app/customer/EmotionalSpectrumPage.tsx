import PageHeader from "@/components/ui/PageHeader";
import CollectionHub from "@/components/discovery/CollectionHub";
import { EMOTIONS } from "@/lib/discovery/collections";

export default function EmotionalSpectrumPage() {
  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Find By Feeling"
        title={<>The Emotional Spectrum</>}
        lede={
          <>
            Forget genre for a moment. Start with how you want to <em>feel</em> — and let the
            catalogue arrange itself around that. Every film finds its place on the spectrum.
          </>
        }
      />
      <section className="ed-section">
        <div className="ed-container">
          <CollectionHub group="emotion" collections={EMOTIONS} />
        </div>
      </section>
    </div>
  );
}
