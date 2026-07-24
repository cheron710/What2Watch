import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { getWatchlist } from "@/services/library";
import PageHeader from "@/components/ui/PageHeader";
import LibraryItem from "@/components/library/LibraryItem";
import "@/components/library/library.css";

export const metadata: Metadata = { title: "Watchlist — What2Watch" };

export default async function WatchlistPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/watchlist");

  const entries = await getWatchlist(user.id);

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Your Watchlist"
        title={<>Saved for later</>}
        lede={
          entries.length
            ? `${entries.length} ${entries.length === 1 ? "film" : "films"} waiting for the right night.`
            : "Nothing saved yet — the bookmark icon on any film adds it here."
        }
      />
      <section className="ed-section">
        <div className="ed-container">
          {entries.length === 0 ? (
            <div>
              <p className="movie-grid-empty">Your watchlist is empty.</p>
              <Link href="/emotional-spectrum" className="ed-btn" style={{ marginTop: 8 }}>
                Find something to watch
              </Link>
            </div>
          ) : (
            <div className="lib-grid">
              {entries.map((e) => (
                <LibraryItem key={e.id} movie={e.movie} kind="watchlist" status={e.status} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
