"use client";

import { useState, useTransition } from "react";
import { updatePreferences } from "@/app/actions/profile";
import { TMDB_GENRES } from "@/lib/tmdb/genres";
import "./settings.css";

interface SettingsFormProps {
  initial: {
    favourite_genre_ids: number[];
    min_rating: number | null;
    max_runtime_mins: number | null;
  };
}

const GENRE_ENTRIES = Object.entries(TMDB_GENRES).map(([id, name]) => ({
  id: Number(id),
  name,
}));

export default function SettingsForm({ initial }: SettingsFormProps) {
  const [genres, setGenres] = useState<number[]>(initial.favourite_genre_ids);
  const [minRating, setMinRating] = useState<number>(initial.min_rating ?? 0);
  const [maxRuntime, setMaxRuntime] = useState<number>(initial.max_runtime_mins ?? 240);
  const [note, setNote] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleGenre = (id: number) =>
    setGenres((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id].slice(0, 10)));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNote(null);
    startTransition(async () => {
      const res = await updatePreferences({
        favourite_genre_ids: genres,
        min_rating: minRating > 0 ? minRating : null,
        max_runtime_mins: maxRuntime < 240 ? maxRuntime : null,
      });
      setNote(
        res.ok
          ? { type: "ok", text: "Preferences saved." }
          : { type: "err", text: res.error ?? "Couldn't save." }
      );
    });
  };

  return (
    <form className="acct-form" onSubmit={onSubmit} style={{ maxWidth: 680 }}>
      <div className="acct-field">
        <label>Favourite genres</label>
        <span className="acct-field-hint">Pick up to 10. We&apos;ll lean into these across the platform.</span>
        <div className="set-genre-grid">
          {GENRE_ENTRIES.map((g) => (
            <button
              type="button"
              key={g.id}
              className={`set-genre-chip ${genres.includes(g.id) ? "on" : ""}`}
              onClick={() => toggleGenre(g.id)}
              aria-pressed={genres.includes(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div className="acct-field">
        <label htmlFor="s-rating">Minimum rating: {minRating > 0 ? minRating.toFixed(1) : "any"}</label>
        <input
          id="s-rating"
          type="range"
          min={0}
          max={9}
          step={0.5}
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="set-range"
        />
      </div>

      <div className="acct-field">
        <label htmlFor="s-runtime">
          Maximum runtime: {maxRuntime < 240 ? `${maxRuntime} min` : "no limit"}
        </label>
        <input
          id="s-runtime"
          type="range"
          min={60}
          max={240}
          step={10}
          value={maxRuntime}
          onChange={(e) => setMaxRuntime(Number(e.target.value))}
          className="set-range"
        />
      </div>

      <div>
        <button type="submit" className="ed-btn" disabled={isPending}>
          {isPending ? "Saving…" : "Save preferences"}
        </button>
        {note && <span className={`acct-note ${note.type}`} style={{ marginLeft: 14 }}>{note.text}</span>}
      </div>
    </form>
  );
}
