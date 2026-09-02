// src/services/adminService.ts
"use server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

// Get safe server-side Supabase client
async function getSupabaseClient(): Promise<any> {
  if (!isSupabaseConfigured) return null;
  return (await createSupabaseServerClient()) as any;
}

// ── File System Mock DB Setup ──────────────────────────────────────
const MOCK_DB_PATH = path.join(process.cwd(), "src/services/mockDb.json");

// ── Seed Data ──────────────────────────────────────────────────────
import { MOCK_MOVIES } from "@/lib/db";

const MOCK_USERS = [
  { id: "usr-admin-1", display_name: "Admin User", email: "admin@what2watch.com", username: "admin", role: "admin", created_at: "2026-01-01T00:00:00Z", last_login: "2026-07-21T10:00:00Z", avatar_url: "", status: "active" },
  { id: "usr-user-2", display_name: "John Doe", email: "john@doe.com", username: "johndoe", role: "user", created_at: "2026-02-15T12:00:00Z", last_login: "2026-07-20T18:45:00Z", avatar_url: "", status: "active" },
  { id: "usr-user-3", display_name: "Jane Smith", email: "jane@smith.com", username: "janesmith", role: "user", created_at: "2026-03-10T09:30:00Z", last_login: "2026-07-15T14:20:00Z", avatar_url: "", status: "suspended" }
];

const MOCK_SETTINGS = {
  site_name: "What2Watch",
  logo_url: "",
  favicon_url: "",
  homepage_hero_title: "Curated Cinema.",
  homepage_hero_subtitle: "Discovering films through mood, emotion, and experience.",
  footer_text: "© 2026 What2Watch. Curated Cinema. All rights reserved.",
  social_links: { instagram: "https://instagram.com/what2watch", twitter: "https://twitter.com/what2watch" },
  tmdb_key: "a57cb6fe3fcb73178efd632e0af61151",
  claude_key: "claude_mock_key_abcdef",
  openai_key: "openai_mock_key_xyz987",
  smtp_host: "smtp.mailtrap.io",
  smtp_port: 587,
  smtp_user: "mock_smtp_user",
  smtp_pass: "mock_smtp_password",
  maintenance_mode: false,
  email_settings: { system_emails: true, news_blast: false },
  cache_settings: { ttl: 3600 },
  updated_at: new Date().toISOString()
};

const MOCK_GUILLAUME = {
  temperature: 0.7,
  model: "gemini-1.5-flash",
  max_tokens: 1024,
  system_prompt: "You are Guillaume, a sophisticated French cinema expert. Recommend 3 films based on the user's emotional requests.",
  fallback_prompt: "If no prompt matches, recommend classic films by Truffaut, Godard, and Varda.",
  logs: [
    { id: "log-1", timestamp: "2026-07-21T16:45:10Z", user: "John Doe", prompt: "I feel lonely on a rainy Sunday afternoon.", model: "gemini-1.5-flash", response: "Guillaume suggested: La La Land, Lost in Translation, Her.", status: "success", tokens: 412, latency: 1200 },
    { id: "log-2", timestamp: "2026-07-21T15:10:00Z", user: "Guest", prompt: "Give me intense horror films.", model: "gemini-1.5-flash", response: "Guillaume suggested: Nosferatu, The Witch, Hereditary.", status: "success", tokens: 380, latency: 980 }
  ]
};

const MOCK_ANALYTICS = {
  stats: {
    totalUsers: 1450,
    totalMovies: 320,
    totalFavorites: 2480,
    totalWatchlists: 3120,
    todayVisits: 180,
    monthlyVisits: 4500,
    aiRequests: 742,
    recCount: 1540
  },
  charts: {
    dailyUsers: [
      { date: "Jul 15", users: 120 },
      { date: "Jul 16", users: 135 },
      { date: "Jul 17", users: 150 },
      { date: "Jul 18", users: 140 },
      { date: "Jul 19", users: 165 },
      { date: "Jul 20", users: 180 },
      { date: "Jul 21", users: 195 }
    ],
    moviePopularity: [
      { title: "Nosferatu", popularity: 180 },
      { title: "Michael", popularity: 250 },
      { title: "La La Land", popularity: 65 },
      { title: "The Substance", popularity: 112 },
      { title: "Dune: Part Two", popularity: 98 }
    ],
    recUsage: [
      { source: "Guillaume AI", count: 742 },
      { source: "Mood Engine", count: 480 },
      { source: "Staff Picks", count: 318 }
    ],
    moodPopularity: [
      { mood: "Joy", count: 320 },
      { mood: "Fear", count: 180 },
      { mood: "Hope", count: 240 },
      { mood: "Grief", count: 110 },
      { mood: "Nostalgia", count: 290 }
    ]
  },
  recentActivity: [
    { id: "act-1", user: "Admin User", action: "Updated metadata for Nosferatu", time: "5 mins ago" },
    { id: "act-2", user: "John Doe", action: "Added La La Land to Watchlist", time: "1 hour ago" },
    { id: "act-3", user: "System", action: "Auto-imported 5 movies from TMDb", time: "3 hours ago" }
  ]
};

// ── File DB Helpers ────────────────────────────────────────────────
function readMockDb() {
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      return JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Read mock database error:", e);
  }
  const initial = {
    movies: MOCK_MOVIES,
    users: MOCK_USERS,
    settings: MOCK_SETTINGS,
    guillaume: MOCK_GUILLAUME,
    analytics: MOCK_ANALYTICS,
    staff_picks: [
      { id: "col-1", title: "Midnight Musings", description: "Films for late night introspective journeys.", is_published: true, featured_banner_url: "", movies: [939243, 313369] }
    ],
    festivals: [
      { id: "fest-1", festival_name: "Cannes", year: 2024, title: "Palme d'Or Contenders", description: "Review the absolute finest from Cannes 2024.", is_published: true, movies: [939243] },
      { id: "fest-2", festival_name: "Venice", year: 2024, title: "Golden Lion Showcase", description: "Breathtaking dramas from Venice.", is_published: true, movies: [313369] }
    ],
    seasons: [
      { id: "seas-1", season: "Winter", name: "Date Night", description: "Cozy films for winter dating.", featured_movie_id: 313369, is_published: true, movies: [313369, 939243] },
      { id: "seas-2", season: "Autumn", name: "Alone", description: "Melancholic masterpieces for self-reflection.", featured_movie_id: null, is_published: true, movies: [939243] }
    ],
    experiences: [
      { id: "exp-1", experience_type: "Visual", name: "Symphony of Lights", description: "Unrivaled cinematography and visual aesthetics.", movies: [939243, 313369] },
      { id: "exp-2", experience_type: "Sound", name: "Resonating Whispers", description: "Immersive foley, atmospheric tracking, and raw scores.", movies: [939243] }
    ],
    kids: [
      { id: "kid-1", name: "Kids", min_age: 6, max_age: 10, description: "Delightful animated and live action wonders.", movies: [313369], movie_details: { "313369": { safety_rating: "G", educational_tags: ["Music"], family_tags: ["Fun"] } } }
    ],
    emotions: [
      { id: "em-1", name: "Joy", slug: "joy", description: "Bright, uplifting cinema that fills the heart.", featured_movie_id: 313369, movies: [313369] },
      { id: "em-2", name: "Grief", slug: "grief", description: "Resonant, cathartic explorations of loss and letting go.", featured_movie_id: 939243, movies: [939243] },
      { id: "em-3", name: "Nostalgia", slug: "nostalgia", description: "Warm reflections of yesteryear and memory.", featured_movie_id: null, movies: [313369, 939243] }
    ]
  };
  writeMockDb(initial);
  return initial;
}

function writeMockDb(data: any) {
  try {
    const dir = path.dirname(MOCK_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Write mock database error:", e);
  }
}

function getTable(tableKey: string, defaultData: any) {
  const db = readMockDb();
  if (db[tableKey] === undefined) {
    db[tableKey] = defaultData;
    writeMockDb(db);
  }
  return db[tableKey];
}

function saveTable(tableKey: string, data: any) {
  const db = readMockDb();
  db[tableKey] = data;
  writeMockDb(db);
}

// ── 1. MOVIE CRUD SERVICE ───────────────────────────────────────────
export async function getMovies(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return getTable("movies", MOCK_MOVIES);
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return MOCK_MOVIES;
  const { data, error } = await supabase.from("movies").select("*").order("popularity", { ascending: false });
  if (error) {
    console.error("Supabase Error getting movies:", error);
    return MOCK_MOVIES;
  }
  const merged = [...(data || [])];
  MOCK_MOVIES.forEach((mock) => {
    if (!merged.some((m) => m.id === mock.id)) {
      merged.push(mock);
    }
  });
  return merged;
}

export async function saveMovie(movie: any): Promise<any> {
  if (!isSupabaseConfigured) {
    const list = getTable("movies", MOCK_MOVIES);
    const index = list.findIndex((m: any) => m.id === movie.id);
    const updatedMovie = { ...movie, updated_at: new Date().toISOString() };
    if (index > -1) {
      list[index] = updatedMovie;
    } else {
      updatedMovie.created_at = new Date().toISOString();
      list.push(updatedMovie);
    }
    saveTable("movies", list);
    return updatedMovie;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return movie;
  const { data, error } = await supabase.from("movies").upsert(movie).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMovie(id: number): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const list = getTable("movies", MOCK_MOVIES);
    const updated = list.filter((m: any) => m.id !== id);
    saveTable("movies", updated);
    return true;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from("movies").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function bulkDeleteMovies(ids: number[]): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const list = getTable("movies", MOCK_MOVIES);
    const updated = list.filter((m: any) => !ids.includes(m.id));
    saveTable("movies", updated);
    return true;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from("movies").delete().in("id", ids);
  if (error) throw error;
  return true;
}

export async function bulkUpdateMovies(ids: number[], payload: any): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const list = getTable("movies", MOCK_MOVIES);
    const updated = list.map((m: any) => {
      if (ids.includes(m.id)) {
        return { ...m, ...payload, updated_at: new Date().toISOString() };
      }
      return m;
    });
    saveTable("movies", updated);
    return true;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from("movies").update(payload).in("id", ids);
  if (error) throw error;
  return true;
}

// ── 2. USER MANAGEMENT SERVICE ─────────────────────────────────────
export async function getUsers(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return getTable("users", MOCK_USERS);
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return MOCK_USERS;
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase Error getting users:", error);
    return MOCK_USERS;
  }
  return data.map((u: any) => ({
    id: u.id,
    display_name: u.display_name || u.username || "Cinephile",
    email: u.email || `${u.username || 'user'}@what2watch.com`,
    username: u.username || "user",
    role: u.role || "user",
    created_at: u.created_at,
    last_login: u.updated_at,
    avatar_url: u.avatar_url || "",
    status: u.status || "active"
  })) || [];
}

export async function saveUser(user: any): Promise<any> {
  if (!isSupabaseConfigured) {
    const list = getTable("users", MOCK_USERS);
    const idx = list.findIndex((u: any) => u.id === user.id);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...user };
    } else {
      user.id = `usr-${Math.random().toString(36).substr(2, 9)}`;
      user.created_at = new Date().toISOString();
      user.last_login = new Date().toISOString();
      list.push(user);
    }
    saveTable("users", list);
    return user;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return user;
  const { data, error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: user.display_name,
    username: user.username,
    role: user.role,
    avatar_url: user.avatar_url
  }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const list = getTable("users", MOCK_USERS);
    const updated = list.filter((u: any) => u.id !== id);
    saveTable("users", updated);
    return true;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ── 3. CURATION MODULES (Staff Picks) ───────────────────────────────
export async function getStaffPicks(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return getTable("staff_picks", []);
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("staff_pick_collections").select("*, staff_pick_movies(movie_id, sort_order)");
  if (error) return [];
  return data.map((d: any) => ({
    ...d,
    movies: d.staff_pick_movies.sort((a: any, b: any) => a.sort_order - b.sort_order).map((m: any) => m.movie_id)
  }));
}

export async function saveStaffPick(collection: any): Promise<any> {
  if (!isSupabaseConfigured) {
    const list = getTable("staff_picks", []);
    const idx = list.findIndex((c: any) => c.id === collection.id);
    if (idx > -1) {
      list[idx] = collection;
    } else {
      collection.id = `col-${Math.random().toString(36).substr(2, 9)}`;
      list.push(collection);
    }
    saveTable("staff_picks", list);
    return collection;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return collection;
  const { data: col, error: colErr } = await supabase.from("staff_pick_collections").upsert({
    id: collection.id || undefined,
    title: collection.title,
    description: collection.description,
    featured_banner_url: collection.featured_banner_url,
    is_published: collection.is_published
  }).select().single();
  if (colErr) throw colErr;

  await supabase.from("staff_pick_movies").delete().eq("collection_id", col.id);
  if (collection.movies && collection.movies.length > 0) {
    const inserts = collection.movies.map((mid: number, idx: number) => ({
      collection_id: col.id,
      movie_id: mid,
      sort_order: idx
    }));
    await supabase.from("staff_pick_movies").insert(inserts);
  }
  return { ...col, movies: collection.movies };
}

// ── 4. FESTIVALS CURATION ──────────────────────────────────────────
export async function getFestivals(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return getTable("festivals", []);
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("festival_collections").select("*, festival_movies(movie_id, sort_order)");
  if (error) return [];
  return data.map((d: any) => ({
    ...d,
    movies: d.festival_movies.sort((a: any, b: any) => a.sort_order - b.sort_order).map((m: any) => m.movie_id)
  }));
}

export async function saveFestival(collection: any): Promise<any> {
  if (!isSupabaseConfigured) {
    const list = getTable("festivals", []);
    const idx = list.findIndex((c: any) => c.id === collection.id);
    if (idx > -1) {
      list[idx] = collection;
    } else {
      collection.id = `fest-${Math.random().toString(36).substr(2, 9)}`;
      list.push(collection);
    }
    saveTable("festivals", list);
    return collection;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return collection;
  const { data: col, error: colErr } = await supabase.from("festival_collections").upsert({
    id: collection.id || undefined,
    festival_name: collection.festival_name,
    year: collection.year,
    title: collection.title,
    description: collection.description,
    is_published: collection.is_published
  }).select().single();
  if (colErr) throw colErr;

  await supabase.from("festival_movies").delete().eq("collection_id", col.id);
  if (collection.movies && collection.movies.length > 0) {
    const inserts = collection.movies.map((mid: number, idx: number) => ({
      collection_id: col.id,
      movie_id: mid,
      sort_order: idx
    }));
    await supabase.from("festival_movies").insert(inserts);
  }
  return { ...col, movies: collection.movies };
}

// ── 5. WATCH WITH SOMEONE (Seasons) ───────────────────────────────
export async function getSeasons(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return getTable("seasons", []);
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("watch_with_someone_categories").select("*, watch_with_someone_movies(movie_id, sort_order)");
  if (error) return [];
  return data.map((d: any) => ({
    ...d,
    movies: d.watch_with_someone_movies.sort((a: any, b: any) => a.sort_order - b.sort_order).map((m: any) => m.movie_id)
  }));
}

export async function saveSeason(category: any): Promise<any> {
  if (!isSupabaseConfigured) {
    const list = getTable("seasons", []);
    const idx = list.findIndex((c: any) => c.id === category.id);
    if (idx > -1) {
      list[idx] = category;
    } else {
      category.id = `seas-${Math.random().toString(36).substr(2, 9)}`;
      list.push(category);
    }
    saveTable("seasons", list);
    return category;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return category;
  const { data: cat, error: catErr } = await supabase.from("watch_with_someone_categories").upsert({
    id: category.id || undefined,
    season: category.season,
    name: category.name,
    description: category.description,
    featured_movie_id: category.featured_movie_id || null,
    is_published: category.is_published
  }).select().single();
  if (catErr) throw catErr;

  await supabase.from("watch_with_someone_movies").delete().eq("category_id", cat.id);
  if (category.movies && category.movies.length > 0) {
    const inserts = category.movies.map((mid: number, idx: number) => ({
      category_id: cat.id,
      movie_id: mid,
      sort_order: idx
    }));
    await supabase.from("watch_with_someone_movies").insert(inserts);
  }
  return { ...cat, movies: category.movies };
}

// ── 6. CINEMA EXPERIENCE SERVICE ───────────────────────────────────
export async function getExperiences(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return getTable("experiences", []);
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("cinema_experience_categories").select("*, cinema_experience_movies(movie_id, sort_order)");
  if (error) return [];
  return data.map((d: any) => ({
    ...d,
    movies: d.cinema_experience_movies.sort((a: any, b: any) => a.sort_order - b.sort_order).map((m: any) => m.movie_id)
  }));
}

export async function saveExperience(exp: any): Promise<any> {
  if (!isSupabaseConfigured) {
    const list = getTable("experiences", []);
    const idx = list.findIndex((c: any) => c.id === exp.id);
    if (idx > -1) {
      list[idx] = exp;
    } else {
      exp.id = `exp-${Math.random().toString(36).substr(2, 9)}`;
      list.push(exp);
    }
    saveTable("experiences", list);
    return exp;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return exp;
  const { data: col, error: colErr } = await supabase.from("cinema_experience_categories").upsert({
    id: exp.id || undefined,
    experience_type: exp.experience_type,
    name: exp.name,
    description: exp.description
  }).select().single();
  if (colErr) throw colErr;

  await supabase.from("cinema_experience_movies").delete().eq("category_id", col.id);
  if (exp.movies && exp.movies.length > 0) {
    const inserts = exp.movies.map((mid: number, idx: number) => ({
      category_id: col.id,
      movie_id: mid,
      sort_order: idx
    }));
    await supabase.from("cinema_experience_movies").insert(inserts);
  }
  return { ...col, movies: exp.movies };
}

// ── 7. KIDS SECTION SERVICE ────────────────────────────────────────
export async function getKids(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return getTable("kids", []);
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("kids_categories").select("*, kids_movies(movie_id, safety_rating, educational_tags, family_tags, sort_order)");
  if (error) return [];
  return data.map((d: any) => ({
    ...d,
    movies: d.kids_movies.sort((a: any, b: any) => a.sort_order - b.sort_order).map((m: any) => m.movie_id),
    movie_details: d.kids_movies.reduce((acc: any, m: any) => {
      acc[m.movie_id] = {
        safety_rating: m.safety_rating,
        educational_tags: m.educational_tags,
        family_tags: m.family_tags
      };
      return acc;
    }, {})
  }));
}

export async function saveKids(cat: any): Promise<any> {
  if (!isSupabaseConfigured) {
    const list = getTable("kids", []);
    const idx = list.findIndex((c: any) => c.id === cat.id);
    if (idx > -1) {
      list[idx] = cat;
    } else {
      cat.id = `kid-${Math.random().toString(36).substr(2, 9)}`;
      list.push(cat);
    }
    saveTable("kids", list);
    return cat;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return cat;
  const { data: col, error: colErr } = await supabase.from("kids_categories").upsert({
    id: cat.id || undefined,
    name: cat.name,
    min_age: cat.min_age,
    max_age: cat.max_age,
    description: cat.description
  }).select().single();
  if (colErr) throw colErr;

  await supabase.from("kids_movies").delete().eq("category_id", col.id);
  if (cat.movies && cat.movies.length > 0) {
    const inserts = cat.movies.map((mid: number, idx: number) => {
      const details = cat.movie_details?.[mid] || {};
      return {
        category_id: col.id,
        movie_id: mid,
        safety_rating: details.safety_rating || "G",
        educational_tags: details.educational_tags || [],
        family_tags: details.family_tags || [],
        sort_order: idx
      };
    });
    await supabase.from("kids_movies").insert(inserts);
  }
  return { ...col, movies: cat.movies, movie_details: cat.movie_details };
}

// ── 8. EMOTIONAL SPECTRUM SERVICE ─────────────────────────────────
export async function getEmotions(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return getTable("emotions", []);
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("emotions").select("*, emotion_movies(movie_id, sort_order)");
  if (error) return [];
  return data.map((d: any) => ({
    ...d,
    movies: d.emotion_movies.sort((a: any, b: any) => a.sort_order - b.sort_order).map((m: any) => m.movie_id)
  }));
}

export async function saveEmotion(emotion: any): Promise<any> {
  if (!isSupabaseConfigured) {
    const list = getTable("emotions", []);
    const idx = list.findIndex((c: any) => c.id === emotion.id);
    if (idx > -1) {
      list[idx] = emotion;
    } else {
      emotion.id = `em-${Math.random().toString(36).substr(2, 9)}`;
      list.push(emotion);
    }
    saveTable("emotions", list);
    return emotion;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return emotion;
  const { data: col, error: colErr } = await supabase.from("emotions").upsert({
    id: emotion.id || undefined,
    name: emotion.name,
    slug: emotion.slug,
    description: emotion.description,
    featured_movie_id: emotion.featured_movie_id || null
  }).select().single();
  if (colErr) throw colErr;

  await supabase.from("emotion_movies").delete().eq("emotion_id", col.id);
  if (emotion.movies && emotion.movies.length > 0) {
    const inserts = emotion.movies.map((mid: number, idx: number) => ({
      emotion_id: col.id,
      movie_id: mid,
      sort_order: idx
    }));
    await supabase.from("emotion_movies").insert(inserts);
  }
  return { ...col, movies: emotion.movies };
}

// ── 9. SYSTEM SETTINGS SERVICE ─────────────────────────────────────
export async function getSystemSettings(): Promise<any> {
  if (!isSupabaseConfigured) {
    return getTable("settings", MOCK_SETTINGS);
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return MOCK_SETTINGS;
  const { data, error } = await supabase.from("system_settings").select("*").eq("id", "global").maybeSingle();
  if (error || !data) return MOCK_SETTINGS;
  return data;
}

export async function saveSystemSettings(settings: any): Promise<any> {
  if (!isSupabaseConfigured) {
    saveTable("settings", { ...settings, updated_at: new Date().toISOString() });
    return settings;
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return settings;
  const { data, error } = await supabase.from("system_settings").upsert({
    id: "global",
    ...settings,
    updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

// ── 10. GUILLAUME AI SERVICE ───────────────────────────────────────
export async function getGuillaumeSettings(): Promise<any> {
  if (!isSupabaseConfigured) {
    const data = getTable("guillaume", MOCK_GUILLAUME);
    return {
      temperature: data.temperature,
      model: data.model,
      max_tokens: data.max_tokens,
      system_prompt: data.system_prompt,
      fallback_prompt: data.fallback_prompt
    };
  }
  const sys = await getSystemSettings();
  return {
    temperature: sys.email_settings?.guillaume_temperature ?? 0.7,
    model: sys.email_settings?.guillaume_model ?? "gemini-1.5-flash",
    max_tokens: sys.email_settings?.guillaume_max_tokens ?? 1024,
    system_prompt: sys.email_settings?.guillaume_system_prompt ?? "",
    fallback_prompt: sys.email_settings?.guillaume_fallback_prompt ?? ""
  };
}

export async function saveGuillaumeSettings(payload: any): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const data = getTable("guillaume", MOCK_GUILLAUME);
    saveTable("guillaume", { ...data, ...payload });
    return true;
  }
  const sys = await getSystemSettings();
  sys.email_settings = {
    ...sys.email_settings,
    guillaume_temperature: payload.temperature,
    guillaume_model: payload.model,
    guillaume_max_tokens: payload.max_tokens,
    guillaume_system_prompt: payload.system_prompt,
    guillaume_fallback_prompt: payload.fallback_prompt
  };
  await saveSystemSettings(sys);
  return true;
}

export async function getGuillaumeLogs(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    const data = getTable("guillaume", MOCK_GUILLAUME);
    return data.logs || [];
  }
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("ai_logs").select("*, profiles(display_name)").order("created_at", { ascending: false });
  if (error) return [];
  return data.map((l: any) => ({
    id: l.id,
    timestamp: l.created_at,
    user: l.profiles?.display_name || "Guest",
    prompt: l.prompt,
    model: l.model,
    response: l.response,
    status: l.status,
    tokens: l.tokens_used,
    latency: 1200
  }));
}

// ── 11. ANALYTICS Telemetry ────────────────────────────────────────
export async function getAnalyticsData(): Promise<any> {
  if (!isSupabaseConfigured) {
    const localMovies = getTable("movies", MOCK_MOVIES);
    const localUsers = getTable("users", MOCK_USERS);
    const gLogs = getTable("guillaume", MOCK_GUILLAUME).logs || [];

    return {
      stats: {
        totalUsers: localUsers.length + 1400,
        totalMovies: localMovies.length + 300,
        totalFavorites: 2480,
        totalWatchlists: 3120,
        todayVisits: 180 + gLogs.length,
        monthlyVisits: 4500,
        aiRequests: gLogs.length + 740,
        recCount: 1540
      },
      charts: MOCK_ANALYTICS.charts,
      recentActivity: [
        ...MOCK_ANALYTICS.recentActivity,
        ...localMovies.slice(0, 2).map((m: any) => ({
          id: `act-mov-${m.id}`,
          user: "Admin User",
          action: `Modified details for ${m.title}`,
          time: "Just now"
        }))
      ]
    };
  }

  const supabase = await getSupabaseClient();
  if (!supabase) return MOCK_ANALYTICS;
  try {
    const [moviesCount, profilesCount, favoritesCount, watchlistCount, aiLogsCount] = await Promise.all([
      supabase.from("movies").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("favorites").select("*", { count: "exact", head: true }),
      supabase.from("watchlist").select("*", { count: "exact", head: true }),
      supabase.from("ai_logs").select("*", { count: "exact", head: true })
    ]);

    return {
      stats: {
        totalUsers: profilesCount.count || 0,
        totalMovies: moviesCount.count || 0,
        totalFavorites: favoritesCount.count || 0,
        totalWatchlists: watchlistCount.count || 0,
        todayVisits: 240,
        monthlyVisits: 4500,
        aiRequests: aiLogsCount.count || 0,
        recCount: (watchlistCount.count || 0) + (favoritesCount.count || 0) + 120
      },
      charts: MOCK_ANALYTICS.charts,
      recentActivity: MOCK_ANALYTICS.recentActivity
    };
  } catch (err) {
    console.error("Error generating analytics:", err);
    return MOCK_ANALYTICS;
  }
}

// ── 12. TMDB API SECURITY BRIDGE ──────────────────────────────────
export async function searchTMDb(query: string): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return [
      { id: 438631, title: "Dune", release_date: "2021-09-15", poster_path: "https://preview.redd.it/lee-cronins-mummy-2026-imax-textless-v0-0a31y3m7h6vg1.jpeg?width=1080&crop=smart&auto=webp&s=ada9e8a0d4dc49666aa0e4e47653284b19ba34c9", backdrop_path: "/dune_bg.jpg", overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny..." },
      { id: 693134, title: "Dune: Part Two", release_date: "2024-02-27", poster_path: "https://preview.redd.it/nosferatu-2024-textless-v0-1ow07comz23e1.jpeg?auto=webp&s=02016edee8382031a7ac0bcaf73733b25aac623e", backdrop_path: "/dune2_bg.jpg", overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen..." }
    ].filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/tmdb?action=search&query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search request failed");
    return await res.json();
  } catch (e) {
    console.error("TMDb search error:", e);
    return [];
  }
}

export async function importFromTMDb(tmdbId: number): Promise<any> {
  if (!isSupabaseConfigured) {
    const mockDetails = {
      id: tmdbId,
      title: `Imported Movie (${tmdbId})`,
      original_title: "Imported Movie",
      release_date: new Date().toISOString().split("T")[0],
      overview: "This movie was imported from TMDb via mock simulation.",
      poster_path: "https://wallpapercave.com/wp/wp7039123.jpg",
      backdrop_path: "/lalaland_bg.jpg",
      vote_average: 7.5,
      vote_count: 100,
      popularity: 50.0,
      runtime: 120,
      tagline: "A mock tagline.",
      custom_editorial_description: "Custom description.",
      emotional_tags: [],
      context_tags: [],
      craft_tags: [],
      festival_tags: [],
      is_featured: false,
      is_homepage_hero: false,
      visibility: "visible",
      status: "published",
      trailer_url: "",
      streaming_providers: [],
      recommendation_score: 70
    };
    await saveMovie(mockDetails);
    return mockDetails;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/tmdb?action=import&id=${tmdbId}`, { method: "POST" });
    if (!res.ok) throw new Error("Import request failed");
    return await res.json();
  } catch (e) {
    console.error("TMDb import error:", e);
    throw e;
  }
}
