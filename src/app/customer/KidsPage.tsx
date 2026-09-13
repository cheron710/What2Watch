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

const SPOTLIGHT_ITEMS = [
  {
    id: 12,
    name: "Finding Nemo",
    meta: "2003 · Andrew Stanton · Pixar",
    quote: "A father's love takes him to the bottom of the ocean and back — and teaches him to let go.",
    reasons: [
      { color: "#5BB8F5", text: "Dory teaches that it's okay to ask for help — and to laugh while doing it" },
      { color: "#69D97D", text: "Stunning underwater world that makes the ocean feel like a magical place" },
      { color: "#FFD54F", text: "A simple message about bravery that kids carry long after the credits roll" }
    ],
    badges: [
      { bg: "rgba(91,184,245,.18)", color: "#5BB8F5", label: "All Ages" },
      { bg: "rgba(105,217,125,.18)", color: "#69D97D", label: "Family Friendly" },
      { bg: "rgba(255,213,79,.18)", color: "#FFD54F", label: "Adventure" }
    ],
    bg: "linear-gradient(160deg,#0077BE 0%,#00A8CC 40%,#00C9A7 100%)",
    inner: (
      <>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'rgba(0,40,60,.5)', borderRadius: '60% 60% 0 0' }}></div>
        <div style={{ position: 'absolute', borderRadius: '50%', border: '2px solid rgba(255,255,255,.5)', background: 'rgba(255,255,255,.1)', width: 22, height: 22, top: '14%', left: '10%', animation: 'floatC 4s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', borderRadius: '50%', border: '2px solid rgba(255,255,255,.5)', background: 'rgba(255,255,255,.1)', width: 12, height: 12, top: '30%', right: '16%', animation: 'floatC 5s .6s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', borderRadius: '50%', border: '2px solid rgba(255,255,255,.5)', background: 'rgba(255,255,255,.1)', width: 30, height: 30, top: '50%', left: '55%', animation: 'floatC 6s 1.2s ease-in-out infinite' }}></div>
        <span style={{ position: 'absolute', bottom: 0, left: '2%', fontSize: 48 }}>🪸</span>
        <span style={{ position: 'absolute', bottom: 0, left: '18%', fontSize: 42 }}>🌿</span>
        <span style={{ position: 'absolute', bottom: 0, right: '14%', fontSize: 46 }}>🪸</span>
        <span style={{ position: 'absolute', bottom: 0, right: '2%', fontSize: 40 }}>🌿</span>
        <span style={{ position: 'absolute', bottom: '26%', left: '6%', fontSize: 34, animation: 'wibble 5s ease-in-out infinite' }}>🌱</span>
        <span style={{ position: 'absolute', bottom: '50%', left: '8%', fontSize: 36, animation: 'drift 6s 1.5s ease-in-out infinite' }}>🐢</span>
        <span style={{ position: 'absolute', bottom: '40%', right: '8%', fontSize: 48, animation: 'drift 5s .8s ease-in-out infinite' }}>🐟</span>
        <span style={{ position: 'absolute', bottom: '34%', left: '50%', transform: 'translateX(-50%)', fontSize: 74, animation: 'drift 4s ease-in-out infinite' }}>🐠</span>
        <div className="sp-shimmer"></div>
      </>
    )
  },
  {
    id: 129,
    name: "Spirited Away",
    meta: "2001 · Hayao Miyazaki · Studio Ghibli",
    quote: "A girl walks into another world and discovers she's braver than she ever knew.",
    reasons: [
      { color: "#B57BF7", text: "A rare animated film that respects children's intelligence and imagination" },
      { color: "#FF8FAB", text: "Breathtaking hand-drawn animation — every frame is a painting" },
      { color: "#5BB8F5", text: "Chihiro's courage grows quietly, showing kids that bravery isn't loud" }
    ],
    badges: [
      { bg: "rgba(181,123,247,.18)", color: "#B57BF7", label: "6+" },
      { bg: "rgba(255,143,171,.18)", color: "#FF8FAB", label: "Magical" },
      { bg: "rgba(91,184,245,.18)", color: "#5BB8F5", label: "Masterpiece" }
    ],
    bg: "linear-gradient(180deg,#2D1B5E 0%,#6B3F9E 40%,#C4689B 70%,#F4A0B5 100%)",
    inner: (
      <>
        <div style={{ position: 'absolute', top: '12%', right: '20%', width: 56, height: 56, borderRadius: '50%', background: '#FFF9C4', boxShadow: '0 0 28px rgba(255,249,196,.5)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 150, height: 110, background: '#E8B86D' }}>
          <div style={{ position: 'absolute', top: -28, left: -13, right: -13, height: 38, background: '#C0392B', clipPath: 'polygon(0 100%,50% 0,100% 100%)' }}></div>
          <div style={{ position: 'absolute', top: -52, left: 15, right: 15, height: 34, background: '#922B21', clipPath: 'polygon(0 100%,50% 0,100% 100%)' }}></div>
          <div style={{ position: 'absolute', bottom: 18, left: 15, width: 20, height: 26, background: '#FFD95A', borderRadius: 2 }}></div>
          <div style={{ position: 'absolute', bottom: 18, left: 64, width: 20, height: 26, background: '#FFD95A', borderRadius: 2 }}></div>
          <div style={{ position: 'absolute', bottom: 18, right: 15, width: 20, height: 26, background: '#FFD95A', borderRadius: 2 }}></div>
        </div>
        <span style={{ position: 'absolute', top: '38%', left: '14%', fontSize: 26, animation: 'floatB 4s ease-in-out infinite' }}>🏮</span>
        <span style={{ position: 'absolute', top: '28%', right: '16%', fontSize: 26, animation: 'floatB 5s 1s ease-in-out infinite' }}>🏮</span>
        <span style={{ position: 'absolute', bottom: '44%', left: '48%', transform: 'translateX(-50%)', fontSize: 38, animation: 'bounce 3.5s ease-in-out infinite' }}>🧒</span>
        <div className="sp-shimmer"></div>
      </>
    )
  },
  {
    id: 354912,
    name: "Coco",
    meta: "2017 · Lee Unkrich · Pixar",
    quote: "The dead are only truly gone when the living stop remembering them.",
    reasons: [
      { color: "#FF8FAB", text: "Celebrates family and culture with a warmth that makes every heart full" },
      { color: "#FFD54F", text: "One of the most visually dazzling animated films ever made" },
      { color: "#FF7E5F", text: "Teaches children about love, memory, and what it means to follow your dream" }
    ],
    badges: [
      { bg: "rgba(255,143,171,.18)", color: "#FF8FAB", label: "5+" },
      { bg: "rgba(255,126,95,.18)", color: "#FF7E5F", label: "Emotional" },
      { bg: "rgba(255,213,79,.18)", color: "#FFD54F", label: "Musical" }
    ],
    bg: "linear-gradient(180deg,#0D0221 0%,#1A0A3D 30%,#6B2D8B 60%,#F7A800 100%)",
    inner: (
      <>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: 42, height: 42, borderRadius: '50%', background: '#FFF9C4', boxShadow: '0 0 16px rgba(255,249,196,.5)' }}></div>
        <span style={{ position: 'absolute', top: '8%', left: '40%', fontSize: 14, color: '#FFD700' }}>★</span>
        <span style={{ position: 'absolute', top: '15%', right: '25%', fontSize: 14, color: '#FFD700' }}>★</span>
        <span style={{ position: 'absolute', top: '5%', right: '50%', fontSize: 14, color: '#FFD700' }}>★</span>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', background: '#1A0A3D' }}></div>
        <div style={{ position: 'absolute', bottom: '28%', left: 0, right: 0, height: 14, background: '#F7A800' }}></div>
        <span style={{ position: 'absolute', bottom: '26%', left: '5%', fontSize: 26 }}>🌸</span>
        <span style={{ position: 'absolute', bottom: '22%', left: '22%', fontSize: 22 }}>🌸</span>
        <span style={{ position: 'absolute', bottom: '26%', right: '22%', fontSize: 24 }}>🌸</span>
        <span style={{ position: 'absolute', bottom: '26%', right: '6%', fontSize: 22 }}>🌸</span>
        <span style={{ position: 'absolute', bottom: '38%', left: '48%', transform: 'translateX(-50%)', fontSize: 52, animation: 'bounce 3s ease-in-out infinite' }}>🎸</span>
        <div className="sp-shimmer"></div>
      </>
    )
  }
];

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

  const handlePrevSpotlight = () => {
    setSpotlightIdx((prev) => (prev - 1 + SPOTLIGHT_ITEMS.length) % SPOTLIGHT_ITEMS.length);
  };

  const handleNextSpotlight = () => {
    setSpotlightIdx((prev) => (prev + 1) % SPOTLIGHT_ITEMS.length);
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

  const currentSpotlight = SPOTLIGHT_ITEMS[spotlightIdx];

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

      {/* SPOTLIGHT SECTION */}
      <section id="spotlight">
        <div className="spotlight-inner">
          <span className="spotlight-label">✦ This Week&apos;s Featured Pick</span>
          <h2 className="spotlight-title">
            Our editors recommend<br />
            <span>{currentSpotlight.name}</span>
          </h2>

          <div className="spotlight-card">
            <div className="spotlight-scene" style={{ background: currentSpotlight.bg }}>
              {currentSpotlight.inner}
            </div>
            <div className="spotlight-info">
              <div className="sp-pick-tag">⭐ Editor&apos;s Pick</div>
              <div
                className="sp-film-title"
                style={{ cursor: 'pointer' }}
                onClick={() => handleMovieClick(currentSpotlight.id)}
              >
                {currentSpotlight.name}
              </div>
              <div className="sp-film-year">{currentSpotlight.meta}</div>
              <blockquote className="sp-pull-quote">&quot;{currentSpotlight.quote}&quot;</blockquote>

              <div className="sp-why-title">Why your little ones will love it</div>
              <div className="sp-reasons">
                {currentSpotlight.reasons.map((r, i) => (
                  <div className="sp-reason" key={i}>
                    <div className="sp-reason-dot" style={{ background: r.color }} />
                    <span className="sp-reason-text">{r.text}</span>
                  </div>
                ))}
              </div>

              <div className="sp-age-row">
                {currentSpotlight.badges.map((b, i) => (
                  <span className="sp-badge" key={i} style={{ background: b.bg, color: b.color }}>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="spotlight-nav">
            <button className="sp-nav-btn" onClick={handlePrevSpotlight}>←</button>
            <div className="sp-dots">
              {SPOTLIGHT_ITEMS.map((_, i) => (
                <div
                  key={i}
                  className={`sp-dot${i === spotlightIdx ? " on" : ""}`}
                  onClick={() => setSpotlightIdx(i)}
                />
              ))}
            </div>
            <button className="sp-nav-btn" onClick={handleNextSpotlight}>→</button>
          </div>
        </div>
      </section>

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
