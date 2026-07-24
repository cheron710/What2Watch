"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Sign the current user out and return them to the home page. */
export async function signOutAction() {
  if (!isSupabaseConfigured) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("w2w-session-mock");
    redirect("/");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
