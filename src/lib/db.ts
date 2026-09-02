import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

export const MOCK_MOVIES: any[] = [
  {
    id: 939243,
    title: "Nosferatu",
    original_title: "Nosferatu",
    overview: "A gothic tale of obsession between a haunted young woman and the terrifying vampire infatuated with her.",
    release_date: "2024-12-25",
    poster_path: "https://preview.redd.it/nosferatu-2024-textless-v0-1ow07comz23e1.jpeg?auto=webp&s=02016edee8382031a7ac0bcaf73733b25aac623e",
    backdrop_path: "/nosferatu_bg.jpg",
    vote_average: 7.9,
    vote_count: 512,
    popularity: 180.5,
    runtime: 132,
    tagline: "A gothic nightmare.",
    custom_editorial_description: "Robert Eggers masterfully revives the silent classic into a chilling meditation on desire and dread.",
    emotional_tags: ["Grief", "Fear"],
    context_tags: ["Midnight Movie", "Rainy Day"],
    craft_tags: ["Cinematography", "Sound Design"],
    festival_tags: ["Venice"],
    is_featured: true,
    is_homepage_hero: true,
    visibility: "visible",
    status: "published",
    trailer_url: "https://www.youtube.com/watch?v=uid123",
    streaming_providers: [{ name: "Netflix", price: "Subscription" }],
    recommendation_score: 94,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 100012,
    title: "Michael",
    original_title: "Michael",
    overview: "The life and music of the King of Pop, Michael Jackson, as told through his career milestones and personal struggles.",
    release_date: "2026-04-18",
    poster_path: "https://preview.redd.it/michael-2026-textless-v0-33ofespqktqg1.jpeg?width=1080&crop=smart&auto=webp&s=15039297a090658da5fed00cbd32233d1523911f",
    backdrop_path: "/michael_bg.jpg",
    vote_average: 8.5,
    vote_count: 24,
    popularity: 250.0,
    runtime: 155,
    tagline: "The icon re-examined.",
    custom_editorial_description: "Antoine Fuqua reconstructs the complex, brilliant, and tragic journey of Michael Jackson.",
    emotional_tags: ["Joy", "Nostalgia"],
    context_tags: ["Biopic"],
    craft_tags: ["Performance", "Choreography"],
    festival_tags: [],
    is_featured: true,
    is_homepage_hero: false,
    visibility: "visible",
    status: "published",
    trailer_url: "",
    streaming_providers: [],
    recommendation_score: 88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 313369,
    title: "La La Land",
    original_title: "La La Land",
    overview: "Mia, an aspiring actress, and Sebastian, a dedicated jazz musician, struggle to make ends meet in a city known for crushing hopes.",
    release_date: "2016-12-09",
    poster_path: "https://wallpapercave.com/wp/wp7039123.jpg",
    backdrop_path: "/lalaland_bg.jpg",
    vote_average: 7.9,
    vote_count: 15800,
    popularity: 65.4,
    runtime: 128,
    tagline: "Here's to the fools who dream.",
    custom_editorial_description: "Damien Chazelle's bittersweet romance that pays homage to classic musicals while remaining raw.",
    emotional_tags: ["Love", "Nostalgia"],
    context_tags: ["Date Night"],
    craft_tags: ["Music", "Color Palette"],
    festival_tags: ["Venice", "Oscars"],
    is_featured: false,
    is_homepage_hero: false,
    visibility: "visible",
    status: "published",
    trailer_url: "https://www.youtube.com/watch?v=0pdqf4P9MB8",
    streaming_providers: [{ name: "Prime Video", price: "Rent" }],
    recommendation_score: 92,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 558449,
    title: "Gladiator II",
    original_title: "Gladiator II",
    overview: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.",
    release_date: "2024-11-13",
    poster_path: "/hoxwK13J2Jg7227g86jVnH6w9t5.jpg",
    backdrop_path: "/9s959g5720g.jpg",
    genre_ids: [28, 12, 18],
    vote_average: 6.8,
    vote_count: 1450,
    popularity: 3450.0,
    runtime: 148,
    tagline: "Prepare to be entertained.",
    custom_editorial_description: "A sweeping, action-packed return to the Colosseum that honors the legacy of the original while forging a bold new path.",
    is_featured: true,
    is_homepage_hero: false,
    visibility: "visible",
    status: "published",
    recommendation_score: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 402431,
    title: "Wicked",
    original_title: "Wicked",
    overview: "Elphaba, an misunderstood young woman because of her green skin, and Glinda, a popular girl, become friends at Shiz University in the Land of Oz. After an encounter with the Wizard, their friendship reaches a crossroads.",
    release_date: "2024-11-20",
    poster_path: "/2v5JTeZ962Om6jLz46Z7Vxp4x54.jpg",
    backdrop_path: "/6mLvl9VygScdt78v6e7aUeh61jA.jpg",
    genre_ids: [18, 14, 10402],
    vote_average: 7.2,
    vote_count: 890,
    popularity: 2900.0,
    runtime: 160,
    tagline: "Everyone deserves the chance to fly.",
    custom_editorial_description: "A visually spectacular adaptation of the beloved musical, sparkling with heart, vocal prowess, and magic.",
    is_featured: true,
    is_homepage_hero: false,
    visibility: "visible",
    status: "published",
    recommendation_score: 90,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    original_title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    release_date: "2024-02-27",
    poster_path: "/czembDcB23y744R4XwqzC5j7jGa.jpg",
    backdrop_path: "/xOMo8v6mB6nsrYiYSt66bq4jCu1.jpg",
    genre_ids: [878, 12],
    vote_average: 8.2,
    vote_count: 4800,
    popularity: 1500.0,
    runtime: 166,
    tagline: "Long live the fighters.",
    custom_editorial_description: "Denis Villeneuve's sci-fi epic concludes with breathtaking scale, complex politics, and stunning visual design.",
    is_featured: true,
    is_homepage_hero: false,
    visibility: "visible",
    status: "published",
    recommendation_score: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 157336,
    title: "Interstellar",
    original_title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    release_date: "2014-11-05",
    poster_path: "/gEU2QvEOmfcFgawjJySyvNIvEVR.jpg",
    backdrop_path: "/xJHok7Rj2v57WkiLYO406u7iZz5.jpg",
    genre_ids: [12, 18, 878],
    vote_average: 8.4,
    vote_count: 32000,
    popularity: 180.0,
    runtime: 169,
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    custom_editorial_description: "Christopher Nolan's awe-inspiring journey through space and time, anchoring cosmic spectacle in human love.",
    is_featured: true,
    is_homepage_hero: false,
    visibility: "visible",
    status: "published",
    recommendation_score: 97,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 933260,
    title: "The Substance",
    original_title: "The Substance",
    overview: "A fading celebrity decides to use a black-market drug, a cell-replicating substance that temporarily creates a younger, better version of herself.",
    release_date: "2024-09-07",
    poster_path: "/lqoMzCcqvxe6j16CW5G5wD5Dq5y.jpg",
    backdrop_path: "/5S1o06r4g7XN4y3l32oV5w9j1V0.jpg",
    genre_ids: [27, 878],
    vote_average: 7.3,
    vote_count: 1200,
    popularity: 1100.0,
    runtime: 140,
    tagline: "Have you ever dreamed of a better version of yourself?",
    custom_editorial_description: "A wild, satirical body horror that takes aim at Hollywood beauty standards with extreme intensity and dark humor.",
    is_featured: true,
    is_homepage_hero: false,
    visibility: "visible",
    status: "published",
    recommendation_score: 88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const MOCK_DB_PATH = path.join(process.cwd(), "src/services/mockDb.json");

export async function getMoviesDb(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    try {
      if (fs.existsSync(MOCK_DB_PATH)) {
        const db = JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf8"));
        return db.movies || [];
      }
    } catch (e) {
      console.error("Read mock database error in getMoviesDb:", e);
    }
    return MOCK_MOVIES;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("popularity", { ascending: false });
    if (error) {
      console.error("Supabase Error getting movies in getMoviesDb:", error);
      return MOCK_MOVIES;
    }

    // Merge Supabase movies with MOCK_MOVIES to ensure seeded movies are always available
    const merged = [...(data || [])];
    MOCK_MOVIES.forEach((mock) => {
      if (!merged.some((m) => m.id === mock.id)) {
        merged.push(mock);
      }
    });
    return merged;
  } catch (e) {
    console.error("Unexpected error in getMoviesDb:", e);
    return MOCK_MOVIES;
  }
}
