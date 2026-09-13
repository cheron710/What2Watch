/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tmdbImageUrl } from "@/lib/tmdb/client";

interface HeroSectionProps {
  initialMovies?: any[];
}

export default function HeroSection({ initialMovies = [] }: HeroSectionProps) {
  const router = useRouter();

  const heroFilms = initialMovies.length > 0
    ? initialMovies.map(m => {
        const rawBg = m.backdrop_path || m.poster_path;
        const bgUrl = rawBg
          ? (rawBg.startsWith("http") ? rawBg : tmdbImageUrl(rawBg, "w1280"))
          : "";

        const ratingVal = m.vote_average
          ? Number(m.vote_average).toFixed(1)
          : (m.recommendation_score ? (Number(m.recommendation_score) / 10).toFixed(1) : null);

        return {
          id: m.id,
          title: m.title,
          year: m.release_date ? m.release_date.split("-")[0] : "N/A",
          director: m.director || "Various",
          rating: ratingVal,
          bg: bgUrl
        };
      })
    : [];

  const [activeFilm, setActiveFilm] = useState(heroFilms[0] || null);
  const [bgSrc, setBgSrc] = useState(heroFilms[0]?.bg || "");
  const [bgOpacity, setBgOpacity] = useState(0.55);

  // Sync state if heroFilms changes (e.g. on client hydration or dynamic uploads)
  const [lastFilms, setLastFilms] = useState<any[]>([]);
  if (JSON.stringify(heroFilms) !== JSON.stringify(lastFilms)) {
    setLastFilms(heroFilms);
    if (heroFilms.length > 0) {
      setActiveFilm(heroFilms[0]);
      setBgSrc(heroFilms[0]?.bg || "");
    }
  }

  const handleMouseEnter = (film: typeof heroFilms[0]) => {
    if (activeFilm?.title !== film.title) {
      setActiveFilm(film);
      setBgOpacity(0);
      setTimeout(() => {
        setBgSrc(film.bg);
        setBgOpacity(0.55);
      }, 200);
    }
  };

  const handleFilmClick = (film: typeof heroFilms[0]) => {
    handleMouseEnter(film);
    if (film.id) {
      router.push(`/movie/${film.id}`);
    }
  };

  // Empty state — no movies imported yet
  if (heroFilms.length === 0) {
    return (
      <section id="hero" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div className="grain-bg hero-grain"></div>
        <div style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>
          <p style={{ fontSize: "1.1rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem", color: "var(--color-ink-3)" }}>
            Spotlight is empty
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--color-ink-3)" }}>
            Import movies from TMDB and mark them as Hero Spotlight in the admin panel.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="hero">
      <img
        id="hero-bg"
        src={bgSrc}
        alt=""
        style={{ opacity: bgOpacity }}
      />
      <div className="hero-vig"></div>
      <div className="hero-bot"></div>
      <div className="grain-bg hero-grain"></div>

      <div className="hero-inner">
        <p className="hero-eyebrow">Most Watched · Curated For You</p>
        <ul className="hero-list">
          {heroFilms.map((film, i) => {
            const isLive = activeFilm?.title === film.title;
            return (
              <li
                key={film.title}
                className={`hero-item ${isLive ? "live" : ""}`}
                onMouseEnter={() => handleMouseEnter(film)}
                onClick={() => handleFilmClick(film)}
              >
                <span className="hero-index">{String(i + 1).padStart(2, "0")}</span>
                <div className="hero-body">
                  <h2 className="hero-title">
                    {film.id ? (
                      <Link href={`/movie/${film.id}`} onClick={(e) => e.stopPropagation()}>
                        {film.title}
                      </Link>
                    ) : (
                      film.title
                    )}
                  </h2>
                  <div className="hero-meta">
                    <span className="hero-meta-yr">{film.year}</span>
                    <div className="hero-meta-dot"></div>
                    <span className="hero-meta-dir">{film.director}</span>
                    {film.rating && (
                      <>
                        <div className="hero-meta-dot"></div>
                        <span className="hero-meta-rating" style={{ color: "#ffb703", fontWeight: 700 }}>
                          ★ {film.rating}
                        </span>
                      </>
                    )}
                    {film.id && (
                      <>
                        <div className="hero-meta-dot"></div>
                        <Link
                          href={`/movie/${film.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hero-meta-explore text-[var(--color-accent)] font-semibold hover:underline flex items-center gap-1"
                        >
                          Explore Film →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <a href="#picks" className="hero-scrollcue" aria-label="Scroll to picks">
        <span>Scroll</span>
        <span className="cue-line" aria-hidden="true"></span>
      </a>
    </section>
  );
}
