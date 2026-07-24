import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { getFavorites } from "@/services/library";
import PageHeader from "@/components/ui/PageHeader";
import LibraryItem from "@/components/library/LibraryItem";
import "@/components/library/library.css";

export const metadata: Metadata = { title: "Favorites — What2Watch" };

export default async function FavoritesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/favorites");

  const entries = await getFavorites(user.id);

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Your Favorites"
        title={<>The films you love</>}
        lede={
          entries.length
            ? `${entries.length} ${entries.length === 1 ? "film" : "films"} you've marked as favourites.`
            : "Heart a film anywhere on the platform and it will live here."
        }
      />
      <section className="ed-section">
        <div className="ed-container">
          {entries.length === 0 ? (
            <div>
              <p className="movie-grid-empty">You haven&apos;t favourited anything yet.</p>
              <Link href="/staff-picks" className="ed-btn" style={{ marginTop: 8 }}>
                Browse staff picks
              </Link>
            </div>
          ) : (
            <div className="lib-grid">
              {entries.map((e) => (
                <LibraryItem key={e.id} movie={e.movie} kind="favorites" />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
