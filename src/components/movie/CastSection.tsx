"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export default function CastSection({ topCast }: { topCast: CastMember[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!topCast || topCast.length === 0) return null;

  return (
    <section className="mv-section">
      <div className="mv-cast-header">
        <span className="mv-section-label">Cast</span>
        <div className="mv-cast-nav">
          <span className="mv-cast-hint">Scroll</span>
          <button
            type="button"
            className="mv-cast-nav-btn"
            onClick={() => scroll("left")}
            aria-label="Scroll cast left"
            suppressHydrationWarning
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="mv-cast-nav-btn"
            onClick={() => scroll("right")}
            aria-label="Scroll cast right"
            suppressHydrationWarning
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mv-cast-grid" ref={scrollRef}>
        {topCast.map((c) => (
          <Link key={c.id} href={`/person/${c.id}`} className="mv-cast-card">
            <div className="mv-cast-photo">
              <Image
                src={tmdbImageUrl(c.profile_path, "w185")}
                alt={c.name}
                fill
                sizes="80px"
              />
            </div>
            <div className="mv-cast-name">{c.name}</div>
            <div className="mv-cast-role">{c.character}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
