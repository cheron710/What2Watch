// src/app/admin/staff-picks/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { getStaffPicks, saveStaffPick, deleteStaffPick, getMovies, searchTmdbMovies } from "@/services/adminService";
import DataTable, { Column } from "@/components/admin/tables/DataTable";
import { useToast } from "@/components/admin/layout/AdminLayout";
import { InputField, TextareaField, SelectField } from "@/components/admin/forms/FormFields";
import { Modal, ConfirmDialog } from "@/components/admin/dialogs/Dialogs";
import { Plus, Edit2, Loader2, Trash2, Film, X, Search, Upload, Image as ImageIcon } from "lucide-react";

export default function StaffPicksAdminPage() {
  const { showToast } = useToast();

  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [cachedMovies, setCachedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);

  // Form state
  const [formValues, setFormValues] = useState<{
    id: string;
    name: string;
    role: string;
    initial: string;
    avatar_url: string;
    note: string;
    pick: string;
    movies: number[];
    is_published: boolean;
  }>({
    id: "",
    name: "",
    role: "",
    initial: "",
    avatar_url: "",
    note: "",
    pick: "",
    movies: [],
    is_published: true,
  });

  // TMDB Live Search state
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState("");
  const [tmdbSearchResults, setTmdbSearchResults] = useState<any[]>([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [tmdbMovieMap, setTmdbMovieMap] = useState<Record<number, any>>({});

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [members, movs] = await Promise.all([getStaffPicks(), getMovies()]);
      setStaffMembers(members);
      setCachedMovies(movs);

      // Populate local movie map for quick title/poster lookups
      const map: Record<number, any> = {};
      movs.forEach((m) => {
        map[Number(m.id)] = m;
      });
      setTmdbMovieMap((prev) => ({ ...map, ...prev }));
    } catch (e) {
      showToast("Failed to fetch dev team curation data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Debounced TMDB Live Search
  useEffect(() => {
    if (!tmdbSearchQuery.trim()) {
      setTmdbSearchResults([]);
      setTmdbSearching(false);
      return;
    }

    setTmdbSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchTmdbMovies(tmdbSearchQuery.trim());
        setTmdbSearchResults(results);
      } catch (err) {
        setTmdbSearchResults([]);
      } finally {
        setTmdbSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [tmdbSearchQuery]);

  const handleOpenEdit = (item?: any) => {
    setTmdbSearchQuery("");
    setTmdbSearchResults([]);
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
        avatar_url: item.avatar_url || item.avatar || item.featured_banner_url || "",
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
        avatar_url: "",
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

  // Add movie selected from TMDB Search
  const handleSelectTmdbMovie = (movie: any) => {
    const movieId = Number(movie.id);
    if (formValues.movies.includes(movieId)) {
      showToast(`"${movie.title}" is already in this developer's picks.`, "warning");
      return;
    }

    // Cache details for badge display
    setTmdbMovieMap((prev) => ({
      ...prev,
      [movieId]: {
        id: movieId,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
      },
    }));

    setFormValues((prev) => ({
      ...prev,
      movies: [...prev.movies, movieId],
    }));

    setTmdbSearchQuery("");
    setTmdbSearchResults([]);
    showToast(`Added "${movie.title}" to assigned picks.`, "info");
  };

  const handleRemoveMovie = (idToRemove: number) => {
    setFormValues((prev) => ({
      ...prev,
      movies: prev.movies.filter((id) => id !== idToRemove),
    }));
  };

  // Image Upload Handler (File -> Base64)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormValues((prev) => ({ ...prev, avatar_url: result }));
        showToast("Profile image uploaded successfully.", "success");
      }
    };
    reader.readAsDataURL(file);
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
        avatar_url: formValues.avatar_url.trim(),
        note: formValues.note.trim(),
        description: formValues.note.trim(),
        pick: formValues.pick.trim(),
        tmdbId: formValues.movies[0] || null,
        movies: formValues.movies,
        is_published: formValues.is_published,
      };

      await saveStaffPick(payload);
      showToast(`Saved dev team roster for "${formValues.name}".`, "success");
      setEditOpen(false);
      await loadData();
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

  // Helper to format TMDB poster image URL
  const getPosterUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://image.tmdb.org/t/p/w92${path}`;
  };

  // Helper to get movie title from cache or local map
  const getMovieData = (tmdbId: number) => {
    return tmdbMovieMap[Number(tmdbId)] || cachedMovies.find((m) => Number(m.id) === Number(tmdbId)) || null;
  };

  // Columns definition for DataTable
  const columns: Column<any>[] = [
    {
      id: "name",
      label: "Developer / Team Member",
      sortable: true,
      render: (row) => {
        const avatarSrc = row.avatar_url || row.avatar || row.featured_banner_url || "";
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--admin-accent,#FF4D2D)] text-white font-extrabold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
              {avatarSrc ? (
                <img src={avatarSrc} alt={row.name || row.title} className="w-full h-full object-cover" />
              ) : (
                row.initial || (row.name || row.title || "D").slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="font-bold text-[var(--admin-text)]">{row.name || row.title}</div>
              <div className="text-[10px] text-[var(--admin-text-muted)] font-mono uppercase tracking-wider">
                {row.role || "Developer"}
              </div>
            </div>
          </div>
        );
      },
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
                {mList.map((id) => {
                  const mData = getMovieData(id);
                  const title = mData?.title || `TMDB ID: ${id}`;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/5 dark:bg-white/10 text-[var(--admin-text)] border border-black/5 dark:border-white/10"
                    >
                      <Film size={11} className="text-[var(--admin-accent)] shrink-0" />
                      <span className="truncate max-w-[130px]">{title}</span>
                    </span>
                  );
                })}
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
            title="Edit Developer Roster"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => handleOpenDelete(row, e)}
            className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer transition"
            title="Delete Developer"
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
            Manage developer team members, upload profile avatars, and assign suggested films directly from the live TMDB database.
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
          {/* Avatar Image Upload Section */}
          <div className="p-4 rounded-xl border border-[var(--admin-border)] bg-black/5 dark:bg-white/5 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">
              Developer Profile Photo / Avatar
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--admin-accent,#FF4D2D)] text-white font-black text-xl flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/20 shadow-md">
                {formValues.avatar_url ? (
                  <img src={formValues.avatar_url} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  formValues.initial || (formValues.name || "D").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="admin-btn admin-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={13} />
                    <span>Upload Photo</span>
                  </button>
                  {formValues.avatar_url && (
                    <button
                      type="button"
                      onClick={() => setFormValues((prev) => ({ ...prev, avatar_url: "" }))}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Or paste image URL (https://...)"
                  value={formValues.avatar_url}
                  onChange={(e) => setFormValues({ ...formValues, avatar_url: e.target.value })}
                  className="admin-input text-xs w-full"
                />
              </div>
            </div>
          </div>

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

          {/* TMDB Movie Search Section (The ONLY way to add movies) */}
          <div className="space-y-3 p-4 rounded-xl border border-[var(--admin-border)] bg-black/5 dark:bg-white/5 relative">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">
                Assigned TMDB Suggested Films ({formValues.movies.length})
              </label>
              <span className="text-[11px] text-[var(--admin-text-muted)] font-mono">
                Search &amp; select from TMDB
              </span>
            </div>

            {/* List of currently assigned movies */}
            {formValues.movies.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {formValues.movies.map((id) => {
                  const mData = getMovieData(id);
                  const title = mData?.title || `TMDB ID: ${id}`;
                  return (
                    <div
                      key={id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-[var(--admin-text)] border border-[var(--admin-border)] shadow-sm"
                    >
                      <Film size={13} className="text-[var(--admin-accent)] shrink-0" />
                      <span>{title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMovie(id)}
                        className="ml-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 p-0.5 rounded cursor-pointer transition"
                        title="Remove film"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic py-1">
                No films assigned yet. Search TMDB database below to add suggested movies.
              </div>
            )}

            {/* Live TMDB Search Input */}
            <div className="relative pt-2">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-[var(--admin-text-muted)] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Type movie title to search TMDB database (e.g. Oppenheimer, Interstellar)..."
                  value={tmdbSearchQuery}
                  onChange={(e) => setTmdbSearchQuery(e.target.value)}
                  className="admin-input pl-9 pr-8 w-full text-xs"
                />
                {tmdbSearching && (
                  <Loader2 size={14} className="absolute right-3 animate-spin text-[var(--admin-accent)]" />
                )}
                {tmdbSearchQuery && !tmdbSearching && (
                  <button
                    type="button"
                    onClick={() => {
                      setTmdbSearchQuery("");
                      setTmdbSearchResults([]);
                    }}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown List */}
              {tmdbSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-[var(--admin-border)] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-black/5 dark:divide-white/5 animate-fadeIn">
                  {tmdbSearchResults.map((m) => {
                    const poster = getPosterUrl(m.poster_path);
                    const year = m.release_date ? m.release_date.split("-")[0] : "N/A";
                    const isAdded = formValues.movies.includes(Number(m.id));

                    return (
                      <div
                        key={m.id}
                        onClick={() => !isAdded && handleSelectTmdbMovie(m)}
                        className={`flex items-center gap-3 p-2.5 transition ${
                          isAdded
                            ? "opacity-50 cursor-not-allowed bg-black/5 dark:bg-white/5"
                            : "hover:bg-[var(--admin-accent)]/10 cursor-pointer"
                        }`}
                      >
                        <div className="w-8 h-12 bg-black/20 rounded overflow-hidden shrink-0 flex items-center justify-center">
                          {poster ? (
                            <img src={poster} alt={m.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={14} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-[var(--admin-text)] truncate">{m.title}</div>
                          <div className="text-[10px] text-[var(--admin-text-muted)] font-mono">
                            Release: {year} • TMDB ID: {m.id} • Rating: ★ {m.vote_average ? Number(m.vote_average).toFixed(1) : "N/A"}
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-1 rounded bg-[var(--admin-accent)] text-white shrink-0">
                          {isAdded ? "Added" : "+ Add"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
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
