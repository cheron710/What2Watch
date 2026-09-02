"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Eye, EyeOff } from "lucide-react";
import "@/components/auth/auth.css";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!isSupabaseConfigured) {
      if (typeof window !== "undefined") {
        const name = displayName.trim() || email.split("@")[0];
        const initial = name.charAt(0).toUpperCase();
        const role = email.toLowerCase().includes("admin") ? "admin" : "user";
        const sessionVal = encodeURIComponent(
          JSON.stringify({ email, name, initial, role })
        );
        document.cookie = `w2w-session-mock=${sessionVal}; path=/; max-age=3600`;
      }
      setSuccess(true);
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      if (typeof window !== "undefined") {
        const email = "google-user@what2watch.com";
        const name = "Google User";
        const initial = "G";
        const role = "user";
        const sessionVal = encodeURIComponent(
          JSON.stringify({ email, name, initial, role })
        );
        document.cookie = `w2w-session-mock=${sessionVal}; path=/; max-age=3600`;
      }
      setSuccess(true);
      setLoading(false);
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🎉</div>
          <h2 className="auth-h">Account created successfully!</h2>
          <p className="auth-sub" style={{ marginBottom: 0 }}>
            {isSupabaseConfigured 
              ? "Please check your email inbox to confirm and activate your registration."
              : "Welcome to What2Watch! You can now start curating your collections."}
          </p>
          {!isSupabaseConfigured && (
            <Link 
              href="/" 
              className="auth-btn" 
              style={{ display: "inline-block", marginTop: 24, textDecoration: "none" }}
              suppressHydrationWarning
            >
              Go to Home Page
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          What2<span>Watch</span>
        </Link>
        <h1 className="auth-h">Create account</h1>
        <p className="auth-sub">Start building your curated cinema list.</p>

        {error && (
          <div className="auth-error" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span>{error}</span>
            {error.toLowerCase().includes("rate limit") && (
              <button
                type="button"
                onClick={() => {
                  const name = displayName.trim() || email.split("@")[0] || "developer";
                  const initial = name.charAt(0).toUpperCase();
                  const role = email.toLowerCase().includes("admin") ? "admin" : "user";
                  const sessionVal = encodeURIComponent(
                    JSON.stringify({ email: email || "dev@what2watch.com", name, initial, role })
                  );
                  document.cookie = `w2w-session-mock=${sessionVal}; path=/; max-age=3600`;
                  router.push("/");
                  router.refresh();
                }}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  padding: "4px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  width: "fit-content",
                  marginTop: "4px",
                  alignSelf: "start"
                }}
              >
                Rate Limit Exceeded? Sign up with Local Developer Mode instead
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <label className="auth-label" htmlFor="signup-name">Your Name</label>
          <input
            id="signup-name"
            className="auth-input"
            type="text"
            placeholder="Jane Doe"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            suppressHydrationWarning
          />
          <label className="auth-label" htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            className="auth-input"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            suppressHydrationWarning
          />
          <label className="auth-label" htmlFor="signup-password">Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="signup-password"
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              suppressHydrationWarning
              style={{ paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "var(--admin-text-muted, #8c8980)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              suppressHydrationWarning
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button className="auth-btn" type="submit" disabled={loading} suppressHydrationWarning>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button className="auth-google-btn" onClick={handleGoogleLogin} disabled={loading} suppressHydrationWarning>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
