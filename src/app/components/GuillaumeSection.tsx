"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const HINTS = [
  "Movies where the dog survives",
  "Dark psychological films",
  "Feel less alone at 2am",
];

export default function GuillaumeSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/guillaume?q=${encodeURIComponent(query)}`);
    }
  };

  const handleHintClick = (hint: string) => {
    setQuery(hint);
    router.push(`/guillaume?q=${encodeURIComponent(hint)}`);
  };

  return (
    <section id="guillaume">
      <div className="guillaume-inner" data-reveal="fade">
        <div className="g-dot"></div>
        <span className="g-eye">Still not sure what to see?</span>
        <h2 className="g-h">Don&apos;t worry — we&apos;ve got you.</h2>
        <p className="guillaume-tagline">
          Describe what you feel, and Guillaume will find exactly what you need.
        </p>

        <form className="g-form" onSubmit={handleSearch}>
          <input
            className="g-input"
            type="text"
            placeholder="a sad space movie with hope at the end"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Describe what you feel like watching"
            suppressHydrationWarning
          />

          <div className="g-controls">
            <div className="g-hints">
              {HINTS.map((hint) => (
                <button
                  key={hint}
                  type="button"
                  className="g-hint"
                  onClick={() => handleHintClick(hint)}
                  suppressHydrationWarning
                >
                  {hint}
                </button>
              ))}
            </div>
            <button type="submit" className="g-btn" suppressHydrationWarning>
              Ask Guillaume →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
