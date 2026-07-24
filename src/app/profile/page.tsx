import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import PageHeader from "@/components/ui/PageHeader";
import ProfileForm from "./ProfileForm";
import "../dashboard/account.css";

export const metadata: Metadata = { title: "Profile — What2Watch" };

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/profile");

  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Your Profile"
        title={<>How you show up</>}
        lede={<>Tell us a little about your taste — it helps Guillaume and our engine tune your recommendations.</>}
      />
      <section className="ed-section">
        <div className="ed-container">
          <ProfileForm
            email={user.email ?? ""}
            initial={{
              display_name: user.profile?.display_name ?? user.name,
              username: user.profile?.username ?? "",
              bio: user.profile?.bio ?? "",
            }}
          />
        </div>
      </section>
    </div>
  );
}
