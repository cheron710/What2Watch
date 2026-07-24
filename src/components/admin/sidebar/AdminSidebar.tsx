// src/components/admin/sidebar/AdminSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Users,
  Sparkles,
  Award,
  Tv,
  Users2,
  Baby,
  Layers,
  Bot,
  BarChart3,
  Settings
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/movies", label: "Movies", icon: Film },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/staff-picks", label: "Staff Picks", icon: Sparkles },
    { href: "/admin/festivals", label: "Festival Season", icon: Award },
    { href: "/admin/cinema-experience", label: "Cinema by Experience", icon: Tv },
    { href: "/admin/seasons", label: "Watch With Someone", icon: Users2 },
    { href: "/admin/kids", label: "Kids", icon: Baby },
    { href: "/admin/emotional-spectrum", label: "Emotional Spectrum", icon: Layers },
    { href: "/admin/guillaume", label: "Guillaume AI", icon: Bot },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings }
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="w-full bg-[var(--admin-card-bg)] border-b border-[var(--admin-border)] overflow-x-auto select-none shrink-0 scrollbar-none">
      <nav className="flex items-center gap-1.5 px-6 py-2.5 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 shrink-0 ${
                active
                  ? "bg-[var(--admin-accent)] text-white shadow-sm"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
