import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer-new">
      <div className="footer-shell">
        <div className="footer-top" data-reveal="fade">
          <Link href="/" className="footer-wordmark">
            What2<span>Watch</span>
          </Link>
          <p className="footer-tagline">
            Your cinematic compass — discovering films through mood, emotion, and experience.
          </p>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-col-title">Explore</div>
            <Link href="/seasons" className="footer-link">Seasons</Link>
            <Link href="/emotional-spectrum" className="footer-link">Emotional Spectrum</Link>
            <Link href="/staff-picks" className="footer-link">Staff Picks</Link>
            <Link href="/kids" className="footer-link">Kids</Link>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <Link href="/about" className="footer-link">About</Link>
            <Link href="/contact" className="footer-link">Contact</Link>
            <Link href="/jobs" className="footer-link">Jobs</Link>
            <Link href="/merch" className="footer-link">Merch</Link>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Connect</div>
            <a href="#" className="footer-link">Instagram</a>
            <a href="#" className="footer-link">Twitter</a>
            <a href="#" className="footer-link">Letterboxd</a>
          </div>

          <div className="footer-col footer-col-news">
            <div className="footer-col-title">Newsletter</div>
            <p className="newsletter-copy">
              New films, festival picks, and staff recommendations — a considered note, now and then.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="footer-legal-strip">
          <div className="footer-legal">
            © {new Date().getFullYear()} What2Watch — Curated Cinema.
          </div>
          <div className="footer-legal-links">
            <Link href="/privacy" className="footer-link">Privacy</Link>
            <Link href="/terms" className="footer-link">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
