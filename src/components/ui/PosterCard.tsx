import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb/client";
import "./posterCard.css";

/** Minimal, null-tolerant shape a poster needs — satisfied by both TMDb
 *  results and cached DB movie rows. */
export interface PosterMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
}

interface PosterCardProps {
  movie: PosterMovie;
  /** Optional editorial reason (e.g. recommendation explanation). */
  reason?: string;
  priority?: boolean;
}

/**
 * A single movie poster tile linking to /movie/[id]. TMDb-backed and used by
 * every grid / carousel on the platform so poster styling stays consistent.
 */
export default function PosterCard({ movie, reason, priority = false }: PosterCardProps) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <Link href={`/movie/${movie.id}`} className="poster-card" aria-label={movie.title}>
      <div className="poster-frame">
        <Image
          src={tmdbImageUrl(movie.poster_path, "w500")}
          alt={`${movie.title} poster`}
          fill
          sizes="(max-width: 620px) 45vw, (max-width: 900px) 30vw, 220px"
          className="poster-img"
          priority={priority}
        />
        {rating && (
          <span className="poster-rating" aria-label={`Rating ${rating} out of 10`}>
            ★ {rating}
          </span>
        )}
      </div>
      <div className="poster-meta">
        <span className="poster-title">{movie.title}</span>
        <span className="poster-year">{year}</span>
      </div>
      {reason && <p className="poster-reason">{reason}</p>}
    </Link>
  );
}
