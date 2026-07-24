"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./kids.css";

const ORIGINAL_DECORATIONS: Record<string, { tagColor: string, sceneClass: string, sceneHTML: React.ReactNode }> = {
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
        <div className="rain rn1"></div><div className="rain rn2"></div><div className="rain rn3"></div><div className="rain rn4"></div><div className="rain rn5"></div>
        <div className="bigben"></div><span className="pbear">🐻</span>
      </>
    )
  },
  "inside out 2": {
    tagColor: "#5BB8F5",
    sceneClass: "scene-insideout",
    sceneHTML: (
      <>
        <div className="ground"></div><div className="hq"></div>
        <span className="emo em1">💛</span><span className="emo em2">💙</span>
        <span className="emo em3">💚</span><span className="emo em4">💜</span><span className="emo em5">🧡</span>
        <div className="mem mm1"></div><div className="mem mm2"></div><div className="mem mm3"></div><div className="mem mm4"></div>
      </>
    )
  },
  "the jungle book": {
    tagColor: "#69D97D",
    sceneClass: "scene-junglebook",
    sceneHTML: (
      <>
        <div className="gndj"></div><div className="vine vn1"></div><div className="vine vn2"></div>
        <span className="jleaf jl1">🍃</span><span className="jleaf jl2">🌿</span>
        <span className="jleaf jl3">🍃</span><span className="jleaf jl4">🌿</span>
        <span className="jflower jf1">🌸</span><span className="jflower jf2">🌺</span><span className="jflower jf3">🌼</span>
        <span className="baloo">🐻</span><span className="snake">🐍</span><span className="mowgli">🧒</span>
      </>
    )
  }
};

const FALLBACK_DECORATIONS = [
  {
    tagColor: "#FF7E5F",
    sceneClass: "scene-lionking",
    sceneHTML: (
      <>
        <div className="glow"></div><div className="sun"></div>
        <span className="emoji-deco" style={{ fontSize: 48, display: 'block', textAlign: 'center', marginTop: 12 }}>🦁</span>
      </>
    )
  },
  {
    tagColor: "#B57BF7",
    sceneClass: "scene-spirited",
    sceneHTML: (
      <>
        <div className="moon"></div>
        <span className="emoji-deco" style={{ fontSize: 48, display: 'block', textAlign: 'center', marginTop: 12 }}>🌈</span>
      </>
    )
  },
  {
    tagColor: "#5BB8F5",
    sceneClass: "scene-nemo",
    sceneHTML: (
      <>
        <div className="seafloor"></div>
        <span className="emoji-deco" style={{ fontSize: 48, display: 'block', textAlign: 'center', marginTop: 12 }}>🐳</span>
      </>
    )
  },
  {
    tagColor: "#69D97D",
    sceneClass: "scene-moana",
    sceneHTML: (
      <>
        <div className="msun"></div>
        <span className="emoji-deco" style={{ fontSize: 48, display: 'block', textAlign: 'center', marginTop: 12 }}>🐢</span>
      </>
    )
  }
];

interface KidsPageProps {
  initialCategories: any[];
  allMovies: any[];
}

export default function KidsPage({ initialCategories = [], allMovies = [] }: KidsPageProps) {
  const router = useRouter();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [promptText, setPromptText] = useState("");

  // Default fallback categories if empty
  const categories = initialCategories.length > 0 ? initialCategories : [
    {
      id: "fallback-kids",
      name: "Kids",
      min_age: 6,
      max_age: 10,
      description: "Delightful animated and live action wonders curations.",
      movies: allMovies.filter(m => m.id === 313369).map(m => m.id), // La La Land as fallback
      movie_details: { "313369": { safety_rating: "G", educational_tags: ["Music"], family_tags: ["Fun"] } }
    }
  ];

  const activeCategory = categories[activeCategoryIndex] || categories[0];
  const movieIds = activeCategory?.movies || [];

  const kidsMovies = movieIds.map((mid: number, idx: number) => {
    const movie = allMovies.find((m) => m.id === mid);
    const details = activeCategory.movie_details?.[mid] || {};
    const dec = ORIGINAL_DECORATIONS[movie?.title?.toLowerCase() || ""] || FALLBACK_DECORATIONS[mid % FALLBACK_DECORATIONS.length];

    return {
      id: mid,
      title: movie?.title || `TMDb ID: ${mid}`,
      year: movie?.release_date ? movie.release_date.split("-")[0] : "N/A",
      director: movie?.director || "Various",
      tagline: movie?.tagline || movie?.overview || "A great movie for kids.",
      tag: details.family_tags?.[0] || details.educational_tags?.[0] || "Kids Corner",
      tagColor: dec.tagColor,
      age: details.safety_rating || "G",
      sceneClass: dec.sceneClass,
      sceneHTML: dec.sceneHTML
    };
  });

  const spotlightData = kidsMovies[spotlightIndex] || null;

  const handleNextSpotlight = () => {
    if (kidsMovies.length === 0) return;
    setSpotlightIndex((prev) => (prev + 1) % kidsMovies.length);
  };

  const handlePrevSpotlight = () => {
    if (kidsMovies.length === 0) return;
    setSpotlightIndex((prev) => (prev - 1 + kidsMovies.length) % kidsMovies.length);
  };

  const handleAskGuillaume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    router.push(`/guillaume?prompt=${encodeURIComponent(promptText)}`);
  };

  const handleHintClick = (hint: string) => {
    setPromptText(hint);
  };

  return (
    <div className="kids-page">
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
            onClick={() => document.getElementById('little-ones')?.scrollIntoView({behavior:'smooth'})}
          >
            🍿 See What&apos;s Playing
          </button>
        </div>
      </section>

      {/* LITTLE ONES SECTION */}
      <section id="little-ones" className="kids-section">
        <div className="kids-sec-header">
          <span className="kids-sec-eyebrow" style={{ color: "var(--color-k-coral)" }}>🎠 Handpicked Magic</span>
          <h2 className="kids-sec-title">For Your Little Ones</h2>
          <p className="kids-sec-sub">{activeCategory?.description || "Ten films that spark imagination, teach big lessons, and make the whole family laugh."}</p>
          
          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="category-tabs" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              {categories.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryIndex(idx);
                    setSpotlightIndex(0);
                  }}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '24px',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: activeCategoryIndex === idx ? 'var(--color-k-coral)' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    boxShadow: activeCategoryIndex === idx ? '0 8px 16px rgba(255, 126, 95, 0.3)' : 'none'
                  }}
                >
                  {cat.name} ({cat.min_age}-{cat.max_age} yrs)
                </button>
              ))}
            </div>
          )}
        </div>
        
        {kidsMovies.length > 0 ? (
          <div className="movies-grid">
            {kidsMovies.map((movie: any, idx: number) => (
              <div className="movie-card" key={idx} onClick={() => setSpotlightIndex(idx)}>
                <div className={`movie-scene ${movie.sceneClass}`}>
                  <div className="movie-age-badge">{movie.age}</div>
                  {movie.sceneHTML}
                </div>
                <div className="movie-info">
                  <div className="movie-title">{movie.title}</div>
                  <div className="movie-year-dir">{movie.year} · {movie.director}</div>
                  <div className="movie-tagline">{movie.tagline}</div>
                  <div className="movie-tag" style={{ background: `${movie.tagColor}15`, color: movie.tagColor }}>
                    {movie.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="movie-grid-empty" style={{ textAlign: 'center', margin: '48px 0', opacity: 0.7 }}>
            No movies curated in this category yet. Check back shortly!
          </p>
        )}
      </section>

      {/* SPOTLIGHT SECTION */}
      {spotlightData && (
        <section id="spotlight">
          <div className="spotlight-inner">
            <span className="spotlight-label">✦ This Week&apos;s Featured Pick</span>
            <h2 className="spotlight-title">Our editors recommend<br/><span>{spotlightData.title}</span></h2>

            <div className="spotlight-card">
              <div className="spotlight-scene">
                <div className={`movie-scene ${spotlightData.sceneClass}`} style={{ width: '100%', height: '100%' }}>
                  {spotlightData.sceneHTML}
                </div>
                <div className="sp-shimmer"></div>
              </div>
              <div className="spotlight-info">
                <div className="sp-pick-tag">⭐ Editor&apos;s Pick</div>
                <div className="sp-film-title">{spotlightData.title}</div>
                <div className="sp-film-year">{spotlightData.year} · {spotlightData.director}</div>
                <blockquote className="sp-pull-quote">&quot;{spotlightData.tagline}&quot;</blockquote>
                
                <div className="sp-why-title">Why your little ones will love it</div>
                <div className="sp-reasons">
                  <div className="sp-reason">
                    <div className="sp-reason-dot" style={{ background: spotlightData.tagColor }}></div>
                    <div className="sp-reason-text">Beautifully animated scenes that capture the imagination.</div>
                  </div>
                  <div className="sp-reason">
                    <div className="sp-reason-dot" style={{ background: spotlightData.tagColor }}></div>
                    <div className="sp-reason-text">A heartfelt story with a great message.</div>
                  </div>
                </div>
                
                <div className="sp-age-row mt-4">
                  <span className="sp-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>Age: {spotlightData.age}</span>
                  <span className="sp-badge" style={{ background: `${spotlightData.tagColor}30`, color: spotlightData.tagColor }}>{spotlightData.tag}</span>
                </div>
              </div>
            </div>

            {kidsMovies.length > 1 && (
              <div className="spotlight-nav">
                <button className="sp-nav-btn" onClick={handlePrevSpotlight}>←</button>
                <div className="sp-dots">
                  {kidsMovies.map((_: any, i: number) => (
                    <div 
                      key={i} 
                      className={`sp-dot ${i === spotlightIndex ? 'on' : ''}`}
                      onClick={() => setSpotlightIndex(i)}
                    />
                  ))}
                </div>
                <button className="sp-nav-btn" onClick={handleNextSpotlight}>→</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* GUILLAUME KIDS SECTION */}
      <section id="kids-guillaume" className="kids-section">
        <div className="guillaume-kids-inner">
          <div className="g-kids-dot"></div>
          <h2 className="g-kids-title">Not sure what to watch? 🤔</h2>
          <p className="g-kids-sub">Just tell Guillaume what the little ones are in the mood for, and let the magic happen.</p>
          <form onSubmit={handleAskGuillaume}>
            <input 
              className="g-kids-input" 
              type="text" 
              placeholder="e.g. a movie about a lost puppy who finds a family 🐶"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
            <div className="g-kids-hints">
              <button type="button" className="g-kids-hint" onClick={() => handleHintClick('Fun animal friends')}>&apos;Fun animal friends&apos;</button>
              <button type="button" className="g-kids-hint" onClick={() => handleHintClick('Magic and dragons')}>&apos;Magic and dragons&apos;</button>
              <button type="button" className="g-kids-hint" onClick={() => handleHintClick('Robot buddies')}>&apos;Robot buddies&apos;</button>
              <button type="button" className="g-kids-hint" onClick={() => handleHintClick('Brave girl heroes')}>&apos;Brave girl heroes&apos;</button>
              <button type="button" className="g-kids-hint" onClick={() => handleHintClick('Something funny')}>&apos;Something funny&apos;</button>
            </div>
            <button type="submit" className="g-kids-btn">Ask Guillaume ✨</button>
          </form>
        </div>
      </section>
    </div>
  );
}
