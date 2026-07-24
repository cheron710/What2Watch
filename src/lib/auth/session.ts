// src/lib/auth/session.ts
// Server-side helpers for reading the current authenticated user + profile.
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface SessionUser {
  id: string;
  email: string | null;
  profile: Profile | null;
  role: string;
  /** Display label — profile name, else email local-part. */
  name: string;
  /** Single-character avatar initial. */
  initial: string;
}

/**
 * Returns the current user (with profile) or null. Safe to call in any Server
 * Component; never throws on missing Supabase config so pages still render.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const mockSession = cookieStore.get("w2w-session-mock");
      if (mockSession) {
        try {
          const parsed = JSON.parse(decodeURIComponent(mockSession.value));
          return {
            id: "mock-user-id",
            email: parsed.email || "testing@gmail.com",
            profile: {
              id: "mock-user-id",
              username: parsed.name || "user",
              display_name: parsed.name || "User",
              avatar_url: "",
              bio: "Local Developer Bypass User",
              role: parsed.role || "user",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            role: parsed.role || "user",
            name: parsed.name || "User",
            initial: parsed.initial || "U"
          };
        } catch {
          // fallback
        }
      }
    } catch (e: any) {
      if (e?.digest === "DYNAMIC_SERVER_USAGE" || e?.message?.includes("dynamic-server-error")) {
        throw e;
      }
      console.warn("Failed to retrieve mock session cookies server-side", e);
    }
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const name =
      profile?.display_name?.trim() ||
      profile?.username?.trim() ||
      user.email?.split("@")[0] ||
      "Cinephile";

    const role = profile?.role || "user";

    return {
      id: user.id,
      email: user.email ?? null,
      profile: profile ?? null,
      role,
      name,
      initial: name.charAt(0).toUpperCase(),
    };
  } catch {
    // Supabase not configured yet — render as signed-out rather than crashing.
    return null;
  }
}

/** Require a signed-in user; returns null when absent (caller should redirect). */
export async function requireUser(): Promise<SessionUser | null> {
  return getSessionUser();
}
