// src/lib/supabase/env.ts
// Central access to Supabase connection values. Falls back to harmless
// placeholders when unset so the app can build & prerender before the project
// is configured; real values are injected via environment variables at deploy.

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "public-anon-placeholder-key";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

/** True only when real, non-placeholder Supabase credentials are configured. */
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://YOUR_PROJECT_ID.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "public-anon-placeholder-key";
