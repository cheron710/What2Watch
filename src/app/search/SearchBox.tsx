"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      className="search-page-box"
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
    >
      <Search size={20} strokeWidth={1.6} className="search-page-icon" />
      <input
        type="text"
        className="search-page-input"
        placeholder="Search films by title…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search films"
        autoFocus
      />
      <button type="submit" className="search-page-submit">
        Search
      </button>
    </form>
  );
}
