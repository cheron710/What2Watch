import PosterCard, { type PosterMovie } from "./PosterCard";
import "./movieGrid.css";

interface MovieGridProps {
  movies: (PosterMovie & { reason?: string })[];
  emptyMessage?: string;
}

/** Responsive poster grid reused by every discovery / listing page. */
export default function MovieGrid({ movies, emptyMessage = "No films to show yet." }: MovieGridProps) {
  if (movies.length === 0) {
    return <p className="movie-grid-empty">{emptyMessage}</p>;
  }
  return (
    <div className="movie-grid">
      {movies.map((m, i) => (
        <PosterCard key={m.id} movie={m} reason={m.reason} priority={i < 6} />
      ))}
    </div>
  );
}
