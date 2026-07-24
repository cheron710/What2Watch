// src/lib/recommendations/engine.ts
// Content-based movie recommendation engine using cosine similarity.
// Computes recommendations entirely server-side with no external ML API.

import type { TMDbMovie } from "@/lib/tmdb/client";

// Human-readable TMDb genre names, used to explain recommendations.
const GENRE_NAMES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10769: "Foreign",
};

// ─── Feature Vector ───────────────────────────────────────────────────────────
// Each movie is encoded as a sparse numeric vector over:
//   - Genre one-hot  (20 known TMDb genre slots)
//   - Normalised popularity  [0, 1]
//   - Normalised vote_average  [0, 10] → [0, 1]
//   - Normalised release year  [1900, 2030] → [0, 1]

const ALL_GENRE_IDS = [
  28,    // Action
  12,    // Adventure
  16,    // Animation
  35,    // Comedy
  80,    // Crime
  99,    // Documentary
  18,    // Drama
  10751, // Family
  14,    // Fantasy
  36,    // History
  27,    // Horror
  10402, // Music
  9648,  // Mystery
  10749, // Romance
  878,   // Science Fiction
  10770, // TV Movie
  53,    // Thriller
  10752, // War
  37,    // Western
  10769, // Foreign
];

export function buildFeatureVector(movie: TMDbMovie): number[] {
  const genreIds = movie.genre_ids ?? [];
  const genreVec = ALL_GENRE_IDS.map((g) => (genreIds.includes(g) ? 1 : 0));
  const popularity = Math.min((movie.popularity ?? 0) / 1000, 1); // cap at 1000
  const rating = (movie.vote_average ?? 0) / 10;
  const year = movie.release_date
    ? (parseInt(movie.release_date.substring(0, 4), 10) - 1900) / 130
    : 0.5;
  return [...genreVec, popularity, rating, year];
}

// ─── Cosine Similarity ────────────────────────────────────────────────────────
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ─── Recommendation ───────────────────────────────────────────────────────────

export interface ScoredMovie extends TMDbMovie {
  score: number;
  reason: string;
}

/**
 * Produce a short, human editorial explanation of why `candidate` is similar to
 * `target`, grounded in the actual feature overlap that drove the score.
 */
export function explainRecommendation(target: TMDbMovie, candidate: TMDbMovie): string {
  const shared = (target.genre_ids ?? []).filter((g) =>
    (candidate.genre_ids ?? []).includes(g)
  );
  const sharedNames = shared.map((g) => GENRE_NAMES[g]).filter(Boolean);

  const clauses: string[] = [];
  if (sharedNames.length >= 2) {
    clauses.push(`shares its ${sharedNames.slice(0, 2).join(" & ").toLowerCase()} sensibility`);
  } else if (sharedNames.length === 1) {
    clauses.push(`carries the same ${sharedNames[0].toLowerCase()} current`);
  }

  const targetYear = Number(target.release_date?.slice(0, 4)) || 0;
  const candYear = Number(candidate.release_date?.slice(0, 4)) || 0;
  if (targetYear && candYear && Math.abs(targetYear - candYear) <= 6) {
    clauses.push("belongs to the same era");
  }

  if (candidate.vote_average >= 7.5) {
    clauses.push("holds up as a critical favourite");
  }

  if (clauses.length === 0) {
    clauses.push("resonates on tone and pacing");
  }

  const lead = clauses[0].charAt(0).toUpperCase() + clauses[0].slice(1);
  const rest = clauses.slice(1);
  return rest.length ? `${lead}, and ${rest.join(", ")}.` : `${lead}.`;
}

/**
 * Given a target movie and a pool of candidate movies,
 * returns the top-N most similar candidates by cosine similarity.
 */
export function getRecommendations(
  target: TMDbMovie,
  pool: TMDbMovie[],
  topN = 10
): ScoredMovie[] {
  const targetVec = buildFeatureVector(target);

  return pool
    .filter((m) => m.id !== target.id)
    .map((m) => ({
      ...m,
      score: cosineSimilarity(targetVec, buildFeatureVector(m)),
      reason: explainRecommendation(target, m),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/**
 * Aggregate recommendations from a user's watched list.
 * Merges vectors from multiple seed movies (average pooling),
 * then ranks the full candidate pool.
 */
export function getRecommendationsFromWatchlist(
  watched: TMDbMovie[],
  pool: TMDbMovie[],
  topN = 20
): ScoredMovie[] {
  if (watched.length === 0) return [];

  const watchedIds = new Set(watched.map((m) => m.id));
  const vecs = watched.map(buildFeatureVector);
  const dim = vecs[0].length;

  // Average pooling across all watched films
  const avgVec = Array.from({ length: dim }, (_, i) =>
    vecs.reduce((sum, v) => sum + v[i], 0) / vecs.length
  );

  return pool
    .filter((m) => !watchedIds.has(m.id))
    .map((m) => ({
      ...m,
      score: cosineSimilarity(avgVec, buildFeatureVector(m)),
      reason: "Aligned with the genres and tones across your watchlist.",
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
