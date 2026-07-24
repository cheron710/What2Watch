import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { getRecommendationHistory } from "@/services/library";
import { tmdbImageUrl } from "@/lib/tmdb/client";
import PageHeader from "@/components/ui/PageHeader";
import "./history.css";

export const metadata: Metadata = { title: "Recommendation History — What2Watch" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/history");

  const history = await getRecommendationHistory(user.id);

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Recommendation History"
        title={<>What we&apos;ve suggested</>}
        lede={
          history.length
            ? "A record of the films What2Watch has put in front of you, and why."
            : "As you explore and Guillaume gets to know your taste, your recommendation history will appear here."
        }
      />
      <section className="ed-section">
        <div className="ed-container">
          {history.length === 0 ? (
            <div>
              <p className="movie-grid-empty">No recommendations recorded yet.</p>
              <Link href="/guillaume" className="ed-btn" style={{ marginTop: 8 }}>
                Ask Guillaume for a film
              </Link>
            </div>
          ) : (
            <ul className="hist-list">
              {history.map((h) => (
                <li key={h.id} className="hist-row">
                  <Link href={`/movie/${h.movie.id}`} className="hist-poster">
                    <Image
                      src={tmdbImageUrl(h.movie.poster_path, "w185")}
                      alt={h.movie.title}
                      fill
                      sizes="64px"
                    />
                  </Link>
                  <div className="hist-body">
                    <Link href={`/movie/${h.movie.id}`} className="hist-title">
                      {h.movie.title}
                    </Link>
                    {h.reason && <p className="hist-reason">{h.reason}</p>}
                  </div>
                  <div className="hist-meta">
                    <span className="hist-source">{h.source}</span>
                    <span className="hist-date">{formatDate(h.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
