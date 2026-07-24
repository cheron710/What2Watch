import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer-new">
      <div className="footer-grid">
        <div className="brand-col">
          <Link href="/" className="brand-logo">What2Watch</Link>
          <div className="brand-desc">
            Discovering films through mood, emotion, and experience. Your cinematic compass.
          </div>
          <div className="simple-links">
            <Link href="/about" className="footer-link">About</Link>
            <Link href="/contact" className="footer-link">Contact</Link>
            <Link href="/privacy" className="footer-link">Privacy</Link>
            <Link href="/terms" className="footer-link">Terms</Link>
          </div>
        </div>
        
        <div className="middle-col">
          <div className="footer-col-title">Connect</div>
          <div className="social-links">
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">Twitter</a>
          </div>
          <div className="secondary-row">
            <Link href="/jobs" className="footer-link">Jobs</Link>
            <Link href="/merch" className="footer-link">Merch</Link>
          </div>
        </div>
        
        <div className="right-col">
          <div className="footer-col-title">Newsletter</div>
          <div className="newsletter-copy">
            Get our updates. New films, festival picks, staff recommendations.
          </div>
          <NewsletterForm />
        </div>
      </div>
      
      <div className="footer-legal-strip">
        <div className="footer-legal">
          © {new Date().getFullYear()} What2Watch. Curated Cinema. All rights reserved. Discover the art of film.
        </div>
      </div>
    </footer>
  );
}
