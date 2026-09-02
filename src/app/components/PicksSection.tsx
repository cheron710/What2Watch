"use client";

import { useRef } from "react";
import MovieCard from "@/components/ui/MovieCard";
import { tmdbImageUrl } from "@/lib/tmdb/client";

const DEFAULT_CAROUSEL_DATA = [
  { title: "Michael", director: "Antoine Fuqua · 2026", quote: "The icon re-examined.", tags: ["Legacy"], rating: "R", img: "https://preview.redd.it/michael-2026-textless-v0-33ofespqktqg1.jpeg?width=1080&crop=smart&auto=webp&s=15039297a090658da5fed00cbd32233d1523911f" },
  { title: "Nosferatu", director: "Robert Eggers · 2024", quote: "A gothic nightmare.", tags: ["Horror"], rating: "R", img: "https://preview.redd.it/nosferatu-2024-textless-v0-1ow07comz23e1.jpeg?auto=webp&s=02016edee8382031a7ac0bcaf73733b25aac623e" },
  { title: "The Drama", director: "2026", quote: "Raw, unresolved.", tags: ["Raw"], rating: "PG-13", img: "https://preview.redd.it/the-drama-2026-v0-folpb9vr6v6g1.jpeg?width=1080&crop=smart&auto=webp&s=345a562ba67a84c340b89091463652b1a14dc699" },
  { title: "La La Land", director: "Damien Chazelle · 2016", quote: "Bittersweet.", tags: ["Romance"], rating: "PG-13", img: "https://wallpapercave.com/wp/wp7039123.jpg" },
  { title: "Lee Cronin's Mummy", director: "Lee Cronin · 2026", quote: "Ancient terror.", tags: ["Horror"], rating: "R", img: "https://preview.redd.it/lee-cronins-mummy-2026-imax-textless-v0-0a31y3m7h6vg1.jpeg?width=1080&crop=smart&auto=webp&s=ada9e8a0d4dc49666aa0e4e47653284b19ba34c9" },
  { title: "Moana", director: "Ron Clements · 2026", quote: "Voyage.", tags: ["Adventure"], rating: "PG", img: "https://preview.redd.it/moana-2026-textless-v0-n791r8yy0uqg1.jpeg?width=1080&crop=smart&auto=webp&s=ce65bfe3eea10b470a40644752b83f9873aa2aee" },
  { title: "Wake Up Dead Man", director: "Rian Johnson · 2025", quote: "Labyrinth of lies.", tags: ["Mystery"], rating: "PG-13", img: "https://preview.redd.it/wake-up-dead-man-a-knives-out-mystery-2025-textless-v0-l47pmh74v79g1.jpg?width=1080&crop=smart&auto=webp&s=f060836c6cafb8163c69fcbf239bc30978c99d0e" },
  { title: "Twinless", director: "2025", quote: "Meditation on loss.", tags: ["Drama"], rating: "R", img: "https://preview.redd.it/twinless-2025-textless-v0-tksgwxrr9aif1.jpeg?width=1080&crop=smart&auto=webp&s=70dddbd76d345538edf68fab7194540011d0a20c" },
  { title: "F1", director: "Joseph Kosinski · 2025", quote: "Speed and danger.", tags: ["Sports"], rating: "PG-13", img: "https://preview.redd.it/f1-2025-textless-v0-edtwi6v5cd0f1.jpg?width=1080&crop=smart&auto=webp&s=04c9bb575b6b1a26d308abee1f2148ae3c1530b8" },
  { title: "The Sound of Music", director: "Robert Wise · 1965", quote: "The hills are alive.", tags: ["Classic"], rating: "G", img: "https://preview.redd.it/the-sound-of-music-1965-60th-anniversary-textless-v0-3warmji0yzye1.jpeg?width=1080&crop=smart&auto=webp&s=1c27fcf3169f1be456e54134feaa49f42ddaf640" }
];

interface PicksSectionProps {
  initialMovies?: any[];
}

export default function PicksSection({ initialMovies = [] }: PicksSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const carouselData = initialMovies.length > 0
    ? initialMovies.map(m => ({
        title: m.title,
        director: `${m.director || "Various"} · ${m.release_date ? m.release_date.split("-")[0] : "N/A"}`,
        quote: m.custom_editorial_description || m.tagline || m.overview || "Editorial pick.",
        tags: m.craft_tags?.slice(0, 1) || m.emotional_tags?.slice(0, 1) || ["Featured"],
        rating: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "PG-13",
        img: m.poster_path ? (m.poster_path.startsWith("http") ? m.poster_path : tmdbImageUrl(m.poster_path, "w500")) : "/placeholder-poster.svg"
      }))
    : DEFAULT_CAROUSEL_DATA;

  const scrollBy = (amount: number) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section id="picks">
      <div className="carousel-wrapper">
        <div className="sec-header" data-reveal="fade">
          <div className="sec-header-left">
            <span className="sec-label">This Week</span>
            <h2 className="sec-title">Picked for you</h2>
          </div>
          <div className="sec-divider"></div>
          <span className="sec-header-right">Slide to explore</span>
        </div>
        
        <div className="carousel-container">
          <div className="carousel-track" ref={trackRef}>
            {carouselData.map((film, idx) => (
              <MovieCard 
                key={idx}
                index={idx}
                title={film.title}
                director={film.director}
                quote={film.quote}
                tags={film.tags}
                rating={film.rating}
                img={film.img}
              />
            ))}
          </div>
          
          <div className="carousel-nav">
            <button className="nav-btn" onClick={() => scrollBy(-340)} suppressHydrationWarning>←</button>
            <button className="nav-btn" onClick={() => scrollBy(340)} suppressHydrationWarning>→</button>
          </div>
          <div className="carousel-hint">
            ← slide or use arrows · cinematic discoveries →
          </div>
        </div>
      </div>
    </section>
  );
}
