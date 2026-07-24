"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { tmdbImageUrl } from "@/lib/tmdb/client";
import {
  removeFromWatchlist,
  removeFromFavorites,
  updateWatchlistStatus,
} from "@/app/actions/library";
import type { MovieRow } from "@/services/library";

type Kind = "watchlist" | "favorites";
type Status = "want_to_watch" | "watching" | "watched";

interface LibraryItemProps {
  movie: MovieRow;
  kind: Kind;
  status?: Status;
}

const STATUS_LABELS: Record<Status, string> = {
  want_to_watch: "Want to watch",
  watching: "Watching",
  watched: "Watched",
};

/** A library poster with inline remove and (for watchlist) status controls. */
export default function LibraryItem({ movie, kind, status }: LibraryItemProps) {
  const [removed, setRemoved] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status>(status ?? "want_to_watch");
  const [isPending, startTransition] = useTransition();

  if (removed) return null;

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";

  const onRemove = () => {
    setRemoved(true); // optimistic
    startTransition(async () => {
      const res =
        kind === "watchlist"
          ? await removeFromWatchlist(movie.id)
          : await removeFromFavorites(movie.id);
      if (!res.ok) setRemoved(false);
    });
  };

  const onStatusChange = (next: Status) => {
    setCurrentStatus(next);
    startTransition(async () => {
      await updateWatchlistStatus(movie.id, next);
    });
  };

  return (
    <div className="lib-item">
      <div className="lib-frame">
        <Link href={`/movie/${movie.id}`} aria-label={movie.title}>
          <Image
            src={tmdbImageUrl(movie.poster_path, "w500")}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 560px) 45vw, 200px"
            className="lib-img"
          />
        </Link>
        <button
          className="lib-remove"
          onClick={onRemove}
          disabled={isPending}
          aria-label={`Remove ${movie.title}`}
          title="Remove"
        >
          <X size={15} strokeWidth={2.4} />
        </button>
      </div>
      <Link href={`/movie/${movie.id}`} className="lib-title-link">
        <span className="lib-title">{movie.title}</span>
      </Link>
      <span className="lib-year">{year}</span>

      {kind === "watchlist" && (
        <select
          className="lib-status"
          value={currentStatus}
          onChange={(e) => onStatusChange(e.target.value as Status)}
          disabled={isPending}
          aria-label={`Status for ${movie.title}`}
        >
          {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
