import Link from "next/link";
import "@/app/status.css";

export default function AuthCodeErrorPage() {
  return (
    <div className="status-page">
      <div className="status-inner">
        <span className="status-code">Sign-in failed</span>
        <h1 className="status-title">That link didn&apos;t work</h1>
        <p className="status-body">
          The sign-in link was invalid or has expired. Please try signing in again — a fresh link
          will be generated for you.
        </p>
        <div className="status-actions">
          <Link href="/login" className="status-btn">Back to sign in</Link>
          <Link href="/" className="status-link">Return home →</Link>
        </div>
      </div>
    </div>
  );
}
