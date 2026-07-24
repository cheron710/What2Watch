// src/app/admin/guillaume/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getGuillaumeSettings, saveGuillaumeSettings, getGuillaumeLogs } from "@/services/adminService";
import { useToast } from "@/components/admin/layout/AdminLayout";
import { InputField, TextareaField, SelectField } from "@/components/admin/forms/FormFields";
import {
  Settings,
  Bot,
  Play,
  History,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Brain,
  Sliders
} from "lucide-react";

export default function GuillaumeAIPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Prompt configuration states
  const [formValues, setFormValues] = useState({
    temperature: 0.7,
    model: "gemini-1.5-flash",
    max_tokens: 1024,
    system_prompt: "",
    fallback_prompt: ""
  });

  // Prompt test states
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testing, setTesting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settings, historyLogs] = await Promise.all([
        getGuillaumeSettings(),
        getGuillaumeLogs()
      ]);
      setFormValues(settings);
      setLogs(historyLogs);
    } catch (e) {
      showToast("Failed to fetch Guillaume configuration.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveGuillaumeSettings({
        ...formValues,
        temperature: parseFloat(formValues.temperature.toString()),
        max_tokens: parseInt(formValues.max_tokens.toString(), 10)
      });
      showToast("Guillaume system prompt configuration updated.", "success");
      loadData();
    } catch (e) {
      showToast("Failed to save config.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Interactive Prompt Test Simulator
  const handleTestPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    setTesting(true);
    setTestOutput("");
    try {
      // Simulate real-time streaming AI execution delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const responses = [
        "Mon ami! Based on your mood, I recommend Damien Chazelle's bittersweet 'La La Land' (2016) for its wistful nostalgia, paired with the atmospheric dread of Robert Eggers' 'Nosferatu' (2024). A perfect duality of desire and shadow.",
        "Ah, looking for an emotional sanctuary? Let us explore 'Nosferatu' (2024). Eggers constructs a gothic monument to isolation that will resonance with your introspective state. Truly sublime.",
        "To lift your spirits, let us examine the brilliant choreographies of Fuqua's 'Michael' (2026). It provides a vivid exploration of creative genius, balanced with rich nostalgia."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setTestOutput(randomResponse);
      showToast("Simulated AI response received.", "success");
    } catch (e) {
      setTestOutput("Error connecting to Generative AI model gateway.");
      showToast("Test request failed.", "error");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[var(--admin-text-muted)]">
        <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
        <span className="text-xs uppercase font-bold tracking-wider">Syncing prompt models...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Guillaume AI Controller</h1>
        <p className="text-sm text-[var(--admin-text-muted)]">
          Manage system prompt templates, tune temperature parameters, inspect usage logs, or run validation tests.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Prompt Configurator */}
        <form onSubmit={handleSaveConfig} className="admin-card space-y-6 xl:col-span-2">
          <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
            <Sliders size={18} className="text-[var(--admin-accent)]" />
            <h2 className="text-base font-bold text-[var(--admin-text)]">System Prompt Tuning</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Generative Model Selection"
              value={formValues.model}
              onChange={(e) => setFormValues({ ...formValues, model: e.target.value })}
              options={[
                { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Default)" },
                { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
                { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
                { value: "gpt-4o", label: "GPT-4o (OpenAI)" }
              ]}
            />
            <InputField
              label="Temperature (0.1 - 1.0)"
              type="number"
              step="0.1"
              min="0.1"
              max="1.0"
              value={formValues.temperature}
              onChange={(e) => setFormValues({ ...formValues, temperature: parseFloat(e.target.value) })}
            />
            <SelectField
              label="Max Completion Tokens"
              value={formValues.max_tokens}
              onChange={(e) => setFormValues({ ...formValues, max_tokens: parseInt(e.target.value, 10) })}
              options={[
                { value: 256, label: "256 tokens" },
                { value: 512, label: "512 tokens" },
                { value: 1024, label: "1024 tokens" },
                { value: 2048, label: "2048 tokens" }
              ]}
            />
          </div>

          <TextareaField
            label="Base System Instruction Prompt"
            value={formValues.system_prompt}
            onChange={(e) => setFormValues({ ...formValues, system_prompt: e.target.value })}
            placeholder="Introduce constraints, behavioral personalities, and output structure expectations..."
            rows={6}
          />

          <TextareaField
            label="Emergency Fallback Prompt"
            value={formValues.fallback_prompt}
            onChange={(e) => setFormValues({ ...formValues, fallback_prompt: e.target.value })}
            placeholder="Triggered when API limits are hit or content filters restrict query processing..."
            rows={4}
          />

          <div className="flex items-center justify-end select-none">
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary font-bold uppercase tracking-wider text-[11px] px-6 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Save Configuration
            </button>
          </div>
        </form>

        {/* Live Prompt Tester */}
        <div className="admin-card space-y-4 xl:col-span-1">
          <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
            <Brain size={18} className="text-[var(--admin-accent)]" />
            <h2 className="text-base font-bold text-[var(--admin-text)]">Interactive Playground</h2>
          </div>

          <form onSubmit={handleTestPrompt} className="space-y-4">
            <InputField
              label="Mock User Request"
              placeholder="e.g. recommend me something melancholic..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={testing || !testInput}
              className="admin-btn admin-btn-secondary w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Play size={13} />}
              <span>Test Prompts Sync</span>
            </button>
          </form>

          {/* Prompt output display console */}
          <div className="space-y-1">
            <span className="admin-label">Model Completion Output</span>
            <div className="p-3 border border-[var(--admin-border)] rounded-md bg-[var(--admin-input-bg)] text-xs min-h-[100px] leading-relaxed text-[var(--admin-text)]">
              {testing ? (
                <div className="flex items-center justify-center py-6 gap-2 text-[var(--admin-text-muted)] select-none">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Streaming response from {formValues.model}...</span>
                </div>
              ) : (
                testOutput || <span className="text-[var(--admin-text-muted)] italic select-none">Completion responses will render here...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Logs */}
      <div className="admin-card space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
          <History size={18} className="text-[var(--admin-accent)]" />
          <h2 className="text-base font-bold text-[var(--admin-text)]">Guillaume Interaction Logs</h2>
        </div>

        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px] text-xs">
            <thead>
              <tr className="border-b border-[var(--admin-border-strong)] bg-black/2 dark:bg-white/1 select-none">
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-[var(--admin-text-muted)]">Time</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-[var(--admin-text-muted)]">User</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-[var(--admin-text-muted)]">Prompt</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-[var(--admin-text-muted)]">Output</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-[var(--admin-text-muted)]">Tokens</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-[var(--admin-text-muted)]">Latency</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-[var(--admin-text-muted)]">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-black/2 dark:hover:bg-white/2 transition">
                  <td className="p-3 text-[var(--admin-text-muted)] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 font-semibold text-[var(--admin-text)]">{log.user}</td>
                  <td className="p-3 max-w-[200px] truncate text-[var(--admin-text-muted)]" title={log.prompt}>
                    {log.prompt}
                  </td>
                  <td className="p-3 max-w-[300px] truncate text-[var(--admin-text)]" title={log.response}>
                    {log.response}
                  </td>
                  <td className="p-3 text-[var(--admin-text-muted)] font-mono">{log.tokens}</td>
                  <td className="p-3 text-[var(--admin-text-muted)]">{log.latency}ms</td>
                  <td className="p-3">
                    {log.status === "success" ? (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-green-600">
                        <CheckCircle size={10} />
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-red-600">
                        <AlertTriangle size={10} />
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
