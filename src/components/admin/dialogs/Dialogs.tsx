// src/components/admin/dialogs/Dialogs.tsx
"use client";

import React, { useState, useEffect } from "react";
import { searchTMDb, importFromTMDb } from "@/services/adminService";
import { X, Search, Loader2, AlertTriangle, CloudDownload, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── 1. GENERIC MODAL ────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-[var(--admin-card-bg)] border border-[var(--admin-border)] shadow-2xl rounded-xl max-w-lg w-full overflow-hidden z-10 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)] bg-black/2 dark:bg-white/1 shrink-0">
              <h2 className="text-base font-bold tracking-tight text-[var(--admin-text)] truncate">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto admin-scrollbar p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── 2. CONFIRMATION DIALOG ──────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "primary";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  variant = "danger"
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/20";
      case "warning":
        return "bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500/20";
      default:
        return "bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] text-white focus:ring-[var(--admin-accent)]/20";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <span className="p-3 bg-red-500/10 text-red-500 rounded-full shrink-0">
            <AlertTriangle size={24} />
          </span>
          <div className="space-y-1">
            <p className="text-sm text-[var(--admin-text)] leading-relaxed">
              {message}
            </p>
            <p className="text-xs text-[var(--admin-text-muted)]">
              This operation is final. You can undo deletions using the toast banner immediately afterwards.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--admin-border)]">
          <button
            onClick={onClose}
            disabled={loading}
            className="admin-btn admin-btn-secondary px-5 py-2 cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`admin-btn font-bold uppercase tracking-wider text-[11px] px-6 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer border-none shadow-sm ${getVariantStyles()}`}
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── 3. TMDB IMPORT DIALOG ───────────────────────────────────────────
interface TmdbImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedMovie: any) => void;
}

export function TmdbImportDialog({ isOpen, onClose, onImportSuccess }: TmdbImportDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    try {
      const res = await searchTMDb(query);
      setResults(res);
      if (res.length === 0) {
        setError("No matching films found on TMDb.");
      }
    } catch (err: any) {
      setError(err.message || "Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (movieId: number) => {
    setImportingId(movieId);
    setError(null);
    try {
      const saved = await importFromTMDb(movieId);
      onImportSuccess(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || "Import failed. Please verify API configuration.");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import from TMDb">
      <div className="space-y-6">
        {/* Search Input bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--admin-text-muted)] pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search movie title (e.g. Inception, Dune)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="admin-input pl-9"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query}
            className="admin-btn admin-btn-primary px-6 h-[42px] cursor-pointer disabled:opacity-40"
          >
            {searching ? <Loader2 size={16} className="animate-spin" /> : "Search"}
          </button>
        </form>

        {/* Error strip */}
        {error && (
          <div className="p-3 bg-[var(--admin-error-bg)] text-xs text-[var(--admin-error)] rounded-md flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results grid */}
        <div className="max-h-80 overflow-y-auto space-y-3 admin-scrollbar pr-1">
          {results.length > 0 ? (
            results.map((movie) => {
              const isImporting = importingId === movie.id;
              const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
              return (
                <div
                  key={movie.id}
                  className="flex items-center justify-between p-3 border border-[var(--admin-border)] rounded-lg hover:border-[var(--admin-accent)] transition duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-14 bg-black/10 dark:bg-white/5 rounded overflow-hidden shrink-0 flex items-center justify-center text-[var(--admin-text-muted)]">
                      {movie.poster_path ? (
                        <img
                          src={
                            movie.poster_path.startsWith("http")
                              ? movie.poster_path
                              : `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film size={18} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold truncate text-[var(--admin-text)]">
                        {movie.title}
                      </h4>
                      <p className="text-xs text-[var(--admin-text-muted)]">
                        Released: {year} · TMDb ID: {movie.id}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleImport(movie.id)}
                    disabled={importingId !== null}
                    className="admin-btn admin-btn-secondary py-1.5 px-3 h-8 text-[10px] uppercase font-bold tracking-wider rounded-full flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    {isImporting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <CloudDownload size={12} />
                    )}
                    <span>Import</span>
                  </button>
                </div>
              );
            })
          ) : (
            !searching && (
              <div className="py-8 text-center text-xs text-[var(--admin-text-muted)]">
                Search to find movies from The Movie Database (TMDb).
              </div>
            )
          )}
        </div>
      </div>
    </Modal>
  );
}
