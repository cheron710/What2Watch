"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

const ProfileSchema = z.object({
  display_name: z.string().min(1, "Name can't be empty.").max(80),
  username: z
    .string()
    .max(40)
    .regex(/^[a-zA-Z0-9_]*$/, "Letters, numbers, and underscores only.")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(280).optional().or(z.literal("")),
});

export async function updateProfile(input: {
  display_name: string;
  username?: string;
  bio?: string;
}): Promise<ActionResult> {
  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "Please sign in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      username: parsed.data.username || null,
      bio: parsed.data.bio || null,
    })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

const PrefsSchema = z.object({
  favourite_genre_ids: z.array(z.number()).max(10),
  min_rating: z.number().min(0).max(10).nullable(),
  max_runtime_mins: z.number().min(0).max(400).nullable(),
});

export async function updatePreferences(input: {
  favourite_genre_ids: number[];
  min_rating: number | null;
  max_runtime_mins: number | null;
}): Promise<ActionResult> {
  const parsed = PrefsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "Please sign in." };

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: userId,
      favourite_genre_ids: parsed.data.favourite_genre_ids,
      min_rating: parsed.data.min_rating,
      max_runtime_mins: parsed.data.max_runtime_mins,
    },
    { onConflict: "user_id" }
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/settings");
  return { ok: true };
}
