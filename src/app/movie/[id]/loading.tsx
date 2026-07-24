import "../movie.css";
import "./skeleton.css";

/** Skeleton shown while the movie detail server component streams. */
export default function MovieLoading() {
  return (
    <div className="mv-page">
      <section className="mv-hero">
        <div className="mv-hero-scrim" />
        <div className="mv-hero-inner">
          <div className="mv-poster sk-shimmer" />
          <div style={{ width: "100%" }}>
            <div className="sk-line sk-shimmer" style={{ width: "30%", height: 14, marginBottom: 20 }} />
            <div className="sk-line sk-shimmer" style={{ width: "65%", height: 56, marginBottom: 18 }} />
            <div className="sk-line sk-shimmer" style={{ width: "45%", height: 18, marginBottom: 26 }} />
            <div className="sk-line sk-shimmer" style={{ width: 320, height: 48, borderRadius: 3 }} />
          </div>
        </div>
      </section>
      <div className="mv-body">
        <main>
          <div className="sk-line sk-shimmer" style={{ width: "20%", height: 12, marginBottom: 18 }} />
          {[92, 88, 80, 84, 60].map((w, i) => (
            <div key={i} className="sk-line sk-shimmer" style={{ width: `${w}%`, height: 16, marginBottom: 12 }} />
          ))}
          <div className="sk-rec-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sk-poster sk-shimmer" />
            ))}
          </div>
        </main>
        <aside>
          <div className="sk-block sk-shimmer" />
        </aside>
      </div>
    </div>
  );
}
