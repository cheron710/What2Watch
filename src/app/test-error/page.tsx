// src/app/test-error/page.tsx
"use client";

import { useEffect } from "react";

export default function TestErrorPage() {
  useEffect(() => {
    // Throw an unhandled error on mount to trigger the Error Boundary
    throw new Error("Simulated projector jam error.");
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <p>Simulating unhandled error. Loading boundary...</p>
    </div>
  );
}
