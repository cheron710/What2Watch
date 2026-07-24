import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Terms of Service — What2Watch",
};

export default function TermsPage() {
  return (
    <div className="ed-page">
      <PageHeader eyebrow="Legal" title={<>Terms of Service</>} lede={<>Last updated: 17 July 2026</>} />
      <section className="ed-section">
        <div className="ed-container">
          <div className="ed-prose">
            <p>
              By using What2Watch you agree to these terms. They&apos;re written to be readable, not to trap
              you — if anything is unclear, just ask.
            </p>
            <h2>Using the service</h2>
            <p>
              What2Watch is provided for personal, non-commercial film discovery. You agree not to
              misuse the platform, attempt to disrupt it, or scrape it at scale. You&apos;re responsible for
              activity under your account.
            </p>
            <h2>Your content</h2>
            <p>
              Your watchlist, favourites, and notes are yours. You grant us only the permission needed
              to store and display them back to you, and to power your recommendations.
            </p>
            <h2>Film data</h2>
            <p>
              Film metadata, posters, and imagery are provided by The Movie Database (TMDb) and their
              respective rights holders. What2Watch is not endorsed or certified by TMDb.
            </p>
            <h2>AI recommendations</h2>
            <p>
              Guillaume and our recommendation engine offer suggestions, not guarantees. They can be
              wrong, incomplete, or simply not to your taste. Use your judgement.
            </p>
            <h2>Availability</h2>
            <p>
              We aim to keep the service running smoothly but provide it “as is,” without warranty of
              uninterrupted availability. We may update or discontinue features over time.
            </p>
            <h2>Contact</h2>
            <p>
              Questions about these terms? Email <a href="mailto:hello@what2watch.film">hello@what2watch.film</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
