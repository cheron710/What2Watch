// src/app/admin/login/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Eye, EyeOff, ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      // Mock login for offline developer mode
      if (typeof window !== "undefined") {
        const sessionVal = encodeURIComponent(
          JSON.stringify({
            email: email || "admin@what2watch.com",
            name: "Admin User",
            initial: "A",
            role: "admin"
          })
        );
        document.cookie = `w2w-session-mock=${sessionVal}; path=/; max-age=3600`;
      }
      router.push("/admin/dashboard");
      router.refresh();
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Query the database role for authorization
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profileError || !profile || profile.role !== "admin") {
          // Deny access and sign out the session
          await supabase.auth.signOut();
          setError("Access Denied: You do not have administrator permissions.");
          setLoading(false);
          return;
        }

        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong during sign-in.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-container dark flex items-center justify-center min-h-screen p-4 bg-[var(--admin-bg)]">
      <div className="w-full max-w-md bg-[var(--admin-card-bg)] border border-[var(--admin-border-strong)] rounded-2xl p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--admin-text)]">
            Admin Console
          </h1>
          <p className="text-xs text-[var(--admin-text-muted)]">
            Sign in to manage catalogs, reviews, and platform configuration keys.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[var(--admin-error-bg)] border border-[var(--admin-error)]/20 rounded-lg text-xs text-[var(--admin-error)] leading-relaxed flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes("rate limit") && (
              <button
                type="button"
                onClick={() => {
                  const sessionVal = encodeURIComponent(
                    JSON.stringify({
                      email: email || "admin@what2watch.com",
                      name: "Admin User",
                      initial: "A",
                      role: "admin"
                    })
                  );
                  document.cookie = `w2w-session-mock=${sessionVal}; path=/; max-age=3600`;
                  const nextPath = () => {
                    const { searchParams } = new URL(window.location.href);
                    return searchParams.get("next") || "/admin/dashboard";
                  };
                  router.push(nextPath());
                  router.refresh();
                }}
                className="mt-1 text-xs text-left underline cursor-pointer text-[var(--admin-text)] hover:opacity-80"
              >
                Rate Limit Exceeded? Log in with Local Admin Developer Mode instead
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@what2watch.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input w-full"
              suppressHydrationWarning
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">
              Console Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-input w-full pr-10"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] cursor-pointer"
                tabIndex={-1}
                suppressHydrationWarning
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary w-full py-3 mt-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            suppressHydrationWarning
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Access Dashboard</span>
            )}
          </button>
        </form>

        <div className="border-t border-[var(--admin-border)] pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition"
          >
            <ArrowLeft size={13} />
            <span>Return to Lobby</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
