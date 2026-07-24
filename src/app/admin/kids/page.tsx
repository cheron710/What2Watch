// src/app/admin/kids/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getKids, saveKids, getMovies } from "@/services/adminService";
import DataTable, { Column } from "@/components/admin/tables/DataTable";
import { useToast } from "@/components/admin/layout/AdminLayout";
import { InputField, TextareaField, SelectField, TagInputField } from "@/components/admin/forms/FormFields";
import { Modal } from "@/components/admin/dialogs/Dialogs";
import { Plus, Edit2, Loader2, ListOrdered, ArrowUp, ArrowDown, Trash2, ShieldAlert } from "lucide-react";

export default function KidsPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<any>(null);

  // Form
  const [formValues, setFormValues] = useState<any>({
    id: "",
    name: "Kids",
    min_age: 6,
    max_age: 10,
    description: "",
    movies: [],
    movie_details: {}
  });
  const [saving, setSaving] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | "">("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, movs] = await Promise.all([getKids(), getMovies()]);
      setCategories(list);
      setMovies(movs);
    } catch (e) {
      showToast("Failed to fetch kids categories.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (item?: any) => {
    setSelectedMovieId("");
    if (item) {
      setActiveCat(item);
      setFormValues({
        id: item.id,
        name: item.name,
        min_age: item.min_age,
        max_age: item.max_age,
        description: item.description || "",
        movies: item.movies || [],
        movie_details: item.movie_details || {}
      });
    } else {
      setActiveCat(null);
      setFormValues({
        id: "",
        name: "Kids",
        min_age: 6,
        max_age: 10,
        description: "",
        movies: [],
        movie_details: {}
      });
    }
    setEditOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveKids(formValues);
      showToast(`Saved kids age bracket "${formValues.name}".`, "success");
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
      const nextMovies = [...formValues.movies, id];
      const nextDetails = {
        ...formValues.movie_details,
        [id]: {
          safety_rating: "G",
          educational_tags: [],
          family_tags: []
        }
      };
      setFormValues({ ...formValues, movies: nextMovies, movie_details: nextDetails });
    }
    setSelectedMovieId("");
  };

  const handleRemoveMovie = (movieId: number) => {
    const nextDetails = { ...formValues.movie_details };
    delete nextDetails[movieId];
    setFormValues({
      ...formValues,
      movies: formValues.movies.filter((id: number) => id !== movieId),
      movie_details: nextDetails
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

  // Sub-tags modification
  const handleUpdateMovieMeta = (movieId: number, key: string, val: any) => {
    setFormValues({
      ...formValues,
      movie_details: {
        ...formValues.movie_details,
        [movieId]: {
          ...(formValues.movie_details?.[movieId] || {}),
          [key]: val
        }
      }
    });
  };

  const getMovieTitle = (id: number) => {
    const found = movies.find((m) => m.id === id);
    return found ? `${found.title} (${found.release_date?.split("-")[0] || "N/A"})` : `TMDb ID: ${id}`;
  };

  const columns: Column<any>[] = [
    {
      id: "name",
      label: "Age Group",
      sortable: true,
      filterOptions: ["Toddlers", "Kids", "Pre-teens"]
    },
    { id: "min_age", label: "Min Age", sortable: true },
    { id: "max_age", label: "Max Age", sortable: true },
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
          title="Edit Category Curation"
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
          <h1 className="text-3xl font-extrabold tracking-tight">Kids Section</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Manage age brackets (Toddlers, Kids, Pre-teens) and curate safe, educational, and family-friendly movies.
          </p>
        </div>
        <button
          onClick={() => handleOpenEdit()}
          className="admin-btn admin-btn-primary h-10 px-5 flex items-center gap-1.5 cursor-pointer text-xs font-semibold tracking-wider shrink-0 select-none"
        >
          <Plus size={16} />
          <span>New Age Group</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-[var(--admin-text-muted)]">
          <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
          <span className="text-xs uppercase font-bold tracking-wider">Syncing child categories...</span>
        </div>
      ) : (
        <DataTable
          data={categories}
          columns={columns}
          searchPlaceholder="Search group name..."
          searchKey="name"
          onRowClick={handleOpenEdit}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={activeCat ? `Edit Group: ${activeCat.name}` : "New Kids Age Group"}
      >
        <form onSubmit={handleSaveSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Age Bracket"
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              options={[
                { value: "Toddlers", label: "Toddlers" },
                { value: "Kids", label: "Kids" },
                { value: "Pre-teens", label: "Pre-teens" }
              ]}
            />
            <InputField
              label="Min Age Limit"
              type="number"
              value={formValues.min_age}
              onChange={(e) => setFormValues({ ...formValues, min_age: parseInt(e.target.value, 10) })}
              required
            />
            <InputField
              label="Max Age Limit"
              type="number"
              value={formValues.max_age}
              onChange={(e) => setFormValues({ ...formValues, max_age: parseInt(e.target.value, 10) })}
              required
            />
          </div>

          <TextareaField
            label="Section Description"
            placeholder="Write a custom description details the flavor of this age bracket..."
            value={formValues.description}
            onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
          />

          {/* Assigned films */}
          <div className="space-y-6 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] border-b border-[var(--admin-border)] pb-2 flex items-center gap-1.5">
              <ListOrdered size={14} />
              <span>Assigned Movies & Safety Metadata</span>
            </h3>

            <div className="flex gap-2">
              <select
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(e.target.value ? Number(e.target.value) : "")}
                className="admin-input flex-1"
              >
                <option value="">Select safe movie to append...</option>
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

            <div className="space-y-4 max-h-[360px] overflow-y-auto admin-scrollbar pr-1">
              {formValues.movies.length > 0 ? (
                formValues.movies.map((mid: number, idx: number) => {
                  const details = formValues.movie_details?.[mid] || {};
                  return (
                    <div
                      key={mid}
                      className="p-4 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-input-bg)] space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[var(--admin-text)] truncate pr-4">
                          {idx + 1}. {getMovieTitle(mid)}
                        </span>
                        <div className="flex items-center gap-1">
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

                      {/* Safety elements editing */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <SelectField
                          label="Safety Rating"
                          value={details.safety_rating || "G"}
                          onChange={(e) => handleUpdateMovieMeta(mid, "safety_rating", e.target.value)}
                          options={[
                            { value: "G", label: "G (General Audience)" },
                            { value: "PG", label: "PG (Parental Guidance)" },
                            { value: "PG-13", label: "PG-13 (Cautious)" }
                          ]}
                        />
                        <TagInputField
                          label="Educational value"
                          tags={details.educational_tags || []}
                          onChange={(tags) => handleUpdateMovieMeta(mid, "educational_tags", tags)}
                          suggestions={["Logic", "Science", "Nature", "Morals", "History", "Creativity"]}
                          placeholder="Add topic..."
                        />
                        <TagInputField
                          label="Family descriptors"
                          tags={details.family_tags || []}
                          onChange={(tags) => handleUpdateMovieMeta(mid, "family_tags", tags)}
                          suggestions={["Heartwarming", "Animals", "Magic", "Adventure", "Humor"]}
                          placeholder="Add detail..."
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-[var(--admin-text-muted)] border border-dashed border-[var(--admin-border)] rounded-lg">
                  No movies assigned to this group yet. Add one from the selector above.
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
              Save Age Group
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
