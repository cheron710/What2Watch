"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb/client";
import "./experience.css";

export interface CraftMovieItem {
  t: string; // Title
  d: string; // Meta (Director & Year)
  w: string; // Craft note (Why)
  movieId?: number | null;
  posterPath?: string | null;
  voteAverage?: number | null;
}

export interface CraftMetaInfo {
  title: string;
  sub: string;
  look: string;
}

export interface CraftCategory {
  id: string;
  label: string;
  meta: CraftMetaInfo;
  items: CraftMovieItem[];
}

interface CinemaByExperienceClientProps {
  categories: CraftCategory[];
}

export default function CinemaByExperienceClient({ categories }: CinemaByExperienceClientProps) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id || "visual");

  const currentCategory = categories.find((c) => c.id === activeId) || categories[0];

  return (
    <div className="exp-page">
      {/* Hero Section */}
      <section className="craft-hero">
        <div className="craft-hero-inner">
          <span className="craft-eyebrow">Cinema by Experience</span>
          <h1 className="craft-display-h">Move beyond emotion.</h1>
          <p className="craft-lede">
            Not every film is chosen by how it makes you feel. Some are chosen for what they do —
            with a camera, a soundboard, a performance, or a story that turns on you.
          </p>
        </div>
      </section>

      {/* Main Craft Section */}
      <section className="craft-section">
        <div className="craft-wrap">
          {/* Category Tabs */}
          <div className="craft-categories" role="tablist" aria-label="Craft categories">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-pressed={c.id === activeId}
                aria-selected={c.id === activeId}
                className={`craft-cat ${c.id === activeId ? "active" : ""}`}
                onClick={() => setActiveId(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {currentCategory && (
            <>
              {/* Category Panel Header */}
              <div className="craft-panel-head">
                <h2 className="craft-panel-title">{currentCategory.meta.title}</h2>
                <p className="craft-panel-sub">{currentCategory.meta.sub}</p>
                <p className="craft-look">
                  <span>{currentCategory.meta.look}</span>
                </p>
              </div>

              {/* Craft Movies List */}
              <div className="craft-list">
                {currentCategory.items.map((item, idx) => {
                  const hasMovie = Boolean(item.movieId);

                  return (
                    <div key={`${currentCategory.id}-${item.t}-${idx}`} className="craft-row">
                      <div className="craft-num">{String(idx + 1).padStart(2, "0")}</div>

                      <div>
                        {hasMovie ? (
                          <Link
                            href={`/movie/${item.movieId}`}
                            className="craft-poster-link"
                            title={`View ${item.t}`}
                          >
                            <Image
                              src={tmdbImageUrl(item.posterPath ?? null, "w185")}
                              alt={item.t}
                              fill
                              sizes="60px"
                              className="craft-poster-img"
                            />
                            {item.voteAverage && item.voteAverage > 0 ? (
                              <span className="craft-rating-badge">
                                ★ {item.voteAverage.toFixed(1)}
                              </span>
                            ) : null}
                          </Link>
                        ) : (
                          <div className="craft-poster-link">
                            <div className="craft-poster-fallback">{item.t}</div>
                          </div>
                        )}
                      </div>

                      <div className="craft-movie-body">
                        {hasMovie ? (
                          <Link href={`/movie/${item.movieId}`} className="craft-title-link">
                            {item.t}
                          </Link>
                        ) : (
                          <div className="craft-title-text">{item.t}</div>
                        )}

                        <div className="craft-meta">
                          <span>{item.d}</span>
                          {hasMovie && <span className="craft-db-tag">TMDB Matched</span>}
                        </div>

                        <div className="craft-why">{item.w}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Bottom Cross Navigation */}
          <div className="craft-cross">
            <p>
              Looking for something more personal? Try the{" "}
              <Link href="/#spectrum">Mood Spectrum</Link> instead, or see what{" "}
              <Link href="/staff-picks">Staff Picks</Link> recommends.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
