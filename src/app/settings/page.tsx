import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions/auth";
import PageHeader from "@/components/ui/PageHeader";
import SettingsForm from "./SettingsForm";
import "../dashboard/account.css";

export const metadata: Metadata = { title: "Settings — What2Watch" };

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/settings");

  const supabase = await createClient();
  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("favourite_genre_ids, min_rating, max_runtime_mins")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Settings"
        title={<>Tune your experience</>}
        lede={<>Set the tastes and limits that shape what What2Watch recommends to you.</>}
      />
      <section className="ed-section">
        <div className="ed-container">
          <SettingsForm
            initial={{
              favourite_genre_ids: prefs?.favourite_genre_ids ?? [],
              min_rating: prefs?.min_rating ?? null,
              max_runtime_mins: prefs?.max_runtime_mins ?? null,
            }}
          />

          <div className="acct-danger">
            <h3>Sign out</h3>
            <p>Signed in as {user.email}. You can sign back in any time.</p>
            <form action={signOutAction}>
              <button type="submit" className="acct-signout-btn">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
