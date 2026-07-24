import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Jobs — What2Watch" };

export default function JobsPage() {
  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Careers"
        title={<>Build the future of film discovery</>}
        lede={
          <>
            We&apos;re a small team obsessed with cinema and craft. We&apos;re not actively hiring right now —
            but we always want to hear from people who care about this as much as we do.
          </>
        }
      />
      <section className="ed-section">
        <div className="ed-container">
          <div className="ed-prose">
            <p>
              If you&apos;re an engineer, designer, writer, or curator who believes discovery should feel
              like anticipation rather than a chore, introduce yourself. Tell us about a film that changed
              how you see, and what you&apos;d build here.
            </p>
            <p>
              Write to us at{" "}
              <a href="mailto:hello@what2watch.film">hello@what2watch.film</a> — or just{" "}
              <Link href="/contact">say hello</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
