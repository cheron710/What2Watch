"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Heart } from "lucide-react";
import {
  toggleWatchlist,
  toggleFavorite,
  type MovieSeedInput,
} from "@/app/actions/library";

interface SaveActionsProps {
  seed: MovieSeedInput;
  isAuthenticated: boolean;
  initialInWatchlist: boolean;
  initialInFavorites: boolean;
}

export default function SaveActions({
  seed,
  isAuthenticated,
  initialInWatchlist,
  initialInFavorites,
}: SaveActionsProps) {
  const router = useRouter();
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [inFavorites, setInFavorites] = useState(initialInFavorites);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const guard = () => {
    if (!isAuthenticated) {
      setMessage("Sign in to build your watchlist.");
      setTimeout(() => router.push("/login"), 900);
      return false;
    }
    return true;
  };

  const onWatchlist = () => {
    if (!guard()) return;
    const next = !inWatchlist;
    setInWatchlist(next); // optimistic
    startTransition(async () => {
      const res = await toggleWatchlist(seed);
      if (!res.ok) {
        setInWatchlist(!next);
        setMessage(res.error ?? "Something went wrong.");
      } else {
        setMessage(next ? "Added to your watchlist." : "Removed from watchlist.");
      }
    });
  };

  const onFavorite = () => {
    if (!guard()) return;
    const next = !inFavorites;
    setInFavorites(next); // optimistic
    startTransition(async () => {
      const res = await toggleFavorite(seed);
      if (!res.ok) {
        setInFavorites(!next);
        setMessage(res.error ?? "Something went wrong.");
      } else {
        setMessage(next ? "Added to favorites." : "Removed from favorites.");
      }
    });
  };

  return (
    <div className="mv-actions">
      <button
        className={`mv-action-btn ${inWatchlist ? "is-active" : ""}`}
        onClick={onWatchlist}
        disabled={isPending}
        aria-pressed={inWatchlist}
      >
        <Bookmark size={17} strokeWidth={1.6} fill={inWatchlist ? "currentColor" : "none"} />
        {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
      </button>
      <button
        className={`mv-action-btn mv-action-secondary ${inFavorites ? "is-active" : ""}`}
        onClick={onFavorite}
        disabled={isPending}
        aria-pressed={inFavorites}
      >
        <Heart size={17} strokeWidth={1.6} fill={inFavorites ? "currentColor" : "none"} />
        {inFavorites ? "Favorited" : "Favorite"}
      </button>
      {message && (
        <span className="mv-action-msg" role="status">
          {message}
        </span>
      )}
    </div>
  );
}
