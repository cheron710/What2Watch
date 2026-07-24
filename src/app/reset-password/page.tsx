"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/components/auth/auth.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError(null);
    // Supabase establishes a recovery session from the emailed link before this
    // page loads, so updateUser applies to the correct account.
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 1600);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          What2<span>Watch</span>
        </Link>
        <h1 className="auth-h">Set a new password</h1>
        <p className="auth-sub">Choose something you&apos;ll remember this time.</p>

        {error && <div className="auth-error">{error}</div>}
        {done && <div className="auth-success">Password updated. Taking you to your dashboard…</div>}

        <form onSubmit={handleUpdate}>
          <label className="auth-label" htmlFor="rp-password">New password</label>
          <input
            id="rp-password"
            className="auth-input"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="auth-label" htmlFor="rp-confirm">Confirm password</label>
          <input
            id="rp-confirm"
            className="auth-input"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button className="auth-btn" type="submit" disabled={loading || done}>
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
