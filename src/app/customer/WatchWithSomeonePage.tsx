"use client";

import React, { useState, useRef, useCallback } from "react";
import "./watch.css";

// ─── Data ────────────────────────────────────────────────────────────────────
const MOVIES = {
  summer: [
    { t: "Call Me by Your Name", y: 2017, tags: ["date-night","solo-viewing"], note: "A slow-burn Italian summer that lingers in the chest." },
    { t: "La La Land", y: 2016, tags: ["date-night","friends-gathering"], note: "Golden-hour romance built for porch dancing afterward." },
    { t: "Mamma Mia!", y: 2008, tags: ["friends-gathering","family-movie"], note: "ABBA, an island, and absolutely no chill." },
    { t: "Jaws", y: 1975, tags: ["family-movie","friends-gathering"], note: "The reason nobody trusts the ocean anymore." },
    { t: "The Sandlot", y: 1993, tags: ["family-movie"], note: "Endless summer, in the best possible way." },
    { t: "Stand By Me", y: 1986, tags: ["friends-gathering","solo-viewing"], note: "Walking the tracks with the people who knew you first." },
    { t: "Dirty Dancing", y: 1987, tags: ["date-night","friends-gathering"], note: "Nobody puts this one in the corner." },
    { t: "Moonrise Kingdom", y: 2012, tags: ["family-movie","solo-viewing"], note: "Runaway love, told like a storybook." },
    { t: "Almost Famous", y: 2000, tags: ["friends-gathering","solo-viewing"], note: "A tour bus, a band, and the feeling of being almost there." },
    { t: "Palm Springs", y: 2020, tags: ["date-night","friends-gathering"], note: "A wedding day stuck on repeat, in the funniest way." },
  ],
  fall: [
    { t: "Dead Poets Society", y: 1989, tags: ["solo-viewing","family-movie"], note: "Carpe diem, with tissues nearby." },
    { t: "When Harry Met Sally...", y: 1989, tags: ["date-night","friends-gathering"], note: "The deli scene alone is worth the rewatch." },
    { t: "Knives Out", y: 2019, tags: ["friends-gathering","family-movie"], note: "A whodunit built for shouting theories at the screen." },
    { t: "Hocus Pocus", y: 1993, tags: ["family-movie","friends-gathering"], note: "Three witches, one candle, infinite rewatches." },
    { t: "Good Will Hunting", y: 1997, tags: ["solo-viewing","date-night"], note: "Equations on a chalkboard, feelings underneath." },
    { t: "You've Got Mail", y: 1998, tags: ["date-night"], note: "Email flirting before email flirting was a thing." },
    { t: "Coraline", y: 2009, tags: ["family-movie","solo-viewing"], note: "A button-eyed nightmare wrapped in stop-motion beauty." },
    { t: "Fantastic Mr. Fox", y: 2009, tags: ["family-movie","friends-gathering"], note: "Corduroy, autumn light, and a very good heist." },
    { t: "Practical Magic", y: 1998, tags: ["friends-gathering","date-night"], note: "Sisters, spells, and a midnight margarita ritual." },
    { t: "The Social Network", y: 2010, tags: ["solo-viewing","friends-gathering"], note: "Ambition with a soundtrack that hums under your skin." },
  ],
  winter: [
    { t: "Little Women", y: 2019, tags: ["family-movie","date-night"], note: "A fire crackling, four sisters, one impossible choice." },
    { t: "Carol", y: 2015, tags: ["date-night","solo-viewing"], note: "Longing, shot in the hush of a department-store winter." },
    { t: "The Holiday", y: 2006, tags: ["date-night","friends-gathering"], note: "Two women, two countries, one very good house swap." },
    { t: "Love Actually", y: 2003, tags: ["friends-gathering","family-movie"], note: "Eight stories, one airport, all the feelings." },
    { t: "Klaus", y: 2019, tags: ["family-movie"], note: "An origin story that earns every bit of its warmth." },
    { t: "Home Alone", y: 1990, tags: ["family-movie","friends-gathering"], note: "Booby traps as a love language." },
    { t: "A Christmas Story", y: 1983, tags: ["family-movie","friends-gathering"], note: "You'll shoot your eye out, kid." },
    { t: "In Bruges", y: 2008, tags: ["friends-gathering","solo-viewing"], note: "Hitmen, guilt, and a very scenic Belgian city." },
    { t: "Phantom Thread", y: 2017, tags: ["date-night","solo-viewing"], note: "Obsession, tailored within an inch of its life." },
    { t: "The Muppet Christmas Carol", y: 1992, tags: ["family-movie","friends-gathering"], note: "Dickens, but with felt and better singing." },
  ],
  spring: [
    { t: "The Secret Life of Walter Mitty", y: 2013, tags: ["solo-viewing","date-night"], note: "Daydreams that finally pack a bag." },
    { t: "Spirited Away", y: 2001, tags: ["family-movie","solo-viewing"], note: "A bathhouse full of spirits and one brave kid." },
    { t: "Paddington 2", y: 2017, tags: ["family-movie","friends-gathering"], note: "Kindness as a genuine plot device. Still flawless." },
    { t: "Pride & Prejudice", y: 2005, tags: ["date-night","family-movie"], note: "A hand-flex across a field that ruined other romances." },
    { t: "Crazy Rich Asians", y: 2018, tags: ["date-night","friends-gathering"], note: "A wedding, a fortune, and one unforgettable mahjong scene." },
    { t: "Booksmart", y: 2019, tags: ["friends-gathering","solo-viewing"], note: "One wild night before everything changes." },
    { t: "The Grand Budapest Hotel", y: 2014, tags: ["friends-gathering","family-movie"], note: "Pastry boxes, prison breaks, and Wes Anderson's pinkest film." },
    { t: "My Neighbor Totoro", y: 1988, tags: ["family-movie","solo-viewing"], note: "Soft, slow, and gently magical." },
    { t: "About Time", y: 2013, tags: ["date-night","family-movie"], note: "A love story that's secretly about fathers and time." },
    { t: "Sing Street", y: 2016, tags: ["friends-gathering","date-night"], note: "Falling in love by starting a band for the wrong reasons." },
  ],
} as const;

type Season = keyof typeof MOVIES;
type WithKey = "date-night" | "family-movie" | "friends-gathering" | "solo-viewing";

const SEASON_LABEL: Record<Season, string> = { summer: "Summer", fall: "Fall", winter: "Winter", spring: "Spring" };
const WITH_LABEL: Record<WithKey, string> = {
  "date-night": "Date Night",
  "family-movie": "Family Movie Night",
  "friends-gathering": "Friends Gathering",
  "solo-viewing": "Solo Viewing",
};
const CONTEXT_DESC: Record<Season, Record<WithKey, string>> = {
  summer: { "date-night": "Summer romance, tension under stars.", "family-movie": "Outdoor cinema vibes, adventure.", "friends-gathering": "Blockbuster energy, fun rewatches.", "solo-viewing": "Escapism, road-trip energy." },
  fall: { "date-night": "Cozy, intimate, crisp-weather romance.", "family-movie": "Gratitude-focused, warmth.", "friends-gathering": "Spooky, fun, ensemble.", "solo-viewing": "Introspection as leaves fall." },
  winter: { "date-night": "Snowed-in intimacy, New Year reflection.", "family-movie": "Traditions, multigenerational appeal.", "friends-gathering": "Holiday chaos, comedies, ensemble fun.", "solo-viewing": "Fireplace cinema, meditation." },
  spring: { "date-night": "Renewal, fresh starts, hope.", "family-movie": "Rebirth, adventure, growth.", "friends-gathering": "Outdoor hangouts, lighter tone.", "solo-viewing": "Personal transformation films." },
};

// ─── Season SVG icons ────────────────────────────────────────────────────────
const SeasonIcon = ({ season }: { season: Season }) => {
  if (season === "summer") return (
    <svg className="season-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>
    </svg>
  );
  if (season === "fall") return (
    <svg className="season-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 2c4 2 6 6 5 10-1 4-5 6-9 5C5 16 3 11 6 7c1.5-2 3.5-3.5 6-5z"/><path d="M12 8v13"/>
    </svg>
  );
  if (season === "winter") return (
    <svg className="season-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 2v20M4 7l16 10M20 7L4 17M3 12h18M6 4.5l2 2M16 17.5l2 2M18 4.5l-2 2M8 17.5l-2 2"/>
    </svg>
  );
  return (
    <svg className="season-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 12c0-3-2-5-5-5 0 3 2 5 5 5z"/><path d="M12 12c0-3 2-5 5-5 0 3-2 5-5 5z"/>
      <path d="M12 12c-3 0-5 2-5 5 3 0 5-2 5-5z"/><path d="M12 12c3 0 5 2 5 5-3 0-5-2-5-5z"/>
      <circle cx="12" cy="12" r="1.6"/>
    </svg>
  );
};

// ─── Arrow SVG ───────────────────────────────────────────────────────────────
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

// ─── Weather FX ──────────────────────────────────────────────────────────────
const FX_CONFIG = {
  winter: { cls: "fx-snow", count: 64, size: [6, 15], dur: [8, 15] },
  fall:   { cls: "fx-leaf", count: 40, size: [16, 28], dur: [9, 16] },
  spring: { cls: "fx-petal", count: 34, size: [13, 22], dur: [10, 17] },
  summer: { cls: "fx-mote", count: 44, size: [5, 11], dur: [6, 11] },
};
const LEAF_COLORS = ["#a0714f","#c9622e","#d4a537","#8b4a2b","#b5651d"];
const PETAL_COLORS = ["#f0a8c0","#f6c9d8","#ffffff","#eb95b3"];

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Movie Card ───────────────────────────────────────────────────────────────
interface MovieEntry { t: string; y: number; tags: readonly string[]; note: string; }

function MovieCardW({ movie, delay }: { movie: MovieEntry; delay: number }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  React.useEffect(() => {
    const q = encodeURIComponent(`${movie.t} ${movie.y} film`);
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${q}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=600&origin=*`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const pages = data?.query?.pages;
        const src = pages ? Object.values(pages as Record<string, { thumbnail?: { source: string } }>)[0]?.thumbnail?.source : null;
        if (src) { setImgSrc(src); setStatus("loaded"); }
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [movie.t, movie.y]);

  return (
    <div className="movie-card-w" style={{ animationDelay: `${delay}ms` }}>
      <div className="movie-poster-wrap">
        {status === "loading" && <div className="poster-skeleton" />}
        {status === "loaded" && imgSrc && (
          <img className="movie-poster-img" src={imgSrc} alt={`${movie.t} poster`} />
        )}
        {status === "error" && (
          <div className="poster-fallback">
            <span>{movie.t}</span>
          </div>
        )}
        <div className="movie-card-overlay">
          <p className="movie-card-note">{movie.note}</p>
        </div>
      </div>
      <div className="movie-card-static-meta">
        <span className="mctitle">{movie.t}</span>
        <span className="mcyear">{movie.y}</span>
      </div>
    </div>
  );
}

// Helper to check if curated season name matches a selection key
const matchCategory = (catName: string, w: WithKey) => {
  const name = catName.toLowerCase();
  if (w === "date-night") return name.includes("date") || name.includes("partner");
  if (w === "family-movie") return name.includes("family") || name.includes("child") || name.includes("parent");
  if (w === "friends-gathering") return name.includes("friend") || name.includes("group");
  if (w === "solo-viewing") return name.includes("solo") || name.includes("alone");
  return false;
};

interface WatchWithSomeoneProps {
  initialSeasons: any[];
  allMovies: any[];
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function WatchWithSomeonePage({ initialSeasons = [], allMovies = [] }: WatchWithSomeoneProps) {
  const [season, setSeason] = useState<Season | null>(null);
  const [withKey, setWithKey] = useState<WithKey | null>(null);
  const [picks, setPicks] = useState<MovieEntry[]>([]);
  const [fxParticles, setFxParticles] = useState<React.ReactNode[]>([]);
  const [customLede, setCustomLede] = useState("");

  const withStepRef = useRef<HTMLDivElement>(null);
  const resultsStepRef = useRef<HTMLDivElement>(null);

  const spawnFx = useCallback((s: Season) => {
    const cfg = FX_CONFIG[s];
    const particles: React.ReactNode[] = [];
    for (let i = 0; i < cfg.count; i++) {
      const size = rand(cfg.size[0], cfg.size[1]);
      const dur = rand(cfg.dur[0], cfg.dur[1]);
      const style: React.CSSProperties = {
        width: size, height: size,
        left: `${rand(0, 100)}%`,
        animationDuration: `${dur}s`,
        animationDelay: `${-rand(0, dur)}s`,
      };
      if (s === "fall") style.background = pick(LEAF_COLORS);
      if (s === "spring") style.background = pick(PETAL_COLORS);
      if (s === "summer" || s === "spring") {
        style.top = "auto";
        if (s === "summer") style.bottom = `${rand(-10, 100)}%`;
      }
      particles.push(<span key={i} className={`fx-particle ${cfg.cls}`} style={style} />);
    }
    if (s === "spring") {
      for (let i = 0; i < 5; i++) {
        const bStyle: React.CSSProperties = {
          width: rand(120, 260),
          top: `${rand(8, 92)}%`,
          animationDuration: `${rand(7, 12)}s`,
          animationDelay: `${-rand(0, 10)}s`,
        };
        particles.push(<span key={`b${i}`} className="fx-particle fx-breeze" style={bStyle} />);
      }
    }
    setFxParticles(particles);
  }, []);

  const selectSeason = (s: Season) => {
    setSeason(s);
    if (withKey) renderResults(s, withKey);
    else setTimeout(() => withStepRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
  };

  const selectWith = (w: WithKey) => {
    setWithKey(w);
    if (season) renderResults(season, w);
  };

  const renderResults = (s: Season, w: WithKey) => {
    const seasonName = s === "fall" ? "autumn" : s;
    const matchedCat = (initialSeasons || []).find(
      (cat) =>
        cat.season.toLowerCase() === seasonName &&
        matchCategory(cat.name, w)
    );

    let pool: MovieEntry[] = [];
    let customDescription = "";

    if (matchedCat) {
      customDescription = matchedCat.description || "";
      if (matchedCat.movies && matchedCat.movies.length > 0) {
        const mapped = matchedCat.movies
          .map((mid: number) => {
            const movie = allMovies.find((m) => m.id === mid);
            if (!movie) return null;
            return {
              t: movie.title,
              y: movie.release_date ? parseInt(movie.release_date.split("-")[0], 10) : 2026,
              tags: [w] as string[],
              note: movie.custom_editorial_description || movie.tagline || movie.overview || "Recommended for this occasion.",
            };
          });
        pool = mapped.filter((m: any): m is MovieEntry => m !== null);
      }
    }

    // Fallback to static items if no curation is present
    if (pool.length === 0) {
      pool = [...MOVIES[s]].filter((m: any) => (m.tags as readonly string[]).includes(w));
    }

    setCustomLede(customDescription);
    setPicks(pool.slice(0, 10));
    spawnFx(s);
    setTimeout(() => resultsStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  };

  const resetPicker = () => {
    setSeason(null);
    setWithKey(null);
    setPicks([]);
    setFxParticles([]);
    setCustomLede("");
    document.getElementById("seasonGrid")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const showWithStep = season !== null;
  const showResults = picks.length > 0;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="page-hero-label">Curated Cinema</span>
          <h1 className="page-hero-h">Watch with Someone</h1>
          <p className="page-hero-sub">Films that matter most are the ones we watch together. They become part of our shared memory.</p>
          <div className="hero-byline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hero-byline-avatar" src="https://i.pinimg.com/1200x/99/42/d9/9942d948a2d1e25152dd7a132760e2ac.jpg" alt="Greta Gerwig" />
            <span className="hero-byline-text">Curated by <strong>Greta Gerwig</strong> — Director &amp; Screenwriter</span>
          </div>
        </div>
      </section>

      {/* ── Watch Categories ─────────────────────────────────── */}
      <section className="watch-categories-section" id="watch">
        <div className="watch-categories-container">
          <div className="watch-intro">
            <span className="watch-intro-label">Five Ways to Connect</span>
            <h2 className="watch-intro-h">Viewing Experiences</h2>
            <p className="watch-intro-sub">Every film, every moment with someone else becomes part of your shared story.</p>
          </div>
          <div className="watch-categories">
            {[
              { title: "Date Night", desc: "Romantic but not saccharine — equal focus, real conversation.", examples: "Before Sunrise · In the Mood for Love · Phantom Thread" },
              { title: "Family Movie Night", desc: "Nothing explicit, nothing dumbed down — works for every age in the room.", examples: "Spirited Away · Paddington 2 · The Incredibles" },
              { title: "Friends Gathering", desc: "Endlessly rewatchable, quote-worthy, built for a crowd.", examples: "Ocean's Eleven · Knives Out · Tarantino Films" },
              { title: "Solo Viewing", desc: "Demands your full attention — introspective, one POV.", examples: "Moonlight · Manchester by the Sea · Her" },
              { title: "Parallel Viewing", desc: "Minimal dialogue, internal worlds — shared silence as intimacy.", examples: "Lost in Translation · The Lighthouse · There Will Be Blood" },
            ].map((c) => (
              <div className="watch-card" key={c.title}>
                <h3 className="watch-card-title">{c.title}</h3>
                <p className="watch-card-desc">{c.desc}</p>
                <div className="watch-examples">{c.examples}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seasonal Picker ──────────────────────────────────── */}
      <section className="seasonal-section" id="seasonal">
        <div className="seasonal-container">
          <div className="seasonal-intro">
            <span className="seasonal-intro-label">Seasonal Cinema</span>
            <h2 className="seasonal-intro-h">Watch by the Season</h2>
            <p className="seasonal-intro-sub">Pick a season, then who you&apos;re watching with — we&apos;ll set the mood and bring ten films to match.</p>
          </div>

          {/* Step 1: Season grid */}
          <div className="seasons-grid" id="seasonGrid">
            {(["summer","fall","winter","spring"] as Season[]).map((s) => (
              <div
                key={s}
                className={`season-card${season === s ? " is-selected" : ""}`}
                data-season={s}
                onClick={() => selectSeason(s)}
              >
                <div>
                  <div className="season-card-top">
                    <h3 className="season-title">{SEASON_LABEL[s]}</h3>
                    <SeasonIcon season={s} />
                  </div>
                  <p className="season-tagline">
                    {s === "summer" && "Sun-warmed nights, open windows, and films that taste like the last day of school."}
                    {s === "fall" && "Sweaters, candlelight, and stories that ask you to slow down and pay attention."}
                    {s === "winter" && "Fogged-up windows, low light, and the kind of stillness that asks for company."}
                    {s === "spring" && "New light, open air, and films that feel like exhaling for the first time."}
                  </p>
                </div>
                <div className="season-pick-hint">
                  Choose {SEASON_LABEL[s]} <ArrowIcon />
                </div>
              </div>
            ))}
          </div>

          {/* Step 2: Who are you watching with? */}
          <div ref={withStepRef} className={`with-step${showWithStep ? " is-active" : ""}`} id="withStep">
            <span className="with-step-eyebrow">For Your {season ? SEASON_LABEL[season] : "Season"}</span>
            <h3 className="with-step-h">Who Are You Watching With?</h3>
            <div className="with-pills">
              {(["date-night","family-movie","friends-gathering","solo-viewing"] as WithKey[]).map((w) => (
                <button
                  key={w}
                  className={`with-pill${withKey === w ? " is-active" : ""}`}
                  data-with={w}
                  onClick={() => selectWith(w)}
                >
                  {WITH_LABEL[w]}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div ref={resultsStepRef} className={`results-step${showResults ? " is-active" : ""}`} id="resultsStep">
            <div className="results-panel" id="resultsPanel" data-season={season || "summer"}>
              <div className="results-fx">{fxParticles}</div>
              <div className="results-header">
                <span className="results-eyebrow">
                  {season ? SEASON_LABEL[season] : ""}{season && withKey ? " · " : ""}{withKey ? WITH_LABEL[withKey] : ""}
                </span>
                <h3 className="results-h">Ten Films for the Occasion</h3>
                <p className="results-sub">
                  {customLede || (season && withKey ? CONTEXT_DESC[season][withKey] : "")}
                </p>
              </div>
              <div className="movie-grid">
                {picks.map((movie, i) => (
                  <MovieCardW key={`${movie.t}-${i}`} movie={movie} delay={i * 55} />
                ))}
              </div>
            </div>
            <button className="start-over-btn" onClick={resetPicker}>Start Over</button>
          </div>
        </div>
      </section>
    </>
  );
}
