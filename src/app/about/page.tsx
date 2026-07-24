import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "About — What2Watch",
  description: "Why What2Watch exists: reducing decision fatigue and returning cinema to the centre of the night.",
};

const PRINCIPLES = [
  {
    n: "01",
    title: "Feeling before filtering",
    body: "Most platforms ask what genre you want. We ask how you want to feel, who you're with, and what kind of night it is. The film follows from there.",
  },
  {
    n: "02",
    title: "Curation you can trust",
    body: "Every recommendation carries a reason. No black boxes, no engagement traps — just a clear, human explanation of why a film belongs in front of you.",
  },
  {
    n: "03",
    title: "A magazine, not a menu",
    body: "We treat cinema with the editorial care of a good film journal. Typography, restraint, and respect for the work — because how you discover a film shapes how you watch it.",
  },
];

export default function AboutPage() {
  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="About What2Watch"
        title={<>We built a cure for the scroll</>}
        lede={
          <>
            The average viewer spends longer choosing a film than they&apos;d like to admit. What2Watch
            exists to end that — to make the decision feel like <em>anticipation</em> again, not a chore.
          </>
        }
      />

      <section className="ed-section">
        <div className="ed-container">
          <div className="ed-prose">
            <p>
              We are a discovery platform for people who love film and are tired of infinite libraries
              that somehow contain nothing to watch. Instead of another endless grid, What2Watch offers
              a set of doorways — mood, emotion, viewing context, craft, festival recognition, and human
              curation — each one a genuinely different way to find your next great night in.
            </p>
            <h2>The problem with abundance</h2>
            <p>
              Choice was supposed to be liberating. In practice, unlimited choice with no editorial point
              of view produces fatigue, defaults, and the same five films on a loop. We think the answer
              isn&apos;t more content or a smarter feed — it&apos;s a better question. Not <em>“what&apos;s trending?”</em>{" "}
              but <em>“what do you need tonight?”</em>
            </p>
            <h2>What we believe</h2>
          </div>

          <div className="ed-grid ed-grid-3" style={{ marginTop: 36 }}>
            {PRINCIPLES.map((p) => (
              <article key={p.n} className="ed-card">
                <div className="ed-card-num">{p.n}</div>
                <h3 className="ed-card-title">{p.title}</h3>
                <p className="ed-card-body">{p.body}</p>
              </article>
            ))}
          </div>

          <div className="ed-prose" style={{ marginTop: 48 }}>
            <h2>Meet Guillaume</h2>
            <p>
              At the heart of the platform is Guillaume, our film concierge — an AI companion with the
              sensibility of a Parisian cinephile who has seen everything and judges nothing. Tell him
              your mood or your occasion and he&apos;ll find the film.{" "}
              <Link href="/guillaume">Start a conversation →</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
