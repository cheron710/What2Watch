import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getPerson, tmdbImageUrl, type TMDbMovie } from "@/lib/tmdb/client";
import PageHeader from "@/components/ui/PageHeader";
import MovieGrid from "@/components/ui/MovieGrid";
import "./person.css";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const person = await getPerson(Number(id));
    return { title: `${person.name} — What2Watch` };
  } catch {
    return { title: "Person — What2Watch" };
  }
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const personId = Number(id);
  if (!Number.isInteger(personId) || personId <= 0) notFound();

  let person;
  try {
    person = await getPerson(personId);
  } catch {
    notFound();
  }

  const isDirector = person.known_for_department === "Directing";
  const credits = person.combined_credits;
  const pool: TMDbMovie[] = [
    ...(credits?.crew?.filter((c) => c.job === "Director") ?? []),
    ...(credits?.cast ?? []),
  ]
    .filter((m) => m.poster_path && "title" in m)
    .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, 20);

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow={isDirector ? "Director" : person.known_for_department}
        title={<>{person.name}</>}
      />
      <section className="ed-section">
        <div className="ed-container person-layout">
          <div className="person-profile">
            <div className="person-photo">
              <Image
                src={tmdbImageUrl(person.profile_path, "w342")}
                alt={person.name}
                fill
                sizes="300px"
              />
            </div>
          </div>
          <div className="person-bio">
            {person.biography ? (
              <p className="ed-prose">
                {person.biography.split("\n\n").slice(0, 3).join("\n\n")}
              </p>
            ) : (
              <p className="ed-section-sub">No biography available yet.</p>
            )}
          </div>
        </div>
      </section>
      <section className="ed-section" style={{ paddingTop: 0 }}>
        <div className="ed-container">
          <span className="ed-section-label">Selected Filmography</span>
          <h2 className="ed-section-title" style={{ marginBottom: 32 }}>
            Notable Work
          </h2>
          <MovieGrid movies={pool} emptyMessage="No films to show yet." />
        </div>
      </section>
    </div>
  );
}
