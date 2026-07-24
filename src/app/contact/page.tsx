import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ContactForm from "./ContactForm";
import "./contact.css";

export const metadata: Metadata = {
  title: "Contact — What2Watch",
  description: "Questions, film suggestions, or partnership ideas — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="ed-page">
      <PageHeader
        eyebrow="Get in Touch"
        title={<>Say hello</>}
        lede={
          <>
            A film we&apos;re missing? A partnership, a press question, or simply a note about a movie that
            moved you — this inbox is open.
          </>
        }
      />
      <section className="ed-section">
        <div className="ed-container contact-layout">
          <div className="contact-aside">
            <div className="contact-detail">
              <span className="contact-detail-label">Editorial</span>
              <a href="mailto:hello@what2watch.film" className="contact-detail-value">
                hello@what2watch.film
              </a>
            </div>
            <div className="contact-detail">
              <span className="contact-detail-label">Press</span>
              <a href="mailto:press@what2watch.film" className="contact-detail-value">
                press@what2watch.film
              </a>
            </div>
            <div className="contact-detail">
              <span className="contact-detail-label">Social</span>
              <span className="contact-detail-value">@what2watch</span>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
