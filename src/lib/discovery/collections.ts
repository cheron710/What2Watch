// src/lib/discovery/collections.ts
// Declarative catalogue of the platform's editorial discovery lenses. Each
// collection maps a slug to display copy and a TMDb `discover` query, so the
// dynamic routes (/emotion, /experience, /season, /festival) and their hub
// pages all render from one source of truth.

export interface Collection {
  slug: string;
  /** Short kicker shown above the title. */
  eyebrow: string;
  title: string;
  /** One-line teaser used on hub cards. */
  teaser: string;
  /** Longer editorial lede shown on the collection page. */
  lede: string;
  /** Accent colour for the hub card. */
  color: string;
  /** TMDb discover query parameters. */
  query: Record<string, string | number>;
}

const withDefaults = (q: Record<string, string | number>) => ({
  sort_by: "popularity.desc",
  "vote_count.gte": 200,
  include_adult: 0,
  ...q,
});

// ── Emotional spectrum (mood) ──────────────────────────────────────────────
export const EMOTIONS: Collection[] = [
  {
    slug: "pure-joy",
    eyebrow: "The Mood Spectrum",
    title: "Pure Joy",
    teaser: "Warm, light, life-affirming.",
    lede: "Films that leave the room brighter than they found it — whimsical, tender, and unafraid of delight.",
    color: "#DFA15A",
    query: withDefaults({ with_genres: "35,10751", "vote_average.gte": 6.8 }),
  },
  {
    slug: "hopeful",
    eyebrow: "The Mood Spectrum",
    title: "Hopeful",
    teaser: "Open horizons, quiet courage.",
    lede: "Stories about becoming — the permission slip to change, to begin, to believe it might work out.",
    color: "#8FAF6B",
    query: withDefaults({ with_genres: "12,18", "vote_average.gte": 7 }),
  },
  {
    slug: "easygoing",
    eyebrow: "The Mood Spectrum",
    title: "Easygoing",
    teaser: "Calm, gentle, unhurried.",
    lede: "The cinematic equivalent of a slow Sunday — rhythm over plot, atmosphere over incident.",
    color: "#C9A96A",
    query: withDefaults({ with_genres: "35,10749", "vote_average.gte": 6.5 }),
  },
  {
    slug: "intriguing",
    eyebrow: "The Mood Spectrum",
    title: "Intriguing",
    teaser: "Curious, cool, cerebral.",
    lede: "Films that hand you a puzzle and trust you to sit with it — mystery, science fiction, and slow-burn tension.",
    color: "#5C6E91",
    query: withDefaults({ with_genres: "9648,878", "vote_average.gte": 6.8 }),
  },
  {
    slug: "tense",
    eyebrow: "The Mood Spectrum",
    title: "Tense",
    teaser: "Sharp, uneasy, gripping.",
    lede: "For nights you want your pulse in your throat — thrillers and horror that refuse to let go.",
    color: "#A23B2A",
    query: withDefaults({ with_genres: "53,27", "vote_average.gte": 6.5 }),
  },
  {
    slug: "bittersweet",
    eyebrow: "The Mood Spectrum",
    title: "Bittersweet",
    teaser: "Beautiful things that end.",
    lede: "Love and loss in the same breath — romances and dramas that ache in the best possible way.",
    color: "#9A7A5A",
    query: withDefaults({ with_genres: "18,10749", "vote_average.gte": 7.2 }),
  },
  {
    slug: "melancholy",
    eyebrow: "The Mood Spectrum",
    title: "Melancholy",
    teaser: "Heavy, tender, luminous.",
    lede: "Grief given shape and grace — quiet demolitions of the self, frame by frame.",
    color: "#6F8FA8",
    query: withDefaults({ with_genres: "18", "vote_average.gte": 7.4, "vote_count.gte": 400 }),
  },
];

// ── Cinema by experience (craft) ───────────────────────────────────────────
export const EXPERIENCES: Collection[] = [
  {
    slug: "visual-poetry",
    eyebrow: "Cinema by Experience",
    title: "Visual Poetry",
    teaser: "Composed, not captured.",
    lede: "Films where every frame could hang in a gallery — colour, light, and composition as the main event.",
    color: "#B8763A",
    query: withDefaults({ with_genres: "18,14", "vote_average.gte": 7.5, "vote_count.gte": 600 }),
  },
  {
    slug: "plot-twists",
    eyebrow: "Cinema by Experience",
    title: "The Rug-Pull",
    teaser: "Endings that rewrite the film.",
    lede: "Mysteries and thrillers built on a single, devastating turn — best seen knowing nothing.",
    color: "#5C6E91",
    query: withDefaults({ with_genres: "9648,53", "vote_average.gte": 7 }),
  },
  {
    slug: "pure-adrenaline",
    eyebrow: "Cinema by Experience",
    title: "Pure Adrenaline",
    teaser: "Kinetic, loud, relentless.",
    lede: "Action and adventure engineered for the big screen and the loudest speakers you own.",
    color: "#A23B2A",
    query: withDefaults({ with_genres: "28,12", "vote_average.gte": 6.5 }),
  },
  {
    slug: "worlds-apart",
    eyebrow: "Cinema by Experience",
    title: "Worlds Apart",
    teaser: "Invented realities, fully built.",
    lede: "Science fiction and fantasy that construct somewhere new and dare you to believe in it.",
    color: "#6F5C91",
    query: withDefaults({ with_genres: "878,14", "vote_average.gte": 7 }),
  },
  {
    slug: "true-stories",
    eyebrow: "Cinema by Experience",
    title: "True Stories",
    teaser: "Real lives, rendered whole.",
    lede: "History and documentary that turn the record into something you can feel.",
    color: "#7A6A4F",
    query: withDefaults({ with_genres: "36,99", "vote_average.gte": 7 }),
  },
  {
    slug: "quiet-craft",
    eyebrow: "Cinema by Experience",
    title: "Quiet Craft",
    teaser: "Small films, immense care.",
    lede: "Character-driven dramas where the craft hides in the restraint — nothing wasted, nothing loud.",
    color: "#6F8FA8",
    query: withDefaults({ with_genres: "18", "vote_average.gte": 7.6, "vote_count.gte": 800 }),
  },
];

// ── Seasonal collections ───────────────────────────────────────────────────
export const SEASONS: Collection[] = [
  {
    slug: "summer",
    eyebrow: "Seasonal Collections",
    title: "Summer",
    teaser: "Golden-hour, wide-open.",
    lede: "Road trips, first loves, and blockbuster energy — the films of long light and longer nights.",
    color: "#D4A537",
    query: withDefaults({ with_genres: "12,35", "vote_average.gte": 6.5 }),
  },
  {
    slug: "fall",
    eyebrow: "Seasonal Collections",
    title: "Fall",
    teaser: "Crisp, cosy, a little haunted.",
    lede: "Sweater-weather cinema — introspective dramas and just enough of a chill down the spine.",
    color: "#A0714F",
    query: withDefaults({ with_genres: "18,9648", "vote_average.gte": 7 }),
  },
  {
    slug: "winter",
    eyebrow: "Seasonal Collections",
    title: "Winter",
    teaser: "Snowed-in and warm-hearted.",
    lede: "Fireplace films — holiday ensembles, snowbound romance, and stories worth staying in for.",
    color: "#6BA3C8",
    query: withDefaults({ with_genres: "10751,10749", "vote_average.gte": 6.5 }),
  },
  {
    slug: "spring",
    eyebrow: "Seasonal Collections",
    title: "Spring",
    teaser: "Fresh starts, new light.",
    lede: "Renewal on screen — coming-of-age, transformation, and the gentle magic of beginning again.",
    color: "#7CB342",
    query: withDefaults({ with_genres: "18,10751", "vote_average.gte": 7 }),
  },
];

// ── Festivals ──────────────────────────────────────────────────────────────
export const FESTIVALS: Collection[] = [
  {
    slug: "cannes",
    eyebrow: "Festival Season",
    title: "Cannes",
    teaser: "The Croisette's boldest.",
    lede: "Auteur cinema at its most uncompromising — the kind of film the Palme d'Or exists to crown.",
    color: "#B84200",
    query: withDefaults({ with_genres: "18", "vote_average.gte": 7.8, "vote_count.gte": 1000, sort_by: "vote_average.desc" }),
  },
  {
    slug: "venice",
    eyebrow: "Festival Season",
    title: "Venice",
    teaser: "Where awards seasons begin.",
    lede: "The Lido's prestige launches — sweeping, ambitious films built to be argued about for months.",
    color: "#7A5C2E",
    query: withDefaults({ with_genres: "18,36", "vote_average.gte": 7.6, "vote_count.gte": 900, sort_by: "vote_average.desc" }),
  },
  {
    slug: "sundance",
    eyebrow: "Festival Season",
    title: "Sundance",
    teaser: "Independent, unfiltered.",
    lede: "The discoveries — small, fierce, personal films that go on to redefine what mainstream means.",
    color: "#3E6E8E",
    query: withDefaults({ with_genres: "18,35", "vote_average.gte": 7.2, "vote_count.gte": 400, sort_by: "vote_average.desc" }),
  },
  {
    slug: "berlin",
    eyebrow: "Festival Season",
    title: "Berlin",
    teaser: "Political, poetic, brave.",
    lede: "The Berlinale's social conscience — cinema that looks the world in the eye and does not blink.",
    color: "#5C6E4F",
    query: withDefaults({ with_genres: "18", "vote_average.gte": 7.4, "vote_count.gte": 500, sort_by: "vote_average.desc" }),
  },
];

// ── Lookups ────────────────────────────────────────────────────────────────
export const COLLECTION_GROUPS = {
  emotion: EMOTIONS,
  experience: EXPERIENCES,
  season: SEASONS,
  festival: FESTIVALS,
} as const;

export type CollectionGroup = keyof typeof COLLECTION_GROUPS;

export function findCollection(group: CollectionGroup, slug: string): Collection | null {
  return COLLECTION_GROUPS[group].find((c) => c.slug === slug) ?? null;
}
