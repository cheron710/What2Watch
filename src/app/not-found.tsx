import Link from "next/link";
import "./status.css";

export default function NotFound() {
  return (
    <div className="status-page">
      <div className="status-inner">
        <span className="status-code">404</span>
        <h1 className="status-title">This reel is missing</h1>
        <p className="status-body">
          The page you were looking for has left the theatre. Perhaps it was never
          on the marquee — or perhaps the projector simply skipped a frame.
        </p>
        <div className="status-actions">
          <Link href="/" className="status-btn">Back to home</Link>
          <Link href="/guillaume" className="status-link">Ask Guillaume for a film →</Link>
        </div>
      </div>
    </div>
  );
}
