// src/components/admin/sidebar/AdminSidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";

import { ConfirmDialog } from "@/components/admin/dialogs/Dialogs";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

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
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleConfirmLogout = () => {
    // Clear session cookies
    document.cookie = "w2w-session-mock=; path=/; max-age=0";
    document.cookie = "w2w-admin-session=; path=/; max-age=0";
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside
      className="admin-sidebar"
      style={{
        width: collapsed ? 72 : 260,
        minWidth: collapsed ? 72 : 260,
      }}
    >
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <Link
          href="/admin/dashboard"
          className="admin-sidebar-brand"
          suppressHydrationWarning
        >
          <span className="admin-sidebar-brand-icon">W</span>
          {!collapsed && (
            <span className="admin-sidebar-brand-text">
              <span style={{ color: "var(--admin-accent)" }}>W2W</span> Admin
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="admin-sidebar-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation - Single Vertical List */}
      <nav className="admin-sidebar-nav">
        <ul className="admin-sidebar-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isHovered = hoveredItem === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`admin-sidebar-link ${active ? "active" : ""}`}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    className="admin-sidebar-link-icon"
                  />
                  {!collapsed && (
                    <span className="admin-sidebar-link-text">{item.label}</span>
                  )}
                  {active && !collapsed && (
                    <span className="admin-sidebar-active-dot" />
                  )}
                </Link>

                {/* Tooltip on collapsed state */}
                {collapsed && isHovered && (
                  <div className="admin-sidebar-tooltip">
                    {item.label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: Logout */}
      <div className="admin-sidebar-footer">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="admin-sidebar-link admin-sidebar-logout cursor-pointer"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} className="admin-sidebar-link-icon" />
          {!collapsed && <span className="admin-sidebar-link-text">Logout</span>}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of the What2Watch Admin portal?"
        confirmLabel="Log Out"
        variant="danger"
      />
    </aside>
  );
}
