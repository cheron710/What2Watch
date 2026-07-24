// src/app/admin/festivals/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getFestivals, saveFestival, getMovies } from "@/services/adminService";
import DataTable, { Column } from "@/components/admin/tables/DataTable";
import { useToast } from "@/components/admin/layout/AdminLayout";
import { InputField, TextareaField, SelectField } from "@/components/admin/forms/FormFields";
import { Modal } from "@/components/admin/dialogs/Dialogs";
import { Plus, Edit2, Loader2, ListOrdered, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export default function FestivalsPage() {
  const { showToast } = useToast();

  const [collections, setCollections] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [activeCol, setActiveCol] = useState<any>(null);

  // Form
  const [formValues, setFormValues] = useState<any>({
    id: "",
    festival_name: "Cannes",
    year: new Date().getFullYear(),
    title: "",
    description: "",
    is_published: true,
    movies: []
  });
  const [saving, setSaving] = useState(false);

  // Movie searching state inside modal
  const [selectedMovieId, setSelectedMovieId] = useState<number | "">("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [cols, movs] = await Promise.all([getFestivals(), getMovies()]);
      setCollections(cols);
      setMovies(movs);
    } catch (e) {
      showToast("Failed to fetch festival curations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (col?: any) => {
    setSelectedMovieId("");
    if (col) {
      setActiveCol(col);
      setFormValues({
        id: col.id,
        festival_name: col.festival_name,
        year: col.year,
        title: col.title,
        description: col.description || "",
        is_published: !!col.is_published,
        movies: col.movies || []
      });
    } else {
      setActiveCol(null);
      setFormValues({
        id: "",
        festival_name: "Cannes",
        year: new Date().getFullYear(),
        title: "",
        description: "",
        is_published: true,
        movies: []
      });
    }
    setEditOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.title.trim()) {
      showToast("Curation title is required.", "warning");
      return;
    }

    setSaving(true);
    try {
      await saveFestival(formValues);
      showToast(`Saved ${formValues.festival_name} (${formValues.year}) collection.`, "success");
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
      id: "festival_name",
      label: "Festival",
      sortable: true,
      filterOptions: ["Cannes", "Venice", "Berlin", "Oscars", "Toronto", "Sundance"]
    },
    { id: "year", label: "Year", sortable: true },
    { id: "title", label: "Showcase Title", sortable: true },
    {
      id: "movies",
      label: "Films",
      render: (row) => (
        <span className="font-semibold text-[var(--admin-text)] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
          {row.movies?.length || 0} movies
        </span>
      )
    },
    {
      id: "is_published",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
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
          title="Edit Showcase"
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
          <h1 className="text-3xl font-extrabold tracking-tight">Festival Curation</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Manage yearly curations representing Cannes, Venice, Berlin, Sundance, Toronto, or Oscars.
          </p>
        </div>
        <button
          onClick={() => handleOpenEdit()}
          className="admin-btn admin-btn-primary h-10 px-5 flex items-center gap-1.5 cursor-pointer text-xs font-semibold tracking-wider shrink-0 select-none"
        >
          <Plus size={16} />
          <span>New Showcase</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-[var(--admin-text-muted)]">
          <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
          <span className="text-xs uppercase font-bold tracking-wider">Syncing yearly listings...</span>
        </div>
      ) : (
        <DataTable
          data={collections}
          columns={columns}
          searchPlaceholder="Search title..."
          searchKey="title"
          onRowClick={handleOpenEdit}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={activeCol ? `Edit Curation: ${activeCol.festival_name} ${activeCol.year}` : "New Festival Showcase"}
      >
        <form onSubmit={handleSaveSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Festival Name"
              value={formValues.festival_name}
              onChange={(e) => setFormValues({ ...formValues, festival_name: e.target.value })}
              options={[
                { value: "Cannes", label: "Cannes" },
                { value: "Venice", label: "Venice" },
                { value: "Berlin", label: "Berlin" },
                { value: "Oscars", label: "Oscars" },
                { value: "Toronto", label: "Toronto" },
                { value: "Sundance", label: "Sundance" }
              ]}
            />
            <InputField
              label="Year (YYYY)"
              type="number"
              value={formValues.year}
              onChange={(e) => setFormValues({ ...formValues, year: parseInt(e.target.value, 10) })}
              required
            />
            <SelectField
              label="Publish Status"
              value={formValues.is_published ? "true" : "false"}
              onChange={(e) => setFormValues({ ...formValues, is_published: e.target.value === "true" })}
              options={[
                { value: "true", label: "Published" },
                { value: "false", label: "Draft" }
              ]}
            />
          </div>

          <InputField
            label="Showcase Title"
            placeholder="Palme d'Or Contenders"
            value={formValues.title}
            onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
            required
          />

          <TextareaField
            label="Showcase Summary"
            placeholder="Provide context about this year's award slate..."
            value={formValues.description}
            onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
          />

          {/* Assigned movies */}
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
                <option value="">Select cached movie to append...</option>
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
                  No movies assigned to this festival list yet.
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
              Save Showcase
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
