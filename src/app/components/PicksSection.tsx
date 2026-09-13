"use client";

import { useRef } from "react";
import MovieCard from "@/components/ui/MovieCard";
import { tmdbImageUrl } from "@/lib/tmdb/client";

interface PicksSectionProps {
  initialMovies?: any[];
}

export default function PicksSection({ initialMovies = [] }: PicksSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const carouselData = initialMovies.length > 0
    ? initialMovies.map(m => ({
        id: m.id,
        title: m.title,
        director: `${m.director || "Various"} · ${m.release_date ? m.release_date.split("-")[0] : "N/A"}`,
        quote: m.custom_editorial_description || m.tagline || m.overview || "Editorial pick.",
        tags: m.craft_tags?.slice(0, 1) || m.emotional_tags?.slice(0, 1) || ["Featured"],
        rating: m.vote_average ? `★ ${Number(m.vote_average).toFixed(1)}` : "PG-13",
        img: m.poster_path ? (m.poster_path.startsWith("http") ? m.poster_path : tmdbImageUrl(m.poster_path, "w500")) : "/placeholder-poster.svg"
      }))
    : [];

  const scrollBy = (amount: number) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (carouselData.length === 0) {
    return (
      <section id="picks">
        <div className="carousel-wrapper">
          <div className="sec-header" data-reveal="fade">
            <div className="sec-header-left">
              <span className="sec-label">This Week</span>
              <h2 className="sec-title">Picked for you</h2>
            </div>
            <div className="sec-divider"></div>
            <span className="sec-header-right">Curated Cinema</span>
          </div>
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--cream-dim, #999)" }}>
            <p style={{ fontFamily: "Cinzel, serif", fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              No Picks Available
            </p>
            <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              Import movies via the Admin panel to populate the weekly picks.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
            {carouselData.map((film: any, idx) => (
              <MovieCard 
                key={idx}
                id={film.id}
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
