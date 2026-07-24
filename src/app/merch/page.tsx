import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Merch — What2Watch" };

export default function MerchPage() {
  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Shop"
        title={<>The shop is loading</>}
        lede={
          <>
            Prints, posters, and a very good tote are on the way — designed with the same editorial care
            as everything else here.
          </>
        }
      />
      <section className="ed-section">
        <div className="ed-container">
          <div className="ed-prose">
            <p>
              We&apos;re putting the finishing touches on a small, considered collection for people who love
              film as an art form. Want to know when it drops?{" "}
              <Link href="/contact">Leave us a note</Link> and we&apos;ll be in touch.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
