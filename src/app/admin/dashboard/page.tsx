// src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getAnalyticsData, getMovies, getUsers } from "@/services/adminService";
import { LineChart, BarChart, DonutChart } from "@/components/admin/charts/AdminCharts";
import {
  Users,
  Film,
  Heart,
  Bookmark,
  TrendingUp,
  Flame,
  Activity,
  Bot,
  Loader2,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [recentMovies, setRecentMovies] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, moviesRes, usersRes] = await Promise.all([
          getAnalyticsData(),
          getMovies(),
          getUsers()
        ]);
        setData(statsRes);
        setRecentMovies(moviesRes.slice(0, 5));
        setRecentUsers(usersRes.slice(0, 5));
      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[var(--admin-text-muted)]">
        <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
        <span className="text-sm font-semibold tracking-wider uppercase">Compiling dashboard data...</span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const activities = data?.recentActivity || [];

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, change: "+12% this week" },
    { label: "Total Movies", value: stats.totalMovies, icon: Film, change: "+8 new this month" },
    { label: "Total Favorites", value: stats.totalFavorites, icon: Heart, change: "+148 items" },
    { label: "Total Watchlists", value: stats.totalWatchlists, icon: Bookmark, change: "+205 items" },
    { label: "Today's Visits", value: stats.todayVisits, icon: TrendingUp, change: "Active sessions" },
    { label: "Monthly Visits", value: stats.monthlyVisits, icon: Flame, change: "+24% vs last month" },
    { label: "AI Requests", value: stats.aiRequests, icon: Bot, change: "Guillaume queries" },
    { label: "Recommendation Count", value: stats.recCount, icon: Activity, change: "Generated outputs" }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Curation Overview</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Curate lists, manage editorial tags, configure models, and check website telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/movies"
            className="admin-btn admin-btn-primary flex items-center gap-1.5 text-xs tracking-wider font-bold"
          >
            <Film size={14} />
            <span>Manage Movies</span>
          </Link>
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="admin-card flex items-start justify-between">
              <div className="space-y-2">
                <span className="admin-label block">{card.label}</span>
                <span className="text-3xl font-extrabold text-[var(--admin-text)]">
                  {card.value.toLocaleString()}
                </span>
                <span className="text-[10px] text-[var(--admin-text-muted)] block tracking-wide">
                  {card.change}
                </span>
              </div>
              <span className="p-3 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] rounded-full shrink-0">
                <Icon size={20} />
              </span>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={(charts.dailyUsers || []).map((d: any) => ({
            label: d.date || "",
            value: Number(d.users || 0)
          }))}
          title="Daily Active Users"
        />
        <BarChart
          data={(charts.moviePopularity || []).map((d: any) => ({
            label: d.title || "",
            value: Number(d.popularity || 0)
          }))}
          title="Top Movie Popularity (TMDb Score)"
        />
        <DonutChart
          data={(charts.recUsage || []).map((d: any) => ({
            label: d.source || "",
            value: Number(d.count || 0)
          }))}
          title="Surfacing Channel Shares"
        />
        <BarChart
          data={(charts.moodPopularity || []).map((d: any) => ({
            label: d.mood || "",
            value: Number(d.count || 0)
          }))}
          title="Mood Selection Frequencies"
        />
      </div>

      {/* Lists split grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recents movies */}
        <div className="admin-card space-y-4 xl:col-span-1">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
              Recently Curated
            </h3>
            <Link href="/admin/movies" className="text-xs text-[var(--admin-accent)] hover:underline font-semibold">
              View All
            </Link>
          </div>
          <div className="divide-y divide-[var(--admin-border)]">
            {recentMovies.map((movie) => (
              <div key={movie.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-8 h-12 bg-black/10 rounded overflow-hidden shrink-0 flex items-center justify-center text-[var(--admin-text-muted)] text-[8px]">
                  {movie.poster_path ? (
                    <img src={movie.poster_path} alt="" className="w-full h-full object-cover" />
                  ) : (
                    "No Poster"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold truncate text-[var(--admin-text)]">
                    {movie.title}
                  </h4>
                  <p className="text-[10px] text-[var(--admin-text-muted)] truncate">
                    {movie.release_date || "Unknown Date"}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]">
                  {movie.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recents users */}
        <div className="admin-card space-y-4 xl:col-span-1">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
              Newest Cinephiles
            </h3>
            <Link href="/admin/users" className="text-xs text-[var(--admin-accent)] hover:underline font-semibold">
              View All
            </Link>
          </div>
          <div className="divide-y divide-[var(--admin-border)]">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-[var(--admin-accent)] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {u.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold truncate text-[var(--admin-text)]">
                    {u.display_name}
                  </h4>
                  <p className="text-[10px] text-[var(--admin-text-muted)] truncate">{u.email}</p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-text-muted)]">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity Logs */}
        <div className="admin-card space-y-4 xl:col-span-1">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
              Curation Timeline
            </h3>
          </div>
          <div className="space-y-4">
            {activities.map((act: any, idx: number) => (
              <div key={idx} className="flex gap-3 text-xs items-start">
                <span className="w-2 h-2 rounded-full bg-[var(--admin-accent)] mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-[var(--admin-text)] font-medium leading-normal">{act.action}</p>
                  <p className="text-[10px] text-[var(--admin-text-muted)] font-bold tracking-wide">
                    By {act.user} · {act.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
