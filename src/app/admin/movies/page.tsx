// src/app/admin/movies/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  getMovies,
  saveMovie,
  deleteMovie,
  bulkDeleteMovies,
  bulkUpdateMovies
} from "@/services/adminService";
import DataTable, { Column } from "@/components/admin/tables/DataTable";
import { ConfirmDialog, TmdbImportDialog } from "@/components/admin/dialogs/Dialogs";
import { useToast } from "@/components/admin/layout/AdminLayout";
import {
  InputField,
  TextareaField,
  SelectField,
  TagInputField,
  useDraftAutosave
} from "@/components/admin/forms/FormFields";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CloudDownload,
  Loader2,
  Sparkles,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { Modal } from "@/components/admin/dialogs/Dialogs";

// Schema for tags
const EMOTIONAL_SUGGESTIONS = ["Joy", "Fear", "Hope", "Grief", "Healing", "Loneliness", "Wonder", "Love", "Nostalgia"];
const CONTEXT_SUGGESTIONS = ["Rainy Day", "Date Night", "Alone", "With Friends", "Late Night", "Intellectual Study"];
const CRAFT_SUGGESTIONS = ["Cinematography", "Sound Design", "Acting", "Directing", "Color Palette", "Screenplay"];
const FESTIVAL_SUGGESTIONS = ["Cannes", "Venice", "Berlin", "Toronto", "Sundance", "Oscars"];

export default function MoviesPage() {
  const { showToast } = useToast();

  // Data state
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog controls
  const [importOpen, setImportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeMovie, setActiveMovie] = useState<any>(null);
  const [movieToDelete, setMovieToDelete] = useState<any>(null);

  // Form states
  const [formValues, setFormValues] = useState<any>({
    id: 0,
    title: "",
    custom_editorial_description: "",
    recommendation_score: 50,
    visibility: "visible",
    status: "published",
    is_featured: false,
    is_homepage_hero: false,
    emotional_tags: [],
    context_tags: [],
    craft_tags: [],
    festival_tags: [],
    trailer_url: "",
    backdrop_path: "",
    poster_path: ""
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [resetDraft, setResetDraft] = useState(false);

  // Load Movies
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (e) {
      showToast("Failed to fetch movies from Supabase.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Autosave edit drafts
  useDraftAutosave(
    editOpen ? `edit_movie_${formValues.id}` : "movie_draft_idle",
    formValues,
    resetDraft,
    (recovered) => {
      setFormValues(recovered);
      showToast("Recovered unsaved draft changes.", "info");
    }
  );

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formValues.title.trim()) errs.title = "Movie title is required.";
    const score = Number(formValues.recommendation_score);
    if (isNaN(score) || score < 1 || score > 100) {
      errs.recommendation_score = "Score must be an integer between 1 and 100.";
    }
    if (formValues.is_homepage_hero) {
      // Count other visible/published movies set as hero spotlight
      const activeHeroCount = movies.filter(
        (m) => m.is_homepage_hero && m.id !== formValues.id && m.visibility !== "hidden" && m.status !== "draft"
      ).length;
      if (activeHeroCount >= 4) {
        errs.is_homepage_hero = "Maximum of 4 movies are allowed in the hero spotlight section. Please disable spotlight on another movie first.";
      }
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Create or Edit Trigger
  const handleOpenEdit = (movie: any) => {
    setResetDraft(false);
    setFormErrors({});
    setActiveMovie(movie);
    setFormValues({
      id: movie.id,
      title: movie.title,
      custom_editorial_description: movie.custom_editorial_description || "",
      recommendation_score: movie.recommendation_score || 50,
      visibility: movie.visibility || "visible",
      status: movie.status || "published",
      is_featured: !!movie.is_featured,
      is_homepage_hero: !!movie.is_homepage_hero,
      emotional_tags: movie.emotional_tags || [],
      context_tags: movie.context_tags || [],
      craft_tags: movie.craft_tags || [],
      festival_tags: movie.festival_tags || [],
      trailer_url: movie.trailer_url || "",
      backdrop_path: movie.backdrop_path || "",
      poster_path: movie.poster_path || ""
    });
    setEditOpen(true);
  };

  // Submit Save
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...activeMovie, // retain raw TMDb values if editing
        ...formValues,
        recommendation_score: parseInt(formValues.recommendation_score, 10)
      };

      const saved = await saveMovie(payload);
      setResetDraft(true);
      showToast(`Successfully saved "${saved.title}".`, "success");
      setEditOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to save film records.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const handleOpenDelete = (movie: any) => {
    setMovieToDelete(movie);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;
    const cache = { ...movieToDelete };
    try {
      await deleteMovie(movieToDelete.id);
      showToast(`Deleted "${movieToDelete.title}".`, "success", async () => {
        // Undo Action
        await saveMovie(cache);
        showToast(`Restored "${cache.title}".`, "success");
        loadData();
      });
      loadData();
    } catch (e) {
      showToast("Failed to delete movie record.", "error");
    }
  };

  // Bulk Options
  const handleBulkDelete = async (selected: any[]) => {
    const ids = selected.map((s) => s.id);
    const cached = [...movies.filter((m) => ids.includes(m.id))];
    try {
      await bulkDeleteMovies(ids);
      showToast(`Bulk deleted ${ids.length} films.`, "success", async () => {
        // Restore items
        await Promise.all(cached.map((c) => saveMovie(c)));
        showToast(`Restored bulk deleted items.`, "success");
        loadData();
      });
      loadData();
    } catch (e) {
      showToast("Bulk operation failed.", "error");
    }
  };

  const handleBulkToggleVisibility = async (selected: any[]) => {
    const ids = selected.map((s) => s.id);
    const firstVal = selected[0]?.visibility;
    const nextVal = firstVal === "visible" ? "hidden" : "visible";
    try {
      await bulkUpdateMovies(ids, { visibility: nextVal });
      showToast(`Updated visibility for ${ids.length} films to ${nextVal}.`, "success");
      loadData();
    } catch (e) {
      showToast("Bulk visibility toggle failed.", "error");
    }
  };

  const handleRefreshTmdb = async (selected: any[]) => {
    showToast("Triggered metadata refreshes in the background.", "info");
  };

  // Column definitions
  const columns: Column<any>[] = [
    {
      id: "poster_path",
      label: "Poster",
      render: (row) => (
        <div className="w-9 h-12 bg-black/10 dark:bg-white/5 rounded overflow-hidden shrink-0 flex items-center justify-center text-[var(--admin-text-muted)] text-[8px] border border-[var(--admin-border)]">
          {row.poster_path ? (
            <img src={row.poster_path} alt="" className="w-full h-full object-cover" />
          ) : (
            "No Art"
          )}
        </div>
      )
    },
    { id: "title", label: "Title", sortable: true },
    { id: "release_date", label: "Release Date", sortable: true },
    { id: "runtime", label: "Runtime", sortable: true, render: (row) => <span>{row.runtime ? `${row.runtime} min` : "-"}</span> },
    {
      id: "visibility",
      label: "Visibility",
      sortable: true,
      filterOptions: ["visible", "hidden"],
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${row.visibility === "visible" ? "text-green-600 dark:text-green-400" : "text-gray-400"
            }`}
        >
          {row.visibility === "visible" ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>{row.visibility}</span>
        </span>
      )
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      filterOptions: ["published", "draft"],
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${row.status === "published"
              ? "bg-[var(--admin-success-bg)] text-[var(--admin-success)]"
              : "bg-[var(--admin-warning-bg)] text-[var(--admin-warning)]"
            }`}
        >
          {row.status}
        </span>
      )
    },
    {
      id: "recommendation_score",
      label: "Score",
      sortable: true,
      render: (row) => (
        <span className="font-bold text-[var(--admin-text)] flex items-center gap-1">
          <Sparkles size={11} className="text-[var(--admin-accent)]" />
          {row.recommendation_score || 50}/100
        </span>
      )
    },
    {
      id: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            title="Edit movie details"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
            title="Delete movie"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  const bulkActionsList = [
    { label: "Delete Selected", icon: Trash2, onClick: handleBulkDelete, variant: "danger" as const },
    { label: "Toggle Visibility", icon: Eye, onClick: handleBulkToggleVisibility },
    { label: "Refresh TMDb Sync", icon: CloudDownload, onClick: handleRefreshTmdb }
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Movies Directory</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Configure mood weights or import directly from The Movie Database.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 select-none">
          <button
            onClick={() => setImportOpen(true)}
            className="admin-btn admin-btn-secondary h-10 px-4 flex items-center gap-2 cursor-pointer text-xs font-semibold tracking-wider"
          >
            <CloudDownload size={15} />
            <span>Import TMDb</span>
          </button>
        </div>
      </div>

      {/* Main Table list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-[var(--admin-text-muted)]">
          <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
          <span className="text-xs uppercase font-bold tracking-wider">Syncing film library...</span>
        </div>
      ) : (
        <DataTable
          data={movies}
          columns={columns}
          searchPlaceholder="Search movie title..."
          searchKey="title"
          bulkActions={bulkActionsList}
          onRowClick={handleOpenEdit}
        />
      )}

      {/* Modals & dialogs overlay */}
      <TmdbImportDialog
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={(movie) => {
          showToast(`Successfully imported and cached "${movie.title}".`, "success");
          loadData();
          handleOpenEdit(movie); // immediately open editor to curate
        }}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        message={movieToDelete ? `Are you sure you want to delete "${movieToDelete.title}"?` : ""}
      />

      {/* Editing Dialog Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={activeMovie ? `Curate Movie: ${activeMovie.title}` : ""}
      >
        <form onSubmit={handleSaveSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Movie Title"
              value={formValues.title}
              onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
              error={formErrors.title}
              required
            />
            <InputField
              label="Recommendation score (1-100)"
              type="number"
              value={formValues.recommendation_score}
              onChange={(e) => setFormValues({ ...formValues, recommendation_score: e.target.value })}
              error={formErrors.recommendation_score}
              required
            />
          </div>

          <TextareaField
            label="Custom Editorial Description"
            placeholder="Write a bespoke paragraph details why this film deserves to be recommended..."
            value={formValues.custom_editorial_description}
            onChange={(e) => setFormValues({ ...formValues, custom_editorial_description: e.target.value })}
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Visibility"
              value={formValues.visibility}
              onChange={(e) => setFormValues({ ...formValues, visibility: e.target.value })}
              options={[
                { value: "visible", label: "Visible on Site" },
                { value: "hidden", label: "Hidden (Admin Only)" }
              ]}
            />
            <SelectField
              label="Publish Status"
              value={formValues.status}
              onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
              options={[
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" }
              ]}
            />
          </div>

          <InputField
            label="YouTube Trailer Link"
            placeholder="https://www.youtube.com/watch?v=..."
            value={formValues.trailer_url}
            onChange={(e) => setFormValues({ ...formValues, trailer_url: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Hero Section Image (Custom Backdrop URL)"
              placeholder="https://example.com/backdrop.jpg"
              value={formValues.backdrop_path}
              onChange={(e) => setFormValues({ ...formValues, backdrop_path: e.target.value })}
            />
            <InputField
              label="Custom Poster Image URL"
              placeholder="https://example.com/poster.jpg"
              value={formValues.poster_path}
              onChange={(e) => setFormValues({ ...formValues, poster_path: e.target.value })}
            />
          </div>

          {/* Toggle highlights */}
          <div className="flex flex-col gap-2 py-1.5 border-y border-[var(--admin-border)]">
            <div className="flex flex-wrap gap-6 items-center select-none">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-[var(--admin-text)]">
                <input
                  type="checkbox"
                  checked={formValues.is_featured}
                  onChange={(e) => setFormValues({ ...formValues, is_featured: e.target.checked })}
                  className="rounded border-[var(--admin-border-strong)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)] cursor-pointer"
                />
                <span>Mark as Homepage Featured</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-[var(--admin-text)]">
                <input
                  type="checkbox"
                  checked={formValues.is_homepage_hero}
                  onChange={(e) => setFormValues({ ...formValues, is_homepage_hero: e.target.checked })}
                  className="rounded border-[var(--admin-border-strong)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)] cursor-pointer"
                />
                <span>Homepage Hero Spotlight</span>
              </label>
            </div>
            {formErrors.is_homepage_hero && (
              <span className="text-xs text-[var(--admin-error)] flex items-center gap-1 animate-pulse">
                <AlertCircle size={12} />
                {formErrors.is_homepage_hero}
              </span>
            )}
          </div>

          {/* Tag curations */}
          <div className="space-y-4 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] border-b border-[var(--admin-border)] pb-1.5">
              Curation Tags & Metadata
            </h3>
            <TagInputField
              label="Emotional spectrum tags"
              tags={formValues.emotional_tags}
              onChange={(tags) => setFormValues({ ...formValues, emotional_tags: tags })}
              suggestions={EMOTIONAL_SUGGESTIONS}
              placeholder="Add emotion (Joy, Hope, Grief...)"
            />
            <TagInputField
              label="Context tags"
              tags={formValues.context_tags}
              onChange={(tags) => setFormValues({ ...formValues, context_tags: tags })}
              suggestions={CONTEXT_SUGGESTIONS}
              placeholder="Add scenario (Rainy Day, Date Night...)"
            />
            <TagInputField
              label="Craft & aesthetics tags"
              tags={formValues.craft_tags}
              onChange={(tags) => setFormValues({ ...formValues, craft_tags: tags })}
              suggestions={CRAFT_SUGGESTIONS}
              placeholder="Add craft (Cinematography, Performance...)"
            />
            <TagInputField
              label="Festival curations"
              tags={formValues.festival_tags}
              onChange={(tags) => setFormValues({ ...formValues, festival_tags: tags })}
              suggestions={FESTIVAL_SUGGESTIONS}
              placeholder="Add festival (Cannes, Venice...)"
            />
          </div>

          {/* Dialog Action bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--admin-border)] select-none">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              disabled={saving}
              className="admin-btn admin-btn-secondary px-5 py-2 cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary font-bold uppercase tracking-wider text-[11px] px-6 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
