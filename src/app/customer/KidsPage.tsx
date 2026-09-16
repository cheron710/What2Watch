"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tmdbImageUrl } from "@/lib/tmdb/client";
import "./kids.css";

// ─── Pre-mapped Classic Kids Movies for CSS Artworks & Fallbacks ─────────────
const CLASSIC_DECORATIONS: Record<string, { tagColor: string; sceneClass: string; sceneHTML: React.ReactNode }> = {
  "the lion king": {
    tagColor: "#FF7E5F",
    sceneClass: "scene-lionking",
    sceneHTML: (
      <>
        <div className="glow"></div><div className="sun"></div>
        <span className="tree tl">🌴</span><span className="tree tr">🌴</span>
        <div className="rock"></div><span className="lion">🦁</span>
      </>
    )
  },
  "spirited away": {
    tagColor: "#B57BF7",
    sceneClass: "scene-spirited",
    sceneHTML: (
      <>
        <div className="moon"></div>
        <span className="lantern ln1">🏮</span><span className="lantern ln2">🏮</span>
        <div className="bh"><div className="bw bw1"></div><div className="bw bw2"></div><div className="bw bw3"></div></div>
        <span className="chihiro">🧒</span>
      </>
    )
  },
  "finding nemo": {
    tagColor: "#5BB8F5",
    sceneClass: "scene-nemo",
    sceneHTML: (
      <>
        <div className="seafloor"></div>
        <div className="bub b1"></div><div className="bub b2"></div><div className="bub b3"></div>
        <span className="coral nc1">🪸</span><span className="coral nc2">🌿</span>
        <span className="coral nc3">🪸</span><span className="coral nc4">🌿</span>
        <span className="nemo">🐠</span><span className="dory">🐟</span>
      </>
    )
  },
  "coco": {
    tagColor: "#FF8FAB",
    sceneClass: "scene-coco",
    sceneHTML: (
      <>
        <div className="cmoon"></div>
        <span className="cstar cs1">★</span><span className="cstar cs2">★</span>
        <span className="cstar cs3">★</span><span className="cstar cs4">★</span>
        <div className="city"></div><div className="bridge"></div>
        <span className="marig mg1">🌸</span><span className="marig mg2">🌸</span>
        <span className="marig mg3">🌸</span><span className="marig mg4">🌸</span>
        <span className="miguel">🎸</span>
      </>
    )
  },
  "moana": {
    tagColor: "#69D97D",
    sceneClass: "scene-moana",
    sceneHTML: (
      <>
        <div className="msun"></div><div className="island"></div><div className="ocean"></div>
        <div className="wave wv1"></div><div className="wave wv2"></div><div className="wave wv3"></div>
        <div className="sail"></div><div className="boat"></div><span className="mchar">🏄</span>
      </>
    )
  },
  "up": {
    tagColor: "#FFD54F",
    sceneClass: "scene-up",
    sceneHTML: (
      <>
        <div className="cloud cl1"></div><div className="cloud cl2"></div><div className="cloud cl3"></div>
        <span className="bln bl1">🔴</span><span className="bln bl2">🔵</span><span className="bln bl3">🟡</span>
        <span className="bln bl4">🟢</span><span className="bln bl5">🟠</span><span className="bln bl6">🟣</span>
        <div className="house"></div>
      </>
    )
  },
  "encanto": {
    tagColor: "#FF8FAB",
    sceneClass: "scene-encanto",
    sceneHTML: (
      <>
        <div className="mtn"></div><div className="casita"></div>
        <span className="eflower ef1">🌺</span><span className="eflower ef2">🌼</span>
        <span className="eflower ef3">🌺</span><span className="eflower ef4">🌸</span>
        <span className="ebfly eb1">🦋</span><span className="ebfly eb2">🦋</span>
        <span className="mirabel">💛</span>
      </>
    )
  },
  "paddington 2": {
    tagColor: "#9A7A5A",
    sceneClass: "scene-paddington",
    sceneHTML: (
      <>
        <div className="street"></div>
        <div className="bus"><div className="buw bw1"></div><div className="buw bw2"></div><div className="buw bw3"></div></div>
        <div className="bigben"></div>
        <div className="rain rn1"></div><div className="rain rn2"></div><div className="rain rn3"></div>
        <div className="rain rn4"></div><div className="rain rn5"></div>
        <span className="pbear">🐻</span>
      </>
    )
  },
  "inside out 2": {
    tagColor: "#5BB8F5",
    sceneClass: "scene-insideout",
    sceneHTML: (
      <>
        <div className="ground"></div><div className="hq"></div>
        <div className="mem mm1"></div><div className="mem mm2"></div><div className="mem mm3"></div><div className="mem mm4"></div>
        <span className="emo em1">😂</span><span className="emo em2">😢</span>
        <span className="emo em3">😡</span><span className="emo em4">😨</span><span className="emo em5">🤢</span>
      </>
    )
  },
  "the jungle book": {
    tagColor: "#69D97D",
    sceneClass: "scene-junglebook",
    sceneHTML: (
      <>
        <div className="gndj"></div><div className="vine vn1"></div><div className="vine vn2"></div>
        <span className="jleaf jl1">🍃</span><span className="jleaf jl2">🍃</span>
        <span className="jleaf jl3">🌿</span><span className="jleaf jl4">🌿</span>
        <span className="snake">🐍</span><span className="baloo">🐻</span>
        <span className="jflower jf1">🌸</span><span className="jflower jf2">🌺</span><span className="jflower jf3">🌼</span>
        <span className="mowgli">🧒</span>
      </>
    )
  }
};



interface KidsPageProps {
  initialCategories?: any[];
  allMovies?: any[];
}

export default function KidsPage({ initialCategories = [], allMovies = [] }: KidsPageProps) {
  const router = useRouter();
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const [promptText, setPromptText] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(10);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch TMDb Kids movies dynamically from TMDb backend API
  const fetchKidsMovies = useCallback(async (cat: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kids?category=${cat}&page=${pageNum}`);
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        setMovies(data.results);
        setTotalPages(data.total_pages || 10);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error("Failed to load TMDb kids movies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKidsMovies(activeCategory, currentPage);
  }, [activeCategory, currentPage, fetchKidsMovies]);

  // Confetti launcher
  const launchConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.style.display = "block";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#FF7E5F", "#FFD54F", "#69D97D", "#5BB8F5", "#B57BF7", "#FF8FAB"];
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: 6 + Math.random() * 9,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: 2 + Math.random() * 4,
      spin: (Math.random() - 0.5) * 0.18,
      angle: 0,
      drift: (Math.random() - 0.5) * 1.5,
    }));

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.y += p.speed;
        p.x += p.drift;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (++frame < 160) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = "none";
      }
    };
    draw();
  };

  const handleMovieClick = (movieId: number) => {
    launchConfetti();
    router.push(`/movie/${movieId}`);
  };

  const [dailyFeaturedItems, setDailyFeaturedItems] = useState<any[]>([]);
  const [spotlightLoaded, setSpotlightLoaded] = useState<boolean>(false);
  const [todayDateStr, setTodayDateStr] = useState<string>("");
  const [slideDir, setSlideDir] = useState<"slide-in-right" | "slide-in-left">("slide-in-right");
  const [slideKey, setSlideKey] = useState<number>(0);
  const [timerProgress, setTimerProgress] = useState<number>(0);
  const [isHoveredSpotlight, setIsHoveredSpotlight] = useState<boolean>(false);

  // Fetch Daily Featured TMDB Pick — ONLY show Admin-curated movies, no hardcoded fallback
  useEffect(() => {
    async function loadDailyFeatured() {
      try {
        const res = await fetch("/api/kids/daily-featured", { cache: "no-store" });
        const data = await res.json();
        if (data && data.items) {
          setDailyFeaturedItems(data.items);
          setTodayDateStr(data.todayDate || "");
          if (data.items.length > 0 && data.todayIndex !== undefined) {
            setSpotlightIdx(data.todayIndex % data.items.length);
          }
        }
      } catch (e) {
        console.error("Failed to load daily featured kids movie:", e);
      } finally {
        setSpotlightLoaded(true);
      }
    }
    loadDailyFeatured();
  }, []);

  // Only show Admin-curated movies — never fall back to hardcoded items
  const spotlightList = dailyFeaturedItems;

  // 10-Second Auto Rotation Timer
  useEffect(() => {
    if (isHoveredSpotlight) return;

    const intervalTime = 10000; // 10 seconds
    const stepTime = 100;
    const stepIncrement = (stepTime / intervalTime) * 100;

    const timer = setInterval(() => {
      setTimerProgress((prev) => {
        if (prev >= 100) {
          setSlideDir("slide-in-right");
          setSlideKey((k) => k + 1);
          setSpotlightIdx((idx) => spotlightList.length > 0 ? (idx + 1) % spotlightList.length : 0);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, [isHoveredSpotlight, spotlightList.length]);

  const handlePrevSpotlight = () => {
    setSlideDir("slide-in-left");
    setSlideKey((k) => k + 1);
    setTimerProgress(0);
    setSpotlightIdx((prev) => (prev - 1 + spotlightList.length) % spotlightList.length);
  };

  const handleNextSpotlight = () => {
    setSlideDir("slide-in-right");
    setSlideKey((k) => k + 1);
    setTimerProgress(0);
    setSpotlightIdx((prev) => (prev + 1) % spotlightList.length);
  };

  const handleDotClick = (idx: number) => {
    setSlideDir(idx > spotlightIdx ? "slide-in-right" : "slide-in-left");
    setSlideKey((k) => k + 1);
    setTimerProgress(0);
    setSpotlightIdx(idx);
  };

  const handleAskGuillaume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    launchConfetti();
    router.push(`/guillaume?prompt=${encodeURIComponent(promptText.trim())}`);
  };

  const handleHintClick = (hint: string) => {
    setPromptText(hint);
  };

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const safeSpotlightIdx = spotlightList.length > 0 ? spotlightIdx % spotlightList.length : 0;
  const currentSpotlight = spotlightList.length > 0 ? spotlightList[safeSpotlightIdx] : null;

  return (
    <div className="kids-page">
      <canvas id="confetti-canvas" ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, display: 'none' }} />

      {/* HERO SECTION */}
      <section id="kids-hero">
        <span className="sky-deco star-1">⭐</span><span className="sky-deco star-2">✨</span>
        <span className="sky-deco star-3">⭐</span><span className="sky-deco star-4">✨</span><span className="sky-deco star-5">⭐</span>
        <span className="sky-deco float-rocket">🚀</span><span className="sky-deco float-rainbow">🌈</span>
        <span className="sky-deco float-dino">🦕</span><span className="sky-deco float-planet">🪐</span>
        <span className="sky-deco float-cloud1">☁️</span><span className="sky-deco float-cloud2">⛅</span>
        <span className="sky-deco float-popcorn">🍿</span><span className="sky-deco float-heart">💛</span>
        <span className="sky-deco float-butterfly">🦋</span>
        <div className="hero-content">
          <span className="kids-eyebrow">🎬 Movies for Young Explorers</span>
          <h1 className="kids-hero-title">Kids Corner</h1>
          <p className="kids-hero-sub">Magical adventures, funny friends, and stories that stay with you forever 🌟</p>
          <button
            className="kids-hero-pill"
            onClick={() => document.getElementById("little-ones")?.scrollIntoView({ behavior: "smooth" })}
          >
            🍿 See What&apos;s Playing
          </button>
        </div>
      </section>

      {/* LITTLE ONES SECTION */}
      <section id="little-ones" className="kids-section">
        <div className="kids-sec-header">
          <span className="kids-sec-eyebrow" style={{ color: "#FF7E5F" }}>🎠 Handpicked Magic</span>
          <h2 className="kids-sec-title">For Your Little Ones</h2>
          <p className="kids-sec-sub">Top films from TMDb that spark imagination, teach big lessons, and make the whole family laugh.</p>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { id: "all", label: "🌟 All Kids Movies" },
              { id: "animation", label: "🎨 Animation" },
              { id: "adventure", label: "🚀 Adventure" },
              { id: "comedy", label: "😄 Comedy" },
              { id: "fantasy", label: "🦄 Fantasy & Magic" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                style={{
                  padding: "10px 22px",
                  borderRadius: "24px",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: activeCategory === cat.id ? "#FF7E5F" : "rgba(0,0,0,0.06)",
                  color: activeCategory === cat.id ? "#fff" : "#3a3830",
                  boxShadow: activeCategory === cat.id ? "0 6px 16px rgba(255, 126, 95, 0.3)" : "none",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#8C8578", fontSize: "1.1rem", fontWeight: 700 }}>
            ✨ Loading TMDb Kids movies...
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="movies-grid" id="moviesGrid">
              {movies.map((m, idx) => {
                const dec = CLASSIC_DECORATIONS[m.title?.toLowerCase()] || null;
                return (
                  <div
                    className="movie-card"
                    key={`${m.id}-${idx}`}
                    onClick={() => handleMovieClick(m.id)}
                  >
                    <div className={`movie-scene ${dec ? dec.sceneClass : "scene-nemo"}`}>
                      {m.poster ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={m.poster}
                          alt={m.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : dec ? (
                        dec.sceneHTML
                      ) : (
                        <div className="seafloor" />
                      )}
                      <span className="movie-age-badge">{m.age || "All Ages"}</span>
                    </div>
                    <div className="movie-info">
                      <div className="movie-title">{m.title}</div>
                      <div className="movie-year-dir">{m.year} {m.rating ? `· ⭐ ${m.rating}` : ""}</div>
                      <div className="movie-tagline">{m.tagline}</div>
                      <span className="movie-tag" style={{ background: `${m.tagColor || "#5BB8F5"}18`, color: m.tagColor || "#5BB8F5" }}>
                        {m.tag || "Kids"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 48 }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "30px",
                    border: "none",
                    background: currentPage === 1 ? "rgba(0,0,0,0.05)" : "#FF7E5F",
                    color: currentPage === 1 ? "#aaa" : "#fff",
                    fontWeight: 800,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Previous
                </button>
                <span style={{ fontWeight: 800, fontSize: "14px", color: "#3a3830" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "30px",
                    border: "none",
                    background: currentPage === totalPages ? "rgba(0,0,0,0.05)" : "#FF7E5F",
                    color: currentPage === totalPages ? "#aaa" : "#fff",
                    fontWeight: 800,
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="movie-grid-empty" style={{ textAlign: "center", margin: "48px 0", opacity: 0.7 }}>
            No Kids movies found in this category right now.
          </p>
        )}
      </section>

      {/* SPOTLIGHT SECTION — ONLY shows Admin-curated movies */}
      {spotlightLoaded && spotlightList.length > 0 && currentSpotlight && (
        <section id="spotlight">
          <div className="spotlight-inner">
            <span className="spotlight-label">
              ✦ TODAY&apos;S FEATURED KIDS PICK {todayDateStr ? `(${todayDateStr})` : ""}
            </span>
            <h2 className="spotlight-title">
              Our editors recommend<br />
              <span>{currentSpotlight?.title || currentSpotlight?.name}</span>
            </h2>

            <div
              className={`spotlight-card ${slideDir}`}
              key={`spotlight-slide-${slideKey}-${spotlightIdx}`}
              onMouseEnter={() => setIsHoveredSpotlight(true)}
              onMouseLeave={() => setIsHoveredSpotlight(false)}
            >
              <div
                className="spotlight-scene overflow-hidden relative"
                style={{
                  background: currentSpotlight?.backdropPath
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(13,13,26,0.9)), url(${currentSpotlight.backdropPath}) center/cover no-repeat`
                    : currentSpotlight?.bg || "linear-gradient(160deg,#0077BE 0%,#00A8CC 40%,#00C9A7 100%)",
                  minHeight: 440,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                }}
              >
                {currentSpotlight?.posterPath ? (
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => handleMovieClick(currentSpotlight.id)}
                  >
                    <img
                      src={currentSpotlight.posterPath}
                      alt={currentSpotlight.title || currentSpotlight.name}
                      style={{
                        width: 170,
                        height: 250,
                        objectFit: "cover",
                        borderRadius: 16,
                        boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
                        border: "3px solid rgba(255,255,255,0.2)",
                        transition: "transform 0.3s ease",
                      }}
                      className="hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-black text-xs bg-[#FF7E5F] px-4 py-2 rounded-full shadow-lg">
                        ▶ View Movie
                      </span>
                    </div>
                  </div>
                ) : (
                  currentSpotlight?.inner
                )}

                {currentSpotlight?.isToday && (
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      background: "#FF7E5F",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: "11px",
                      padding: "5px 14px",
                      borderRadius: 20,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    ✨ TODAY&apos;S DAILY SELECTION
                  </div>
                )}

                {currentSpotlight?.rating && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 16,
                      right: 16,
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(6px)",
                      color: "#FFD54F",
                      fontWeight: 900,
                      fontSize: "12px",
                      padding: "4px 12px",
                      borderRadius: 20,
                      border: "1px solid rgba(255,213,79,0.3)",
                    }}
                  >
                    ★ {currentSpotlight.rating} / 10 (TMDB)
                  </div>
                )}
              </div>

              <div className="spotlight-info">
                <div className="sp-pick-tag flex items-center gap-2">
                  <span>⭐ DAILY EDITOR&apos;S PICK</span>
                  {todayDateStr && <span style={{ opacity: 0.75, fontSize: "10px" }}>· {todayDateStr}</span>}
                </div>
                <div
                  className="sp-film-title"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleMovieClick(currentSpotlight?.id)}
                >
                  {currentSpotlight?.title || currentSpotlight?.name}
                </div>
                <div className="sp-film-year">
                  {currentSpotlight?.year} · ⭐ {currentSpotlight?.rating} / 10 · {currentSpotlight?.genres || currentSpotlight?.meta}
                </div>
                <blockquote className="sp-pull-quote">
                  &quot;{currentSpotlight?.tagline || currentSpotlight?.quote || currentSpotlight?.overview}&quot;
                </blockquote>

                <div className="sp-why-title">Why your little ones will love it</div>
                <div className="sp-reasons">
                  {currentSpotlight?.highlight ? (
                    <>
                      <div className="sp-reason">
                        <div className="sp-reason-dot" style={{ background: "#5BB8F5" }} />
                        <span className="sp-reason-text">{currentSpotlight.highlight}</span>
                      </div>
                      <div className="sp-reason">
                        <div className="sp-reason-dot" style={{ background: "#69D97D" }} />
                        <span className="sp-reason-text">A famous animated masterpiece retrieved live from TMDB</span>
                      </div>
                      <div className="sp-reason">
                        <div className="sp-reason-dot" style={{ background: "#FFD54F" }} />
                        <span className="sp-reason-text">Over {currentSpotlight.voteCount || 1000}+ positive community ratings on TMDB</span>
                      </div>
                    </>
                  ) : (
                    currentSpotlight?.reasons?.map((r: any, i: number) => (
                      <div className="sp-reason" key={i}>
                        <div className="sp-reason-dot" style={{ background: r.color }} />
                        <span className="sp-reason-text">{r.text}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="sp-age-row flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    <span className="sp-badge" style={{ background: "rgba(91,184,245,.18)", color: "#5BB8F5" }}>
                      {currentSpotlight?.age || "All Ages"}
                    </span>
                    <span className="sp-badge" style={{ background: "rgba(105,217,125,.18)", color: "#69D97D" }}>
                      Family Friendly
                    </span>
                    <span className="sp-badge" style={{ background: "rgba(255,126,95,.18)", color: "#FF7E5F" }}>
                      TMDB Pick
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMovieClick(currentSpotlight?.id)}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 20,
                      border: "none",
                      background: "#FF7E5F",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "12px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(255,126,95,0.4)",
                    }}
                  >
                    🍿 View Details →
                  </button>
                </div>
              </div>

              {/* 10-Second Auto-Rotation Timer Progress Bar */}
              <div className="spotlight-timer-bar" style={{ width: `${timerProgress}%` }} />
            </div>

            <div className="spotlight-nav">
              <button type="button" className="sp-nav-btn" onClick={handlePrevSpotlight}>←</button>
              <div className="sp-dots">
                {spotlightList.map((_: any, i: number) => (
                  <div
                    key={i}
                    className={`sp-dot${i === safeSpotlightIdx ? " on" : ""}`}
                    onClick={() => handleDotClick(i)}
                  />
                ))}
              </div>
              <button type="button" className="sp-nav-btn" onClick={handleNextSpotlight}>→</button>
            </div>
          </div>
        </section>
      )}

      {/* GUILLAUME KIDS SECTION */}
      <section id="kids-guillaume" className="kids-section">
        <div className="guillaume-kids-inner">
          <div className="g-kids-dot" />
          <h2 className="g-kids-title">Not sure what to watch? 🤔</h2>
          <p className="g-kids-sub">Just tell Guillaume what the little ones are in the mood for, and let the magic happen.</p>
          <form onSubmit={handleAskGuillaume}>
            <input
              className="g-kids-input"
              type="text"
              id="kidsGuillaumeInput"
              placeholder="e.g. a movie about a lost puppy who finds a family 🐶"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
            <div className="g-kids-hints">
              {["Fun animal friends", "Magic and dragons", "Robot buddies", "Brave girl heroes", "Something funny"].map((hint) => (
                <button
                  type="button"
                  key={hint}
                  className="g-kids-hint"
                  onClick={() => handleHintClick(hint)}
                >
                  &apos;{hint}&apos;
                </button>
              ))}
            </div>
            <button type="submit" className="g-kids-btn">
              Ask Guillaume ✨
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
