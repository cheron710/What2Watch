"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Progressive scroll-reveal engine. Any element marked with `data-reveal`
 * fades/slides into place the first time it enters the viewport. Re-scans on
 * every route change and honours prefers-reduced-motion.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveal = (el: Element) => el.classList.add("reveal-in");
    let cleanup = () => {};

    // Give freshly-navigated markup a frame to mount before we query it.
    const raf = requestAnimationFrame(() => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal]:not(.reveal-in)")
      );

      if (reduce || !("IntersectionObserver" in window)) {
        nodes.forEach(reveal);
        return;
      }

      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              reveal(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
      );

      nodes.forEach((n) => {
        // Anything already on-screen at load reveals immediately.
        const r = n.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.94 && r.bottom > 0) reveal(n);
        else io.observe(n);
      });

      cleanup = () => io.disconnect();
    });

    return () => {
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, [pathname]);

  return null;
}
