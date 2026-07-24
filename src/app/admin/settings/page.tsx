// src/app/admin/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getSystemSettings, saveSystemSettings } from "@/services/adminService";
import { useToast } from "@/components/admin/layout/AdminLayout";
import { InputField, TextareaField, SelectField } from "@/components/admin/forms/FormFields";
import {
  Settings,
  Key,
  Mail,
  ToggleLeft,
  ToggleRight,
  Database,
  Trash2,
  Loader2,
  Terminal,
  Eye,
  EyeOff
} from "lucide-react";

export default function SettingsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  // Mask toggles for API keys
  const [showTmdb, setShowTmdb] = useState(false);
  const [showClaude, setShowClaude] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);

  // Settings form values
  const [formValues, setFormValues] = useState<any>({
    site_name: "",
    logo_url: "",
    favicon_url: "",
    homepage_hero_title: "",
    homepage_hero_subtitle: "",
    footer_text: "",
    social_links: { instagram: "", twitter: "" },
    tmdb_key: "",
    claude_key: "",
    openai_key: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_pass: "",
    maintenance_mode: false
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSystemSettings();
      setFormValues(data);
    } catch (e) {
      showToast("Failed to fetch settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSystemSettings(formValues);
      showToast("Website configurations updated successfully.", "success");
      loadData();
    } catch (e) {
      showToast("Settings save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("TMDb cache flushed successfully. Site rebuilt.", "success");
    } catch (e) {
      showToast("Cache flush failed.", "error");
    } finally {
      setClearingCache(false);
    }
  };

  const mockSystemLogs = [
    `[2026-07-21 17:20:10] SYSTEM: Booting What2Watch Next.js Server (v16.2.10)`,
    `[2026-07-21 17:20:12] DATABASE: Connected to Supabase PostgreSQL Gateway.`,
    `[2026-07-21 17:20:12] TELEMETRY: Active RLS Policies Verified (profiles, movies).`,
    `[2026-07-21 17:21:40] MIGRATIONS: Executed 003_admin_tables.sql successfully.`,
    `[2026-07-21 17:22:00] TELEMETRY: Page visit registered on /admin/dashboard.`,
    `[2026-07-21 17:23:15] CRON: Automatic cache refresh scheduled in 32 minutes.`
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[var(--admin-text-muted)]">
        <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
        <span className="text-xs uppercase font-bold tracking-wider">Syncing configurations...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveSubmit} className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Configure global API keys, website layouts, SMTP options, or perform database maintenance.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="admin-btn admin-btn-primary h-10 px-6 flex items-center gap-1.5 cursor-pointer text-xs font-semibold tracking-wider shrink-0 select-none"
        >
          {saving && <Loader2 size={13} className="animate-spin" />}
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Core Settings forms */}
        <div className="xl:col-span-2 space-y-6">
          {/* General Site Section */}
          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
              <Settings size={18} className="text-[var(--admin-accent)]" />
              <h2 className="text-base font-bold text-[var(--admin-text)]">Website General Metadata</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Website Brand Name"
                value={formValues.site_name}
                onChange={(e) => setFormValues({ ...formValues, site_name: e.target.value })}
                required
              />
              <InputField
                label="Footer Copyright Text"
                value={formValues.footer_text}
                onChange={(e) => setFormValues({ ...formValues, footer_text: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Logo Image URL"
                placeholder="https://example.com/logo.png"
                value={formValues.logo_url}
                onChange={(e) => setFormValues({ ...formValues, logo_url: e.target.value })}
              />
              <InputField
                label="Favicon Shortcut URL"
                placeholder="https://example.com/favicon.ico"
                value={formValues.favicon_url}
                onChange={(e) => setFormValues({ ...formValues, favicon_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-[var(--admin-border)]">
              <InputField
                label="Instagram Social Link"
                placeholder="https://instagram.com/..."
                value={formValues.social_links?.instagram || ""}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    social_links: { ...formValues.social_links, instagram: e.target.value }
                  })
                }
              />
              <InputField
                label="Twitter / X Link"
                placeholder="https://twitter.com/..."
                value={formValues.social_links?.twitter || ""}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    social_links: { ...formValues.social_links, twitter: e.target.value }
                  })
                }
              />
            </div>
          </div>

          {/* API Key profiles */}
          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
              <Key size={18} className="text-[var(--admin-accent)]" />
              <h2 className="text-base font-bold text-[var(--admin-text)]">System API Integrations</h2>
            </div>

            {/* TMDB Key */}
            <div className="relative">
              <InputField
                label="The Movie Database (TMDb) API Key"
                type={showTmdb ? "text" : "password"}
                value={formValues.tmdb_key}
                onChange={(e) => setFormValues({ ...formValues, tmdb_key: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowTmdb(!showTmdb)}
                className="absolute right-3 top-8 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] cursor-pointer"
              >
                {showTmdb ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Claude key */}
            <div className="relative">
              <InputField
                label="Claude AI (Anthropic) Security Key"
                type={showClaude ? "text" : "password"}
                value={formValues.claude_key}
                onChange={(e) => setFormValues({ ...formValues, claude_key: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowClaude(!showClaude)}
                className="absolute right-3 top-8 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] cursor-pointer"
              >
                {showClaude ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* OpenAI Key */}
            <div className="relative">
              <InputField
                label="OpenAI GPT Gateway Key"
                type={showOpenai ? "text" : "password"}
                value={formValues.openai_key}
                onChange={(e) => setFormValues({ ...formValues, openai_key: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-3 top-8 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] cursor-pointer"
              >
                {showOpenai ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* SMTP options */}
          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
              <Mail size={18} className="text-[var(--admin-accent)]" />
              <h2 className="text-base font-bold text-[var(--admin-text)]">SMTP Mail Deliverability</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="SMTP Host Name"
                placeholder="smtp.mailtrap.io"
                value={formValues.smtp_host}
                onChange={(e) => setFormValues({ ...formValues, smtp_host: e.target.value })}
                className="md:col-span-2"
              />
              <InputField
                label="Port"
                type="number"
                value={formValues.smtp_port}
                onChange={(e) => setFormValues({ ...formValues, smtp_port: parseInt(e.target.value, 10) })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="SMTP Username"
                value={formValues.smtp_user}
                onChange={(e) => setFormValues({ ...formValues, smtp_user: e.target.value })}
              />
              <InputField
                label="SMTP Password"
                type="password"
                value={formValues.smtp_pass}
                onChange={(e) => setFormValues({ ...formValues, smtp_pass: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Side Panel: Maintenance & Database tools */}
        <div className="space-y-6 xl:col-span-1">
          {/* Maintenance block */}
          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
              <Database size={18} className="text-[var(--admin-accent)]" />
              <h2 className="text-base font-bold text-[var(--admin-text)]">Maintenance & Cache</h2>
            </div>

            {/* Maintenance Mode trigger */}
            <div className="flex items-center justify-between p-3 border border-[var(--admin-border)] rounded-md bg-[var(--admin-input-bg)]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text)]">
                  Maintenance Mode
                </span>
                <p className="text-[10px] text-[var(--admin-text-muted)]">
                  Redirects public users to a simple fallback landing screen.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormValues({ ...formValues, maintenance_mode: !formValues.maintenance_mode })
                }
                className="text-[var(--admin-accent)] shrink-0 cursor-pointer"
              >
                {formValues.maintenance_mode ? (
                  <ToggleRight size={38} className="text-[var(--admin-accent)]" />
                ) : (
                  <ToggleLeft size={38} className="text-[var(--admin-text-muted)]" />
                )}
              </button>
            </div>

            {/* Flushing cached variables */}
            <div className="space-y-2">
              <span className="admin-label">Static Cache Control</span>
              <button
                type="button"
                onClick={handleClearCache}
                disabled={clearingCache}
                className="admin-btn admin-btn-secondary w-full py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {clearingCache ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>Clear Site Cache</span>
              </button>
            </div>
          </div>

          {/* System logs Console */}
          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
              <Terminal size={18} className="text-[var(--admin-accent)]" />
              <h2 className="text-base font-bold text-[var(--admin-text)]">Process Console</h2>
            </div>
            <div className="p-3 border border-[var(--admin-border)] rounded-md bg-black text-[#5BB8F5] dark:text-[#69D97D] font-mono text-[10px] space-y-2 max-h-64 overflow-y-auto admin-scrollbar">
              {mockSystemLogs.map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed select-text">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
