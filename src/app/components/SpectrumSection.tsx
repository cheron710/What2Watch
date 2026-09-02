"use client";

import { useState } from "react";
import Link from "next/link";

const categories = [
  { id: "joy", label: "Pure Joy", color: "#C3BAA7", leftDir: "JOYFUL · WARM · LIGHT →", rightDir: "HEAVY · COLD · GRIEF →" },
  { id: "hopeful", label: "Hopeful", color: "#B4AB98", leftDir: "BRIGHT · OPEN · WARM →", rightDir: "DARK · CLOSED · COLD →" },
  { id: "easygoing", label: "Easygoing", color: "#A69C88", leftDir: "CALM · GENTLE · LIGHT →", rightDir: "INTENSE · SHARP · HEAVY →" },
  { id: "intriguing", label: "Intriguing", color: "#978D78", leftDir: "CURIOUS · MYSTERIOUS · COOL →", rightDir: "FAMILIAR · WARM · SIMPLE →" },
  { id: "tense", label: "Tense", color: "#877E69", leftDir: "SHARP · UNCOMFORTABLE · HEAVY →", rightDir: "SOFT · CALM · LIGHT →" },
  { id: "bittersweet", label: "Bittersweet", color: "#786F5B", leftDir: "JOYFUL · WARM · LIGHT →", rightDir: "HEAVY · COLD · GRIEF →" },
  { id: "melancholy", label: "Melancholy", color: "#6A614F", leftDir: "HEAVY · COLD · GRIEF →", rightDir: "LIGHT · WARM · JOY →" }
];

const filmsDataSpectrum: Record<string, { n: string; t: string; d: string; w: string; tags: string[]; rating: string }[]> = { 
  joy: [
    { n:"01", t:"Amélie", d:"Jean-Pierre Jeunet · 2001", w:"Whimsy that cuts to the bone.", tags:["Pure Joy","Whimsical"], rating:"R" },
    { n:"02", t:"Paddington 2", d:"Paul King · 2017", w:"Gentle, genuinely moving, defiantly kind.", tags:["Pure Joy","Warm"], rating:"PG" },
    { n:"03", t:"Grand Budapest Hotel", d:"Wes Anderson · 2014", w:"Nostalgia as a confection, melancholy disguised as beauty.", tags:["Pure Joy","Nostalgic"], rating:"R" }
  ], 
  hopeful: [
    { n:"01", t:"Secret Life of Walter Mitty", d:"Ben Stiller · 2013", w:"A permission slip to become yourself.", tags:["Hopeful","Adventure"], rating:"PG" },
    { n:"02", t:"Inside Out", d:"Pete Docter · 2015", w:"The wisdom to grieve and still move forward.", tags:["Hopeful","Cathartic"], rating:"PG" },
    { n:"03", t:"Little Miss Sunshine", d:"Dayton/Faris · 2006", w:"A family held together by shared brokenness.", tags:["Hopeful","Quirky"], rating:"R" }
  ], 
  easygoing: [
    { n:"01", t:"Paterson", d:"Jim Jarmusch · 2016", w:"Rhythm and meditation in the everyday.", tags:["Easygoing","Gentle"], rating:"R" },
    { n:"02", t:"Chef", d:"Jon Favreau · 2014", w:"Nourishment as metaphor, making things with your hands.", tags:["Easygoing","Warm"], rating:"R" },
    { n:"03", t:"Before Sunrise", d:"Richard Linklater · 1995", w:"Two strangers discovering each other through words.", tags:["Easygoing","Romantic"], rating:"R" }
  ], 
  intriguing: [
    { n:"01", t:"Arrival", d:"Denis Villeneuve · 2016", w:"Language, time, and sacrifice braided together.", tags:["Intriguing","Mind-bending"], rating:"PG-13" },
    { n:"02", t:"Ex Machina", d:"Alex Garland · 2014", w:"Desire and consciousness locked in a room.", tags:["Intriguing","Psychological"], rating:"R" },
    { n:"03", t:"The Prestige", d:"Christopher Nolan · 2006", w:"Obsession willing to pay any price.", tags:["Intriguing","Twisty"], rating:"PG-13" }
  ], 
  tense: [
    { n:"01", t:"Prisoners", d:"Denis Villeneuve · 2013", w:"Desperation corroding every principle you held.", tags:["Tense","Harrowing"], rating:"R" },
    { n:"02", t:"Good Time", d:"Safdie Bros · 2017", w:"One night of pure, claustrophobic panic.", tags:["Tense","Raw"], rating:"R" },
    { n:"03", t:"No Country for Old Men", d:"Coen Bros · 2007", w:"Evil arrives and the world slides sideways.", tags:["Tense","Bleak"], rating:"R" }
  ], 
  bittersweet: [
    { n:"01", t:"La La Land", d:"Damien Chazelle · 2016", w:"Beautiful things that cannot last.", tags:["Bittersweet","Romance"], rating:"PG-13" },
    { n:"02", t:"Marriage Story", d:"Noah Baumbach · 2019", w:"Love and endings occupying the same breath.", tags:["Bittersweet","Tender"], rating:"R" },
    { n:"03", t:"Lost in Translation", d:"Sofia Coppola · 2003", w:"Connection that the world dissolves come morning.", tags:["Bittersweet","Melancholy"], rating:"R" }
  ], 
  melancholy: [
    { n:"01", t:"Manchester by the Sea", d:"Kenneth Lonergan · 2016", w:"Grief that settles into your bones.", tags:["Melancholy","Grief"], rating:"R" },
    { n:"02", t:"Moonlight", d:"Barry Jenkins · 2016", w:"A quiet demolition of the self, frame by frame.", tags:["Melancholy","Tender"], rating:"R" },
    { n:"03", t:"Her", d:"Spike Jonze · 2013", w:"Loneliness so intimate it becomes beautiful.", tags:["Melancholy","Poignant"], rating:"R" }
  ] 
};

export default function SpectrumSection() {
  const [activeIndex, setActiveIndex] = useState(5);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeCategory = categories[activeIndex];
  const films = filmsDataSpectrum[activeCategory.id];
  const step = 100 / categories.length;

  return (
    <section id="spectrum">
      <div className="spectrum-container">
        <div className="spectrum-intro" data-reveal="fade">
          <span className="spectrum-eyebrow">Find By Feeling</span>
          <h2 className="spectrum-h">The Mood Spectrum</h2>
          <p className="spectrum-sub">Move across the emotional spectrum. Every film finds its place.</p>
        </div>

        <div className="gradient-spectrum">
          <div 
            className="grad-active-zone" 
            style={{ 
              left: `${activeIndex * step}%`, 
              width: `${step}%` 
            }} 
          />
        </div>

        <div className="spec-categories">
          {categories.map((cat, idx) => {
             const isDimmed = hoveredIndex !== null && hoveredIndex !== idx;
            
            return (
              <div 
                key={cat.id}
                className={`spec-item ${idx === activeIndex ? 'active' : ''} ${isDimmed ? 'dim' : ''}`}
                style={{ color: cat.color }}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
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
          <div className="dir-label">{activeCategory.leftDir}</div>
          <div className="dir-label">{activeCategory.rightDir}</div>
        </div>

        <div className="spec-films">
           {films.map((f) => (
             <Link href={`/search?q=${encodeURIComponent(f.t)}`} key={f.t} className="film-row block">
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
                      border: `0.5px solid ${idx === 0 ? activeCategory.color : 'var(--color-border)'}`,
                      color: idx === 0 ? activeCategory.color : 'var(--color-ink-3)'
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
          <Link className="link-arrow" href="/emotional-spectrum">
            Explore the full spectrum <span className="arw">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
