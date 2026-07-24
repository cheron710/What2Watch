"use client";

import { useState, useEffect } from "react";
import { Play, X } from "lucide-react";

/** A play button that opens the YouTube trailer in an accessible modal. */
export default function TrailerModal({ youtubeKey, label = "Watch Trailer" }: { youtubeKey: string; label?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <>
      <button className="mv-trailer-btn" onClick={() => setOpen(true)}>
        <Play size={16} strokeWidth={2} fill="currentColor" />
        {label}
      </button>

      {open && (
        <div className="mv-modal" role="dialog" aria-modal="true" aria-label="Trailer" onClick={() => setOpen(false)}>
          <button className="mv-modal-close" onClick={() => setOpen(false)} aria-label="Close trailer">
            <X size={26} />
          </button>
          <div className="mv-modal-frame" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&rel=0`}
              title="Movie trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
