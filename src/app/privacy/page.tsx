import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy — What2Watch",
};

export default function PrivacyPage() {
  return (
    <div className="ed-page">
      <PageHeader eyebrow="Legal" title={<>Privacy Policy</>} lede={<>Last updated: 17 July 2026</>} />
      <section className="ed-section">
        <div className="ed-container">
          <div className="ed-prose">
            <p>
              What2Watch is a film-discovery platform. This policy explains what we collect, why, and
              the choices you have. We keep it short because we keep the data minimal.
            </p>
            <h2>What we collect</h2>
            <ul>
              <li><strong>Account data:</strong> your email and display name, used to sign you in and personalise recommendations.</li>
              <li><strong>Library data:</strong> the films you add to your watchlist or favourites, and your recommendation history.</li>
              <li><strong>Usage data:</strong> basic, aggregated analytics to understand which features help people find films.</li>
            </ul>
            <h2>What we don&apos;t do</h2>
            <p>
              We don&apos;t sell your data. We don&apos;t build advertising profiles. We don&apos;t share
              your library with third parties for marketing.
            </p>
            <h2>Third-party services</h2>
            <p>
              Film metadata is provided by The Movie Database (TMDb). Authentication and storage are
              handled by Supabase. Conversations with Guillaume are processed by our AI provider solely
              to generate a response. Each processes data under its own terms.
            </p>
            <h2>Your rights</h2>
            <p>
              You can view, export, or delete your account data at any time from your settings. Deleting
              your account removes your profile, watchlist, favourites, and history.
            </p>
            <h2>Contact</h2>
            <p>
              Questions about privacy? Email <a href="mailto:hello@what2watch.film">hello@what2watch.film</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
