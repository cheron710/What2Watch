"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="g-dot"></div>
          <span className="g-eye">Still not sure what to see?</span>
          <h2 className="g-h">Don&apos;t worry — we&apos;ve got you.</h2>
          <div className="guillaume-tagline">Just describe what you feel, and Guillaume will find what you need.</div>
        </div>
        
        <form onSubmit={handleSearch}>
          <input 
            className="g-input" 
            type="text" 
            placeholder="e.g. a sad space movie with hope at the end"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            suppressHydrationWarning
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div className="g-hints">
              <button type="button" className="g-hint" onClick={() => handleHintClick('Movies where the dog survives')} suppressHydrationWarning>&apos;Movies where the dog survives&apos;</button>
              <span className="g-sep">·</span>
              <button type="button" className="g-hint" onClick={() => handleHintClick('Dark psychological films')} suppressHydrationWarning>&apos;Dark psychological films&apos;</button>
              <span className="g-sep">·</span>
              <button type="button" className="g-hint" onClick={() => handleHintClick('Feel less alone at 2am')} suppressHydrationWarning>&apos;Feel less alone at 2am&apos;</button>
            </div>
            <button type="submit" className="g-btn" suppressHydrationWarning>Ask Guillaume →</button>
          </div>
        </form>
      </div>
    </section>
  );
}
