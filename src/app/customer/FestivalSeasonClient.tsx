"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb/client";
import "./festival.css";

export interface FestivalRowData {
  year: string;
  title: string;
  meta: string;
  note: string;
  isGap?: boolean;
  movieId?: number | null;
  posterPath?: string | null;
  voteAverage?: number | null;
}

export interface AwardBodyData {
  id: string;
  tab: string;
  prize: string;
  body: string;
  city: string;
  since: string;
  blurb: string;
  rows: FestivalRowData[];
}

interface FestivalSeasonClientProps {
  awards: AwardBodyData[];
}

export default function FestivalSeasonClient({ awards }: FestivalSeasonClientProps) {
  const [activeId, setActiveId] = useState<string>(awards[0]?.id || "oscars");

  const currentAward = awards.find((a) => a.id === activeId) || awards[0];

  return (
    <div className="fest-page">
      {/* Hero Section */}
      <section className="fest-hero">
        <div className="fest-hero-inner">
          <span className="fest-eyebrow">Festival Season</span>
          <h1 className="fest-display-h">Ten years of the films juries couldn&apos;t ignore.</h1>
          <p className="fest-lede">
            Six awarding bodies, one decade, one top prize each. Not a hype list — a record of what
            the room decided, from the Croisette to the Dolby Theatre.
          </p>
        </div>
      </section>

      {/* Tabs Navigation Bar */}
      <div className="fest-tabs-wrap">
        <div className="fest-tabs" role="tablist" aria-label="Award bodies">
          {awards.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={a.id === activeId}
              className={`fest-tab ${a.id === activeId ? "active" : ""}`}
              onClick={() => setActiveId(a.id)}
            >
              {a.tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Award Content Panel */}
      <section className="fest-section">
        <div className="fest-panel" role="tabpanel" aria-live="polite">
          {currentAward && (
            <>
              <div className="fest-head">
                <div>
                  <h2 className="fest-prize">{currentAward.prize}</h2>
                  <p className="fest-blurb">{currentAward.blurb}</p>
                </div>
                <div className="fest-facts">
                  <div>{currentAward.body}</div>
                  <div>{currentAward.city}</div>
                  <div>{currentAward.since}</div>
                </div>
              </div>

              <div className="fest-rows">
                {currentAward.rows.map((row, idx) => {
                  const isGap = row.isGap || row.meta === "—";
                  const hasMovie = Boolean(row.movieId);

                  return (
                    <div
                      key={`${currentAward.id}-${row.year}-${idx}`}
                      className={`fest-row ${isGap ? "is-gap" : ""}`}
                    >
                      <div className="fest-year">{row.year}</div>

                      {!isGap && (
                        <div>
                          {hasMovie ? (
                            <Link
                              href={`/movie/${row.movieId}`}
                              className="fest-poster-link"
                              title={`View ${row.title}`}
                            >
                              <Image
                                src={tmdbImageUrl(row.posterPath ?? null, "w185")}
                                alt={row.title}
                                fill
                                sizes="72px"
                                className="fest-poster-img"
                              />
                              {row.voteAverage && row.voteAverage > 0 ? (
                                <span className="fest-rating-badge">
                                  ★ {row.voteAverage.toFixed(1)}
                                </span>
                              ) : null}
                            </Link>
                          ) : (
                            <div className="fest-poster-link bg-stone-300/40 flex items-center justify-center text-[10px] text-stone-500 font-bold">
                              No Pic
                            </div>
                          )}
                        </div>
                      )}

                      <div className="fest-movie-content">
                        {hasMovie ? (
                          <Link href={`/movie/${row.movieId}`} className="fest-title-link">
                            {row.title}
                          </Link>
                        ) : (
                          <div className="fest-title-text">{row.title}</div>
                        )}

                        {!isGap && (
                          <div className="fest-meta">
                            <span>{row.meta}</span>
                            {hasMovie && <span className="fest-db-tag">TMDB Matched</span>}
                          </div>
                        )}

                        <p className="fest-note">{row.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="fest-foot-note">
                Ten most recent editions · Year shown is the year of the ceremony
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
