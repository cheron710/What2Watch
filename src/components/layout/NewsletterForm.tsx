"use client";

import { useState } from "react";

/** Newsletter sign-up — client island inside the (server-rendered) footer. */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="newsletter-copy" role="status">
        Thanks — you&apos;re on the list. Watch your inbox for our next dispatch.
      </p>
    );
  }

  return (
    <form
      className="newsletter-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
    >
      <input
        type="email"
        className="newsletter-input"
        placeholder="your@email.com"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        suppressHydrationWarning
      />
      <button type="submit" className="newsletter-btn" suppressHydrationWarning>
        Sign Up →
      </button>
    </form>
  );
}
