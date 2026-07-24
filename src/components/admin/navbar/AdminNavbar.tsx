// src/components/admin/navbar/AdminNavbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Menu, Sun, Moon, ExternalLink, ShieldCheck, User } from "lucide-react";

interface AdminUser {
  name: string;
  role: string;
  initial: string;
}

interface AdminNavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  siteName: string;
}

export default function AdminNavbar({
  sidebarOpen,
  setSidebarOpen,
  mobileDrawerOpen,
  setMobileDrawerOpen,
  darkMode,
  toggleDarkMode,
  siteName
}: AdminNavbarProps) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, username, role")
            .eq("id", authUser.id)
            .maybeSingle();

          const name =
            profile?.display_name?.trim() ||
            profile?.username?.trim() ||
            authUser.email?.split("@")[0] ||
            "Admin";

          setUser({
            name,
            role: profile?.role || "admin",
            initial: name.charAt(0).toUpperCase()
          });
        }
      } catch (e) {
        console.warn("Failed to load user session client-side", e);
      }
    }
    loadUser();
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--admin-border)] bg-[var(--admin-card-bg)] shrink-0 transition">
      {/* Left side: Brand Logo */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/dashboard" 
          className="font-playfair text-lg font-extrabold tracking-tight select-none text-[var(--admin-text)] hover:opacity-90 transition"
          suppressHydrationWarning
        >
          <span className="text-[var(--admin-accent)]">W2W</span> Admin
        </Link>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3">
        {/* Public Website Preview Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <span>View Site</span>
          <ExternalLink size={12} />
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition"
          aria-label="Toggle dark / light display mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="h-6 w-[1px] bg-[var(--admin-border)]" />

        {/* User Card */}
        <div className="flex items-center gap-3 select-none">
          <div className="flex flex-col text-right hidden xs:flex">
            <span className="text-xs font-semibold text-[var(--admin-text)] leading-tight">
              {user ? user.name : "Admin User"}
            </span>
            <span className="text-[10px] text-[var(--admin-text-muted)] flex items-center gap-0.5 justify-end uppercase font-bold tracking-wider">
              <ShieldCheck size={10} className="text-[var(--admin-accent)]" />
              {user?.role || "Admin"}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-[var(--admin-accent)] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-sm shrink-0">
            {user ? user.initial : "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
