"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "@/components/auth/auth.css";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>✉️</div>
          <h2 className="auth-h">Check your email</h2>
          <p className="auth-sub" style={{ marginBottom: 0 }}>
            If an account exists for <strong>{email}</strong>, a password-reset link is on its way.
          </p>
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
        <h1 className="auth-h">Reset password</h1>
        <p className="auth-sub">We&apos;ll email you a secure link to set a new one.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleReset}>
          <label className="auth-label" htmlFor="fp-email">Email</label>
          <input
            id="fp-email"
            className="auth-input"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="auth-footer">
          Remembered it? <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
