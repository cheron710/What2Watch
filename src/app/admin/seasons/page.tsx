// src/app/admin/seasons/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getSeasons, saveSeason, getMovies } from "@/services/adminService";
import DataTable, { Column } from "@/components/admin/tables/DataTable";
import { useToast } from "@/components/admin/layout/AdminLayout";
import { InputField, TextareaField, SelectField } from "@/components/admin/forms/FormFields";
import { Modal } from "@/components/admin/dialogs/Dialogs";
import { Plus, Edit2, Loader2, ListOrdered, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export default function SeasonsPage() {
  const { showToast } = useToast();

  const [seasons, setSeasons] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [activeSeason, setActiveSeason] = useState<any>(null);

  // Form
  const [formValues, setFormValues] = useState<any>({
    id: "",
    season: "Spring",
    name: "Partner",
    description: "",
    featured_movie_id: "",
    is_published: true,
    movies: []
  });
  const [saving, setSaving] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | "">("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, movs] = await Promise.all([getSeasons(), getMovies()]);
      setSeasons(list);
      setMovies(movs);
    } catch (e) {
      showToast("Failed to fetch seasonal categories.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (item: any) => {
    setSelectedMovieId("");
    setActiveSeason(item);
    setFormValues({
      id: item.id,
      season: item.season,
      name: item.name,
      description: item.description || "",
      featured_movie_id: item.featured_movie_id || "",
      is_published: !!item.is_published,
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
      await saveSeason(payload);
      showToast(`Saved ${formValues.name} (${formValues.season}) curation.`, "success");
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
      id: "season",
      label: "Season",
      sortable: true,
      filterOptions: ["Spring", "Summer", "Autumn", "Winter"]
    },
    {
      id: "name",
      label: "Category",
      sortable: true,
      filterOptions: ["Partner", "Family", "Friends", "Children", "Parents", "Alone", "Date Night", "Groups"]
    },
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
      id: "is_published",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
            row.is_published ? "bg-[var(--admin-success-bg)] text-[var(--admin-success)]" : "bg-gray-100 text-gray-500"
          }`}
        >
          {row.is_published ? "Published" : "Draft"}
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
          <h1 className="text-3xl font-extrabold tracking-tight">Watch With Someone</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Configure movie catalogs for relationship templates based on seasonal mood templates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-[var(--admin-text-muted)]">
          <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
          <span className="text-xs uppercase font-bold tracking-wider">Loading templates...</span>
        </div>
      ) : (
        <DataTable
          data={seasons}
          columns={columns}
          searchPlaceholder="Search category name..."
          searchKey="name"
          onRowClick={handleOpenEdit}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={activeSeason ? `Edit: ${activeSeason.name} (${activeSeason.season})` : ""}
      >
        <form onSubmit={handleSaveSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Select Season"
              value={formValues.season}
              onChange={(e) => setFormValues({ ...formValues, season: e.target.value })}
              options={[
                { value: "Spring", label: "Spring" },
                { value: "Summer", label: "Summer" },
                { value: "Autumn", label: "Autumn" },
                { value: "Winter", label: "Winter" }
              ]}
            />
            <SelectField
              label="Select Category"
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              options={[
                { value: "Partner", label: "Partner" },
                { value: "Family", label: "Family" },
                { value: "Friends", label: "Friends" },
                { value: "Children", label: "Children" },
                { value: "Parents", label: "Parents" },
                { value: "Alone", label: "Alone" },
                { value: "Date Night", label: "Date Night" },
                { value: "Groups", label: "Groups" }
              ]}
            />
          </div>

          <TextareaField
            label="Seasonal Curation Description"
            placeholder="Write a custom description details the flavor of this category..."
            value={formValues.description}
            onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Featured Spotlight Movie"
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
            <SelectField
              label="Curation Status"
              value={formValues.is_published ? "true" : "false"}
              onChange={(e) => setFormValues({ ...formValues, is_published: e.target.value === "true" })}
              options={[
                { value: "true", label: "Published" },
                { value: "false", label: "Draft" }
              ]}
            />
          </div>

          {/* Curation List */}
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
                        className="p-1 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveMovie(idx, "down")}
                        disabled={idx === formValues.movies.length - 1}
                        className="p-1 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer"
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
                  No movies assigned to this seasonal listing yet.
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
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
