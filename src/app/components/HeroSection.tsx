/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { tmdbImageUrl } from "@/lib/tmdb/client";

const DEFAULT_HERO_FILMS = [
  {
    title: "Oppenheimer",
    year: "2023",
    director: "Christopher Nolan",
    bg: "https://images5.alphacoders.com/125/thumb-1920-1257951.jpeg"
  },
  {
    title: "Nosferatu",
    year: "2024",
    director: "Robert Eggers",
    bg: "https://www.sky.de/static/img/filmhighlights/nosferatu_szenenbild_sky-news_250623.jpg?impolicy=p_cm05"
  },
  {
    title: "Dunkirk",
    year: "2017",
    director: "Christopher Nolan",
    bg: "https://wallpapercat.com/w/full/f/5/a/2073638-2000x1459-desktop-hd-dunkirk-2017-wallpaper.jpg"
  },
  {
    title: "Barbie",
    year: "2023",
    director: "Greta Gerwig",
    bg: "https://images5.alphacoders.com/132/thumb-1920-1322560.jpeg"
  }
];

interface HeroSectionProps {
  initialMovies?: any[];
}

export default function HeroSection({ initialMovies = [] }: HeroSectionProps) {
  const heroFilms = initialMovies.length > 0
    ? initialMovies.map(m => ({
        title: m.title,
        year: m.release_date ? m.release_date.split("-")[0] : "N/A",
        director: m.director || "Various",
        bg: m.backdrop_path ? (m.backdrop_path.startsWith("http") ? m.backdrop_path : tmdbImageUrl(m.backdrop_path, "w1280")) : "/placeholder-backdrop.svg"
      }))
    : DEFAULT_HERO_FILMS;

  const [activeFilm, setActiveFilm] = useState(heroFilms[0] || DEFAULT_HERO_FILMS[0]);
  const [bgSrc, setBgSrc] = useState(heroFilms[0]?.bg || DEFAULT_HERO_FILMS[0].bg);
  const [bgOpacity, setBgOpacity] = useState(0.55);

  // Sync state if heroFilms changes (e.g. on client hydration or dynamic uploads)
  const [lastFilms, setLastFilms] = useState<any[]>([]);
  if (JSON.stringify(heroFilms) !== JSON.stringify(lastFilms)) {
    setLastFilms(heroFilms);
    setActiveFilm(heroFilms[0] || DEFAULT_HERO_FILMS[0]);
    setBgSrc(heroFilms[0]?.bg || DEFAULT_HERO_FILMS[0].bg);
  }

  const handleMouseEnter = (film: typeof heroFilms[0]) => {
    setActiveFilm(film);
    setBgOpacity(0);
    setTimeout(() => {
      setBgSrc(film.bg);
      setBgOpacity(0.55);
    }, 200);
  };

  if (heroFilms.length === 0) return null;

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
      <div className="grain-bg absolute inset-0 z-10 w-full h-full"></div>
      
      <div className="hero-inner">
        <p className="hero-eyebrow">Most Watched · Curated For You</p>
        <ul className="hero-list">
          {heroFilms.map((film) => (
            <li
              key={film.title}
              className={`hero-item ${activeFilm.title === film.title ? 'live' : ''}`}
              onMouseEnter={() => handleMouseEnter(film)}
            >
              <h2>{film.title}</h2>
              <div className="hero-meta">
                <span className="hero-meta-yr">{film.year}</span>
                <div className="hero-meta-dot"></div>
                <span className="hero-meta-dir">{film.director}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
