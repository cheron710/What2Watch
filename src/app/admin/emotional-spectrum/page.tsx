// src/app/admin/emotional-spectrum/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getEmotions, saveEmotion, getMovies } from "@/services/adminService";
import DataTable, { Column } from "@/components/admin/tables/DataTable";
import { useToast } from "@/components/admin/layout/AdminLayout";
import { InputField, TextareaField, SelectField } from "@/components/admin/forms/FormFields";
import { Modal } from "@/components/admin/dialogs/Dialogs";
import { Plus, Edit2, Loader2, ListOrdered, ArrowUp, ArrowDown, Trash2, Layers } from "lucide-react";

export default function EmotionalSpectrumPage() {
  const { showToast } = useToast();

  const [emotions, setEmotions] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [activeEmotion, setActiveEmotion] = useState<any>(null);

  // Form
  const [formValues, setFormValues] = useState<any>({
    id: "",
    name: "Joy",
    slug: "joy",
    description: "",
    featured_movie_id: "",
    movies: []
  });
  const [saving, setSaving] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | "">("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, movs] = await Promise.all([getEmotions(), getMovies()]);
      setEmotions(list);
      setMovies(movs);
    } catch (e) {
      showToast("Failed to fetch emotional categories.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (item: any) => {
    setSelectedMovieId("");
    setActiveEmotion(item);
    setFormValues({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      featured_movie_id: item.featured_movie_id || "",
      movies: item.movies || []
    });
    setEditOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formValues,
        featured_movie_id: formValues.featured_movie_id ? Number(formValues.featured_movie_id) : null
      };
      await saveEmotion(payload);
      showToast(`Saved emotion "${formValues.name}".`, "success");
      setEditOpen(false);
      loadData();
    } catch (e) {
      showToast("Curation save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMovie = () => {
    if (!selectedMovieId) return;
    const id = Number(selectedMovieId);
    if (!formValues.movies.includes(id)) {
      setFormValues({ ...formValues, movies: [...formValues.movies, id] });
    }
    setSelectedMovieId("");
  };

  const handleRemoveMovie = (movieId: number) => {
    setFormValues({
      ...formValues,
      movies: formValues.movies.filter((id: number) => id !== movieId)
    });
  };

  const handleMoveMovie = (index: number, direction: "up" | "down") => {
    const list = [...formValues.movies];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;

    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    setFormValues({ ...formValues, movies: list });
  };

  const getMovieTitle = (id: number) => {
    const found = movies.find((m) => m.id === id);
    return found ? `${found.title} (${found.release_date?.split("-")[0] || "N/A"})` : `TMDb ID: ${id}`;
  };

  const columns: Column<any>[] = [
    {
      id: "name",
      label: "Emotion",
      sortable: true,
      filterOptions: ["Joy", "Fear", "Hope", "Grief", "Healing", "Loneliness", "Wonder", "Love", "Nostalgia"]
    },
    { id: "slug", label: "Slug" },
    { id: "description", label: "Description" },
    {
      id: "movies",
      label: "Films Count",
      render: (row) => (
        <span className="font-semibold text-[var(--admin-text)] bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded">
          {row.movies?.length || 0} movies
        </span>
      )
    },
    {
      id: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => handleOpenEdit(row)}
          className="p-1.5 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          title="Edit Emotion Curation"
        >
          <Edit2 size={13} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Emotional Spectrum</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Curate catalogs corresponding to specific core human feelings (e.g. Grief, Hope, Nostalgia).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-[var(--admin-text-muted)]">
          <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
          <span className="text-xs uppercase font-bold tracking-wider">Syncing spectrum database...</span>
        </div>
      ) : (
        <DataTable
          data={emotions}
          columns={columns}
          searchPlaceholder="Search emotion name..."
          searchKey="name"
          onRowClick={handleOpenEdit}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={activeEmotion ? `Edit Emotion: ${activeEmotion.name}` : ""}
      >
        <form onSubmit={handleSaveSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Select Emotion"
              value={formValues.name}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase()
                })
              }
              options={[
                { value: "Joy", label: "Joy" },
                { value: "Fear", label: "Fear" },
                { value: "Hope", label: "Hope" },
                { value: "Grief", label: "Grief" },
                { value: "Healing", label: "Healing" },
                { value: "Loneliness", label: "Loneliness" },
                { value: "Wonder", label: "Wonder" },
                { value: "Love", label: "Love" },
                { value: "Nostalgia", label: "Nostalgia" }
              ]}
            />
            <InputField label="URL Slug" value={formValues.slug} disabled required />
          </div>

          <TextareaField
            label="Emotion Narrative Description"
            placeholder="Describe the aesthetic and psychological feel of this emotional bucket..."
            value={formValues.description}
            onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
          />

          <SelectField
            label="Spotlight Featured Movie"
            value={formValues.featured_movie_id}
            onChange={(e) => setFormValues({ ...formValues, featured_movie_id: e.target.value })}
            options={[
              { value: "", label: "None selected" },
              ...formValues.movies.map((mid: number) => ({
                value: mid,
                label: getMovieTitle(mid)
              }))
            ]}
          />

          {/* Assigned films */}
          <div className="space-y-4 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] border-b border-[var(--admin-border)] pb-2 flex items-center gap-1.5">
              <ListOrdered size={14} />
              <span>Assigned Movies & Order</span>
            </h3>

            <div className="flex gap-2">
              <select
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(e.target.value ? Number(e.target.value) : "")}
                className="admin-input flex-1"
              >
                <option value="">Select movie to append...</option>
                {movies
                  .filter((m) => !formValues.movies.includes(m.id))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.release_date?.split("-")[0] || "N/A"})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddMovie}
                disabled={!selectedMovieId}
                className="admin-btn admin-btn-secondary px-5 cursor-pointer disabled:opacity-40"
              >
                Add Film
              </button>
            </div>

            <div className="border border-[var(--admin-border)] rounded-md divide-y divide-[var(--admin-border)] bg-[var(--admin-input-bg)] max-h-56 overflow-y-auto admin-scrollbar">
              {formValues.movies.length > 0 ? (
                formValues.movies.map((mid: number, idx: number) => (
                  <div key={mid} className="flex items-center justify-between p-2.5 text-xs">
                    <span className="font-semibold text-[var(--admin-text)] truncate pr-4">
                      {idx + 1}. {getMovieTitle(mid)}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveMovie(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveMovie(idx, "down")}
                        disabled={idx === formValues.movies.length - 1}
                        className="p-1 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMovie(mid)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer ml-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[var(--admin-text-muted)]">
                  No movies assigned to this emotional catalog yet.
                </div>
              )}
            </div>
          </div>

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
              Save Emotion
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
