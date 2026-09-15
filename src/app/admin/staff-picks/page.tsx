// src/app/admin/staff-picks/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getStaffPicks, saveStaffPick, deleteStaffPick, getMovies } from "@/services/adminService";
import DataTable, { Column } from "@/components/admin/tables/DataTable";
import { useToast } from "@/components/admin/layout/AdminLayout";
import { InputField, TextareaField, SelectField } from "@/components/admin/forms/FormFields";
import { Modal, ConfirmDialog } from "@/components/admin/dialogs/Dialogs";
import { Plus, Edit2, Loader2, Trash2, Film, X } from "lucide-react";

export default function StaffPicksAdminPage() {
  const { showToast } = useToast();

  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);

  // Form
  const [formValues, setFormValues] = useState<{
    id: string;
    name: string;
    role: string;
    initial: string;
    note: string;
    pick: string;
    movies: number[];
    is_published: boolean;
  }>({
    id: "",
    name: "",
    role: "",
    initial: "",
    note: "",
    pick: "",
    movies: [],
    is_published: true,
  });

  const [selectedMovieIdInput, setSelectedMovieIdInput] = useState<string>("");
  const [customTmdbInput, setCustomTmdbInput] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [members, movs] = await Promise.all([getStaffPicks(), getMovies()]);
      setStaffMembers(members);
      setMovies(movs);
    } catch (e) {
      showToast("Failed to fetch dev team curation data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (item?: any) => {
    setSelectedMovieIdInput("");
    setCustomTmdbInput("");
    if (item) {
      setActiveItem(item);
      const mList = Array.isArray(item.movies) && item.movies.length > 0
        ? item.movies.map((m: any) => Number(m))
        : (item.tmdbId ? [Number(item.tmdbId)] : []);
      setFormValues({
        id: item.id,
        name: item.name || item.title || "",
        role: item.role || item.description || "",
        initial: item.initial || "",
        note: item.note || item.description || "",
        pick: item.pick || "",
        movies: mList,
        is_published: item.is_published !== false,
      });
    } else {
      setActiveItem(null);
      setFormValues({
        id: "",
        name: "",
        role: "Developer",
        initial: "",
        note: "",
        pick: "",
        movies: [],
        is_published: true,
      });
    }
    setEditOpen(true);
  };

  const handleOpenDelete = (item: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveItem(item);
    setDeleteOpen(true);
  };

  const handleAddMovie = (idToAdd: number) => {
    if (!idToAdd || isNaN(idToAdd)) return;
    if (formValues.movies.includes(idToAdd)) {
      showToast("Movie is already added to this developer's picks.", "warning");
      return;
    }
    setFormValues((prev) => ({
      ...prev,
      movies: [...prev.movies, idToAdd],
    }));
    setSelectedMovieIdInput("");
    setCustomTmdbInput("");
  };

  const handleRemoveMovie = (idToRemove: number) => {
    setFormValues((prev) => ({
      ...prev,
      movies: prev.movies.filter((id) => id !== idToRemove),
    }));
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.name.trim()) {
      showToast("Developer/Staff member name is required.", "warning");
      return;
    }

    setSaving(true);
    try {
      const computedInitial =
        formValues.initial.trim() ||
        formValues.name
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

      const payload = {
        id: formValues.id || undefined,
        name: formValues.name.trim(),
        title: formValues.name.trim(),
        role: formValues.role.trim(),
        initial: computedInitial,
        note: formValues.note.trim(),
        description: formValues.note.trim(),
        pick: formValues.pick.trim(),
        tmdbId: formValues.movies[0] || null,
        movies: formValues.movies,
        is_published: formValues.is_published,
      };

      await saveStaffPick(payload);
      showToast(`Saved dev team picks for "${formValues.name}".`, "success");
      setEditOpen(false);
      loadData();
    } catch (e) {
      showToast("Staff pick save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeItem?.id) return;
    const targetId = String(activeItem.id);
    setDeleting(true);
    // Optimistic update
    setStaffMembers((prev) => prev.filter((m) => String(m.id) !== targetId));
    try {
      await deleteStaffPick(targetId);
      showToast(`Removed team member "${activeItem.name || activeItem.title}".`, "info");
      setDeleteOpen(false);
      await loadData();
    } catch (e) {
      showToast("Delete operation failed.", "error");
      await loadData();
    } finally {
      setDeleting(false);
    }
  };

  // Helper to find movie title from cached list or format TMDB ID
  const getMovieLabel = (tmdbId: number) => {
    const found = movies.find((m) => Number(m.id) === Number(tmdbId));
    if (found) return found.title;
    return `TMDB ID: ${tmdbId}`;
  };

  // Columns definition for DataTable
  const columns: Column<any>[] = [
    {
      id: "name",
      label: "Developer / Team Member",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--admin-accent,#FF4D2D)] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
            {row.initial || (row.name || row.title || "D").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-[var(--admin-text)]">{row.name || row.title}</div>
            <div className="text-[10px] text-[var(--admin-text-muted)] font-mono uppercase tracking-wider">
              {row.role || "Developer"}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "pick",
      label: "Suggested Favorite Films",
      render: (row) => {
        const mList: number[] = Array.isArray(row.movies) && row.movies.length > 0
          ? row.movies
          : (row.tmdbId ? [Number(row.tmdbId)] : []);

        return (
          <div className="space-y-1">
            {mList.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No films assigned</span>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-w-xs">
                {mList.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/5 dark:bg-white/10 text-[var(--admin-text)] border border-black/5 dark:border-white/10"
                  >
                    <Film size={11} className="text-[var(--admin-accent)] shrink-0" />
                    <span className="truncate max-w-[130px]">{getMovieLabel(id)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "note",
      label: "Personal Note / Review",
      render: (row) => (
        <div className="text-xs text-[var(--admin-text-muted)] line-clamp-2 max-w-xs">
          “{row.note || row.description || "No note provided."}”
        </div>
      ),
    },
    {
      id: "is_published",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
            row.is_published !== false
              ? "bg-[var(--admin-success-bg)] text-[var(--admin-success)]"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {row.is_published !== false ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition"
            title="Edit Developer Pick"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => handleOpenDelete(row, e)}
            className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer transition"
            title="Delete Developer Pick"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Staff &amp; Dev Team Picks</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Manage developer team members and assign 1 or multiple TMDB suggested films displayed on the public Staff Picks page.
          </p>
        </div>
        <button
          onClick={() => handleOpenEdit()}
          className="admin-btn admin-btn-primary h-10 px-5 flex items-center gap-1.5 cursor-pointer text-xs font-semibold tracking-wider shrink-0 select-none"
        >
          <Plus size={16} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-[var(--admin-text-muted)]">
          <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
          <span className="text-xs uppercase font-bold tracking-wider">Loading team curations...</span>
        </div>
      ) : (
        <DataTable
          data={staffMembers}
          columns={columns}
          searchPlaceholder="Search team members or picks..."
          searchKey="name"
          onRowClick={handleOpenEdit}
        />
      )}

      {/* Edit Developer Pick Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={activeItem ? `Edit Developer Roster: ${activeItem.name || activeItem.title}` : "Add Developer Team Member"}
      >
        <form onSubmit={handleSaveSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <InputField
                label="Developer Name"
                placeholder="e.g. Tim Bradford"
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                required
              />
            </div>
            <InputField
              label="Avatar Initials"
              placeholder="e.g. TB"
              value={formValues.initial}
              onChange={(e) => setFormValues({ ...formValues, initial: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Developer / Team Role"
              placeholder="e.g. Founder & Lead Developer"
              value={formValues.role}
              onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
              required
            />
            <SelectField
              label="Status"
              value={formValues.is_published ? "true" : "false"}
              onChange={(e) => setFormValues({ ...formValues, is_published: e.target.value === "true" })}
              options={[
                { value: "true", label: "Published (Visible on site)" },
                { value: "false", label: "Draft (Hidden)" },
              ]}
            />
          </div>

          {/* Assigned Movies Section (Multiple Films per Staff Member) */}
          <div className="space-y-3 p-4 rounded-xl border border-[var(--admin-border)] bg-black/5 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">
                Assigned TMDB Suggested Films ({formValues.movies.length})
              </label>
              <span className="text-[11px] text-[var(--admin-text-muted)] font-mono">
                Staff can suggest 1 or multiple films
              </span>
            </div>

            {/* List of currently assigned movies */}
            {formValues.movies.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {formValues.movies.map((id) => (
                  <div
                    key={id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-[var(--admin-text)] border border-[var(--admin-border)] shadow-sm"
                  >
                    <Film size={13} className="text-[var(--admin-accent)] shrink-0" />
                    <span>{getMovieLabel(id)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMovie(id)}
                      className="ml-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 p-0.5 rounded cursor-pointer transition"
                      title="Remove film"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic py-1">
                No films assigned yet. Select a movie below to add to this developer's picks.
              </div>
            )}

            {/* Add movie controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <select
                  value={selectedMovieIdInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedMovieIdInput(val);
                    if (val) handleAddMovie(Number(val));
                  }}
                  className="admin-input w-full text-xs"
                >
                  <option value="">+ Select from cached TMDB movies...</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.release_date?.split("-")[0] || "N/A"}) — ID: {m.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Or enter TMDB ID..."
                  value={customTmdbInput}
                  onChange={(e) => setCustomTmdbInput(e.target.value)}
                  className="admin-input flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customTmdbInput) handleAddMovie(Number(customTmdbInput));
                  }}
                  className="admin-btn admin-btn-secondary text-xs px-3 py-1 cursor-pointer shrink-0"
                >
                  Add ID
                </button>
              </div>
            </div>
          </div>

          <TextareaField
            label="Personal Curation Note / Review"
            placeholder="Share why these films inspire your development & craft..."
            value={formValues.note}
            onChange={(e) => setFormValues({ ...formValues, note: e.target.value })}
            required
          />

          {/* Dialog actions */}
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
              Save Dev Team Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Developer Team Member"
        message={`Are you sure you want to remove "${activeItem?.name || activeItem?.title}" from the Staff Picks roster?`}
        confirmLabel="Remove Member"
      />
    </div>
  );
}
