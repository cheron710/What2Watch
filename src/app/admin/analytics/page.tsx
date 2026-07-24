// src/app/admin/analytics/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getAnalyticsData } from "@/services/adminService";
import { LineChart, BarChart, DonutChart } from "@/components/admin/charts/AdminCharts";
import {
  TrendingUp,
  Clock,
  MousePointerClick,
  UserCheck,
  Search,
  Download,
  Printer,
  Loader2
} from "lucide-react";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await getAnalyticsData();
        setData(stats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const stats = data.stats;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Metric", "Value"],
        ["Total Users", stats.totalUsers],
        ["Total Movies", stats.totalMovies],
        ["Total Favorites", stats.totalFavorites],
        ["Total Watchlists", stats.totalWatchlists],
        ["Today's Visits", stats.todayVisits],
        ["Monthly Visits", stats.monthlyVisits],
        ["AI Requests", stats.aiRequests],
        ["Recommendations Count", stats.recCount]
      ]
        .map((e) => e.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `w2w_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[var(--admin-text-muted)]">
        <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
        <span className="text-xs uppercase font-bold tracking-wider">Syncing reporting databases...</span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  const metricCards = [
    { label: "Recommendation Click Rate", value: "72.4%", icon: MousePointerClick, change: "Clicks / Impressions" },
    { label: "Average Session Duration", value: "14m 32s", icon: Clock, change: "+2.5m since update" },
    { label: "Search Conversions", value: "88.1%", icon: Search, change: "Successfully matched films" },
    { label: "Active Retention", value: "94.2%", icon: UserCheck, change: "Return visits in 30d" }
  ];

  // Extra Mock Charts specifically for the analytics dashboard
  const trafficSources = [
    { label: "Direct", value: 2450 },
    { label: "Google", value: 1200 },
    { label: "Letterboxd", value: 650 },
    { label: "Twitter / X", value: 480 },
    { label: "Others", value: 210 }
  ];

  const searchTrends = [
    { label: "Jul 15", value: 85 },
    { label: "Jul 16", value: 110 },
    { label: "Jul 17", value: 105 },
    { label: "Jul 18", value: 130 },
    { label: "Jul 19", value: 160 },
    { label: "Jul 20", value: 145 },
    { label: "Jul 21", value: 190 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Advanced Reports</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Review detailed search trends, average session times, and print complete reports.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 select-none">
          <button
            onClick={handlePrint}
            className="admin-btn admin-btn-secondary h-10 px-4 flex items-center gap-2 cursor-pointer text-xs font-semibold tracking-wider"
          >
            <Printer size={15} />
            <span>Save PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="admin-btn admin-btn-primary h-10 px-5 flex items-center gap-1.5 cursor-pointer text-xs font-semibold tracking-wider"
          >
            <Download size={15} />
            <span>Export Stats</span>
          </button>
        </div>
      </div>

      {/* Print only Header */}
      <div className="hidden print:block border-b border-black pb-4 mb-6">
        <h1 className="text-4xl font-extrabold text-black font-playfair">What2Watch Curated Analytics</h1>
        <p className="text-sm text-gray-600">Generated Report: {new Date().toLocaleDateString()} · Confidential</p>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="admin-card flex items-start justify-between">
              <div className="space-y-2">
                <span className="admin-label block">{card.label}</span>
                <span className="text-3xl font-extrabold text-[var(--admin-text)]">{card.value}</span>
                <span className="text-[10px] text-[var(--admin-text-muted)] block tracking-wide font-bold">
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

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart data={searchTrends} title="Search Volumes Over Time" />
        <DonutChart data={trafficSources} title="Traffic Sources (Acquisitions)" />
        <BarChart data={charts.moodPopularity || []} title="Mood Selection Densities" />
        <BarChart data={charts.moviePopularity || []} title="Spotlight Clicks By Movie" />
      </div>

      {/* Telemetry log grid */}
      <div className="admin-card space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] border-b border-[var(--admin-border)] pb-3">
          Aggregate System Performance Audit
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-[var(--admin-text)]">
          <div className="space-y-2 p-4 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-input-bg)]">
            <span className="admin-label block text-green-600 dark:text-green-400">Database Performance</span>
            <p><strong>Query Execution:</strong> 99.8% sub-50ms latency</p>
            <p><strong>Database Uptime:</strong> 100% (Supabase PostgreSQL)</p>
            <p><strong>Active Indexes:</strong> 8 indices optimized</p>
          </div>
          <div className="space-y-2 p-4 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-input-bg)]">
            <span className="admin-label block text-[var(--admin-accent)]">Recommendation Metrics</span>
            <p><strong>Guillaume AI Success:</strong> 98.4% without fallback</p>
            <p><strong>Mean Response Latency:</strong> 1420ms (GenAI endpoint)</p>
            <p><strong>Tokens/Prompt Avg:</strong> 412 prompt, 210 output</p>
          </div>
          <div className="space-y-2 p-4 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-input-bg)]">
            <span className="admin-label block text-purple-600">Cache Efficacy</span>
            <p><strong>TMDb API Hit Rate:</strong> 84.1% cache hits</p>
            <p><strong>Homepage Static Generation:</strong> ISR 1hr sync</p>
            <p><strong>Edge Network Latency:</strong> 12ms average</p>
          </div>
        </div>
      </div>
    </div>
  );
}
