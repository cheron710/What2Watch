"use client";

import { useState } from "react";
import Link from "next/link";

interface SpectrumCategory {
  id: string;
  label: string;
  color: string;
  leftDir: string;
  rightDir: string;
  matchKeywords: string[];
}

const CATEGORIES: SpectrumCategory[] = [
  { 
    id: "joy", 
    label: "Pure Joy", 
    color: "#DFA15A", 
    leftDir: "JOYFUL · WARM · LIGHT →", 
    rightDir: "HEAVY · COLD · GRIEF →", 
    matchKeywords: ["joy", "pure joy", "happy", "whimsical", "warm", "delight"] 
  },
  { 
    id: "hopeful", 
    label: "Hopeful", 
    color: "#8FAF6B", 
    leftDir: "BRIGHT · OPEN · WARM →", 
    rightDir: "DARK · CLOSED · COLD →", 
    matchKeywords: ["hope", "hopeful", "inspiring", "uplifting", "cathartic", "becoming"] 
  },
  { 
    id: "easygoing", 
    label: "Easygoing", 
    color: "#D6C3A3", 
    leftDir: "CALM · GENTLE · LIGHT →", 
    rightDir: "INTENSE · SHARP · HEAVY →", 
    matchKeywords: ["easygoing", "calm", "gentle", "unhurried", "atmosphere", "relaxation"] 
  },
  { 
    id: "intriguing", 
    label: "Intriguing", 
    color: "#5C6E91", 
    leftDir: "CURIOUS · MYSTERIOUS · COOL →", 
    rightDir: "FAMILIAR · WARM · SIMPLE →", 
    matchKeywords: ["intriguing", "mystery", "mysterious", "mind-bending", "puzzle", "cerebral"] 
  },
  { 
    id: "tense", 
    label: "Tense", 
    color: "#A23B2A", 
    leftDir: "SHARP · UNCOMFORTABLE · HEAVY →", 
    rightDir: "SOFT · CALM · LIGHT →", 
    matchKeywords: ["tense", "thriller", "suspense", "horror", "gripping", "uneasy", "panic"] 
  },
  { 
    id: "bittersweet", 
    label: "Bittersweet", 
    color: "#9A7A5A", 
    leftDir: "JOYFUL · WARM · LIGHT →", 
    rightDir: "HEAVY · COLD · GRIEF →", 
    matchKeywords: ["bittersweet", "romance", "drama", "longing", "ache", "tender"] 
  },
  { 
    id: "melancholy", 
    label: "Melancholy", 
    color: "#6F8FA8", 
    leftDir: "HEAVY · COLD · GRIEF →", 
    rightDir: "LIGHT · WARM · JOY →", 
    matchKeywords: ["melancholy", "grief", "sad", "luminous", "loss", "quiet"] 
  }
];

const DEFAULT_SPECTRUM_FILMS: Record<string, any[]> = {
  joy: [
    { id: 194, n: "01", t: "Amélie", d: "Jean-Pierre Jeunet · 2001", w: "Whimsy that cuts to the bone.", tags: ["Pure Joy", "Whimsical"], rating: "★ 8.3" },
    { id: 446807, n: "02", t: "Paddington 2", d: "Paul King · 2017", w: "Gentle, genuinely moving, defiantly kind.", tags: ["Pure Joy", "Warm"], rating: "★ 7.8" },
    { id: 120467, n: "03", t: "Grand Budapest Hotel", d: "Wes Anderson · 2014", w: "Nostalgia as a confection, melancholy disguised as beauty.", tags: ["Pure Joy", "Nostalgic"], rating: "★ 8.1" }
  ],
  hopeful: [
    { id: 116745, n: "01", t: "Secret Life of Walter Mitty", d: "Ben Stiller · 2013", w: "A permission slip to become yourself.", tags: ["Hopeful", "Adventure"], rating: "★ 7.3" },
    { id: 150540, n: "02", t: "Inside Out", d: "Pete Docter · 2015", w: "The wisdom to grieve and still move forward.", tags: ["Hopeful", "Cathartic"], rating: "★ 8.1" },
    { id: 773, n: "03", t: "Little Miss Sunshine", d: "Dayton/Faris · 2006", w: "A family held together by shared brokenness.", tags: ["Hopeful", "Quirky"], rating: "★ 7.8" }
  ],
  easygoing: [
    { id: 370665, n: "01", t: "Paterson", d: "Jim Jarmusch · 2016", w: "Rhythm and meditation in the everyday.", tags: ["Easygoing", "Gentle"], rating: "★ 7.5" },
    { id: 212778, n: "02", t: "Chef", d: "Jon Favreau · 2014", w: "Nourishment as metaphor, making things with your hands.", tags: ["Easygoing", "Warm"], rating: "★ 7.5" },
    { id: 76, n: "03", t: "Before Sunrise", d: "Richard Linklater · 1995", w: "Two strangers discovering each other through words.", tags: ["Easygoing", "Romantic"], rating: "★ 8.1" }
  ],
  intriguing: [
    { id: 329865, n: "01", t: "Arrival", d: "Denis Villeneuve · 2016", w: "Language, time, and sacrifice braided together.", tags: ["Intriguing", "Mind-bending"], rating: "★ 7.9" },
    { id: 264660, n: "02", t: "Ex Machina", d: "Alex Garland · 2014", w: "Desire and consciousness locked in a room.", tags: ["Intriguing", "Psychological"], rating: "★ 7.7" },
    { id: 1124, n: "03", t: "The Prestige", d: "Christopher Nolan · 2006", w: "Obsession willing to pay any price.", tags: ["Intriguing", "Twisty"], rating: "★ 8.2" }
  ],
  tense: [
    { id: 146233, n: "01", t: "Prisoners", d: "Denis Villeneuve · 2013", w: "Desperation corroding every principle you held.", tags: ["Tense", "Harrowing"], rating: "★ 8.1" },
    { id: 429203, n: "02", t: "Good Time", d: "Safdie Bros · 2017", w: "One night of pure, claustrophobic panic.", tags: ["Tense", "Raw"], rating: "★ 7.2" },
    { id: 6977, n: "03", t: "No Country for Old Men", d: "Coen Bros · 2007", w: "Evil arrives and the world slides sideways.", tags: ["Tense", "Bleak"], rating: "★ 8.1" }
  ],
  bittersweet: [
    { id: 313369, n: "01", t: "La La Land", d: "Damien Chazelle · 2016", w: "Beautiful things that cannot last.", tags: ["Bittersweet", "Romance"], rating: "★ 7.9" },
    { id: 492188, n: "02", t: "Marriage Story", d: "Noah Baumbach · 2019", w: "Love and endings occupying the same breath.", tags: ["Bittersweet", "Tender"], rating: "★ 7.8" },
    { id: 153, n: "03", t: "Lost in Translation", d: "Sofia Coppola · 2003", w: "Connection that the world dissolves come morning.", tags: ["Bittersweet", "Melancholy"], rating: "★ 7.7" }
  ],
  melancholy: [
    { id: 334543, n: "01", t: "Manchester by the Sea", d: "Kenneth Lonergan · 2016", w: "Grief that settles into your bones.", tags: ["Melancholy", "Grief"], rating: "★ 7.9" },
    { id: 376867, n: "02", t: "Moonlight", d: "Barry Jenkins · 2016", w: "A quiet demolition of the self, frame by frame.", tags: ["Melancholy", "Tender"], rating: "★ 7.4" },
    { id: 152601, n: "03", t: "Her", d: "Spike Jonze · 2013", w: "Loneliness so intimate it becomes beautiful.", tags: ["Melancholy", "Poignant"], rating: "★ 7.9" }
  ]
};

interface SpectrumSectionProps {
  initialMovies?: any[];
  initialEmotions?: any[];
}

export default function SpectrumSection({ initialMovies = [], initialEmotions = [] }: SpectrumSectionProps) {
  const [activeIndex, setActiveIndex] = useState(5); // Default to Bittersweet index 5 matching homefinal (4).html
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeCategory = CATEGORIES[activeIndex] || CATEGORIES[0];
  const step = 100 / CATEGORIES.length;

  // Check if backend database has explicit curation for this category
  const backendCat = initialEmotions.find(
    (e) => e.slug === activeCategory.id || e.name?.toLowerCase() === activeCategory.id || e.name?.toLowerCase() === activeCategory.label.toLowerCase()
  );

  let categoryMovies: any[] = [];

  if (backendCat && Array.isArray(backendCat.movies) && backendCat.movies.length > 0) {
    // Map curated movie IDs from backend emotion entity
    categoryMovies = backendCat.movies
      .map((mid: number) => initialMovies.find((m) => m.id === mid))
      .filter(Boolean);
  }

  if (categoryMovies.length === 0) {
    // Fallback: search initialMovies for matching emotional tags or keywords
    categoryMovies = initialMovies.filter((m) => {
      const tags = [
        ...(Array.isArray(m.emotional_tags) ? m.emotional_tags : []),
        ...(Array.isArray(m.craft_tags) ? m.craft_tags : []),
        ...(Array.isArray(m.genres) ? m.genres : []),
        m.primary_emotion,
        m.secondary_emotion,
        m.mood
      ].filter(Boolean).map((t: string) => String(t).toLowerCase());

      return activeCategory.matchKeywords.some((kw) =>
        tags.some((tag) => tag.includes(kw) || kw.includes(tag))
      );
    });
  }

  // Format movies to display
  let displayFilms: any[] = [];
  if (categoryMovies.length > 0) {
    displayFilms = categoryMovies.slice(0, 3).map((m, idx) => ({
      id: m.id,
      n: String(idx + 1).padStart(2, "0"),
      t: m.title,
      d: `${m.director || "Various"} · ${m.release_date ? m.release_date.split("-")[0] : "N/A"}`,
      w: m.custom_editorial_description || m.tagline || m.overview || "A curated cinematic experience.",
      tags: (Array.isArray(m.emotional_tags) && m.emotional_tags.length > 0)
        ? m.emotional_tags.slice(0, 2)
        : [activeCategory.label],
      rating: m.vote_average ? `★ ${Number(m.vote_average).toFixed(1)}` : "PG-13"
    }));
  } else {
    // Fall back to signature curated spectrum dataset from homefinal (4).html
    displayFilms = DEFAULT_SPECTRUM_FILMS[activeCategory.id] || DEFAULT_SPECTRUM_FILMS.bittersweet;
  }

  return (
    <section id="spectrum">
      <div className="spectrum-container">
        <div className="spectrum-intro" data-reveal="fade">
          <span className="spectrum-eyebrow">Find By Feeling</span>
          <h2 className="spectrum-h">The Mood Spectrum</h2>
          <p className="spectrum-sub">Move across the emotional spectrum. Every film finds its place.</p>
        </div>

        <div className="gradient-spectrum" id="gradientSpectrum">
          <div 
            id="gradActiveZone"
            className="grad-active-zone" 
            style={{ 
              left: `${activeIndex * step}%`, 
              width: `${step}%` 
            }} 
          />
        </div>

        <div className="spec-categories" id="specCategories">
          {CATEGORIES.map((cat, idx) => {
            const isDimmed = hoveredIndex !== null && hoveredIndex !== idx;
            const isActive = idx === activeIndex;
            
            return (
              <div 
                key={cat.id}
                className={`spec-item ${isActive ? 'active' : ''} ${isDimmed ? 'dim' : ''}`}
                style={{ color: cat.color }}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                data-index={idx}
              >
                <div className="spec-top">
                  <div className="spec-bar"></div>
                  <div className="spec-dot"></div>
                </div>
                <span className="spec-label">{cat.label}</span>
              </div>
            );
          })}
        </div>

        <div className="spec-direction-row">
          <div className="dir-label" id="dirLeft">{activeCategory.leftDir}</div>
          <div className="dir-label" id="dirRight">{activeCategory.rightDir}</div>
        </div>

        <div id="specFilms" className="spec-films">
          {displayFilms.map((f) => (
            <Link 
              key={`${f.t}-${f.id}`} 
              href={f.id ? `/movie/${f.id}` : `/search?q=${encodeURIComponent(f.t)}`} 
              className="film-row block"
            >
              <div className="film-n">{f.n}</div>
              <div>
                <div className="film-t">
                  {f.t} <span className="film-rating">{f.rating}</span>
                </div>
                <div className="film-d">{f.d}</div>
              </div>
              <div className="film-w">{f.w}</div>
              <div className="tag-stack">
                {f.tags.map((t: string, idx: number) => (
                  <span 
                    key={idx} 
                    style={{ 
                      border: `0.5px solid ${idx === 0 ? activeCategory.color : 'rgba(15,14,11,0.14)'}`,
                      color: idx === 0 ? activeCategory.color : 'var(--color-text-3)'
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="expand-link">
          <Link className="link-arrow" href={`/emotion/${activeCategory.id}`}>
            Explore {activeCategory.label} curations <span className="arw">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
