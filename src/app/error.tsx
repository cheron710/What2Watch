"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./status.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for observability; replace with your logger of choice in prod.
    console.error(error);
  }, [error]);

  return (
    <div className="status-page">
      <div className="status-inner">
        <span className="status-code">500</span>
        <h1 className="status-title">The projector jammed</h1>
        <p className="status-body">
          Something went wrong on our end. We&apos;ve noted it. You can try again,
          or head back to the lobby.
        </p>
        <div className="status-actions">
          <button onClick={reset} className="status-btn">Try again</button>
          <Link href="/" className="status-link">Return home →</Link>
        </div>
      </div>
    </div>
  );
}
