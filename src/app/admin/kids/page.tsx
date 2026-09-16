// src/app/admin/kids/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getKids, saveKids, getMovies, getKidsSpotlight, saveKidsSpotlight, searchTMDb, getTMDbDetail } from "@/services/adminService";
import { tmdbImageUrl } from "@/lib/tmdb/client";
import DataTable, { Column } from "@/components/admin/tables/DataTable";
import { useToast } from "@/components/admin/layout/AdminLayout";
import { InputField, TextareaField, SelectField, TagInputField } from "@/components/admin/forms/FormFields";
import { Modal } from "@/components/admin/dialogs/Dialogs";
import { Plus, Edit2, Loader2, ListOrdered, ArrowUp, ArrowDown, Trash2, ShieldAlert, Sparkles, Search, Star } from "lucide-react";

export default function KidsPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Spotlight State
  const [spotlightIds, setSpotlightIds] = useState<number[]>([]);
  const [spotlightItems, setSpotlightItems] = useState<any[]>([]);
  const [spotlightLoading, setSpotlightLoading] = useState(false);
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingTmdb, setSearchingTmdb] = useState(false);

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

  const loadSpotlightData = async (currentIds?: number[]) => {
    setSpotlightLoading(true);
    try {
      const ids = currentIds || (await getKidsSpotlight());
      setSpotlightIds(ids);

      const items = await Promise.all(
        ids.map(async (mid) => {
          try {
            // Use server action to fetch TMDB details (getMovieDetail is server-only)
            const detail = await getTMDbDetail(mid);
            return {
              id: detail.id,
              title: detail.title,
              release_date: detail.release_date || "",
              poster_path: detail.poster_path,
              vote_average: detail.vote_average || 8.0,
              overview: detail.overview || ""
            };
          } catch (e) {
            const found = movies.find((m) => m.id === mid);
            return {
              id: mid,
              title: found ? found.title : `TMDB Movie ${mid}`,
              release_date: found?.release_date || "",
              poster_path: found?.poster_path || null,
              vote_average: found?.vote_average || 8.0,
              overview: found?.overview || ""
            };
          }
        })
      );
      setSpotlightItems(items);
    } catch (e) {
      console.error("Failed to load kids spotlight:", e);
    } finally {
      setSpotlightLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, movs] = await Promise.all([getKids(), getMovies()]);
      setCategories(list);
      setMovies(movs);
      await loadSpotlightData();
    } catch (e) {
      showToast("Failed to fetch kids categories.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchTmdb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbQuery.trim()) return;
    setSearchingTmdb(true);
    try {
      const res = await searchTMDb(tmdbQuery.trim());
      setSearchResults(res);
    } catch (err) {
      showToast("TMDB search failed.", "error");
    } finally {
      setSearchingTmdb(false);
    }
  };

  const MAX_SPOTLIGHT_MOVIES = 4;

  const handleAddSpotlight = async (movie: any) => {
    if (spotlightIds.length >= MAX_SPOTLIGHT_MOVIES) {
      showToast(`Maximum ${MAX_SPOTLIGHT_MOVIES} movies allowed in Spotlight. Remove one first.`, "warning");
      return;
    }
    if (spotlightIds.includes(movie.id)) {
      showToast(`"${movie.title}" is already in the Spotlight!`, "warning");
      return;
    }
    const nextIds = [...spotlightIds, movie.id];
    setSpotlightIds(nextIds);
    await saveKidsSpotlight(nextIds);
    showToast(`Added "${movie.title}" to Kids Spotlight. Live instantly!`, "success");
    setTmdbQuery("");
    setSearchResults([]);
    await loadSpotlightData(nextIds);
  };

  const handleRemoveSpotlight = async (movieId: number) => {
    const nextIds = spotlightIds.filter((id) => id !== movieId);
    setSpotlightIds(nextIds);
    await saveKidsSpotlight(nextIds);
    showToast("Removed movie from Kids Spotlight. Live instantly!", "success");
    await loadSpotlightData(nextIds);
  };

  const handleMoveSpotlight = async (index: number, direction: "up" | "down") => {
    const list = [...spotlightIds];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setSpotlightIds(list);
    await saveKidsSpotlight(list);
    showToast("Updated Kids Spotlight sequence.", "success");
    await loadSpotlightData(list);
  };

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

      {/* SPOTLIGHT / HIGHLIGHTS CURATION SECTION */}
      <div className="p-6 border border-[var(--admin-border)] rounded-xl bg-[var(--admin-card-bg)] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--admin-border)] pb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--admin-text)]">
              <Sparkles size={18} className="text-amber-500" />
              <span>Kids Spotlight / Highlights Manager</span>
            </h2>
            <p className="text-xs text-[var(--admin-text-muted)]">
              Curate the exact movies that rotate on the public Kids Corner spotlight banner. Add, remove, or reorder movies live!
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 self-start sm:self-auto">
            {spotlightIds.length} / {MAX_SPOTLIGHT_MOVIES} {spotlightIds.length === 1 ? "Movie" : "Movies"} in Spotlight
          </span>
        </div>

        {/* Search TMDB to add movies */}
        <div className="space-y-3">
          <form onSubmit={handleSearchTmdb} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={15} />
              <input
                type="text"
                placeholder="Search TMDB for kids movies (e.g., Toy Story, Moana, Frozen, Cars)..."
                value={tmdbQuery}
                onChange={(e) => setTmdbQuery(e.target.value)}
                className="admin-input pl-9 w-full"
              />
            </div>
            <button
              type="submit"
              disabled={searchingTmdb || !tmdbQuery.trim()}
              className="admin-btn admin-btn-primary px-5 cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
            >
              {searchingTmdb ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              <span>Search TMDB</span>
            </button>
          </form>

          {/* Search Results Dropdown / Grid */}
          {searchResults.length > 0 && (
            <div className="p-4 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-input-bg)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--admin-text-muted)]">
                  TMDB Results for &quot;{tmdbQuery}&quot;:
                </span>
                <button
                  type="button"
                  onClick={() => setSearchResults([])}
                  className="text-xs text-[var(--admin-text-muted)] hover:underline"
                >
                  Close results
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1 admin-scrollbar">
                {searchResults.map((m) => {
                  const isAdded = spotlightIds.includes(m.id);
                  const atMax = spotlightIds.length >= MAX_SPOTLIGHT_MOVIES;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-2 border border-[var(--admin-border)] rounded bg-[var(--admin-card-bg)] hover:border-[var(--admin-accent)] transition-colors"
                    >
                      {m.poster_path ? (
                        <img src={m.poster_path} alt={m.title} className="w-10 h-14 object-cover rounded shrink-0" />
                      ) : (
                        <div className="w-10 h-14 bg-black/10 dark:bg-white/10 rounded flex items-center justify-center shrink-0 text-xs">
                          🎬
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-bold text-[var(--admin-text)] truncate">{m.title}</div>
                        <div className="text-[var(--admin-text-muted)]">
                          {m.release_date?.split("-")[0] || "N/A"} · ⭐ {m.vote_average?.toFixed(1) || "7.5"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddSpotlight(m)}
                        disabled={isAdded || atMax}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer shrink-0 ${
                          isAdded || atMax
                            ? "bg-black/10 dark:bg-white/10 text-[var(--admin-text-muted)] cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                      >
                        {isAdded ? "Added" : atMax ? "Max 4" : "+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Current Spotlight Movies List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] flex items-center gap-1.5">
            <ListOrdered size={14} />
            <span>Current Spotlight Rotation ({spotlightItems.length} active)</span>
          </h3>

          {spotlightLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-[var(--admin-text-muted)] text-xs">
              <Loader2 size={16} className="animate-spin text-amber-500" />
              <span>Loading Spotlight movies...</span>
            </div>
          ) : spotlightItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {spotlightItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex flex-col border border-[var(--admin-border)] rounded-lg bg-[var(--admin-input-bg)] p-3 relative group overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      {item.poster_path ? (
                        <img
                          src={item.poster_path}
                          alt={item.title}
                          className="w-14 h-20 object-cover rounded shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded flex items-center justify-center text-xl text-white font-bold">
                          🎬
                        </div>
                      )}
                      <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shadow">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[var(--admin-text)] truncate">{item.title}</h4>
                      <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5">
                        {item.release_date?.split("-")[0] || "Release N/A"}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 mt-1">
                        <Star size={11} className="fill-amber-500" />
                        <span>{item.vote_average ? Number(item.vote_average).toFixed(1) : "8.0"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--admin-border)] pt-2.5 mt-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveSpotlight(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] disabled:opacity-30 cursor-pointer"
                        title="Move Left/Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSpotlight(idx, "down")}
                        disabled={idx === spotlightItems.length - 1}
                        className="p-1 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] disabled:opacity-30 cursor-pointer"
                        title="Move Right/Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpotlight(item.id)}
                      className="px-2 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-500/10 rounded flex items-center gap-1 cursor-pointer"
                      title="Remove from Spotlight"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[var(--admin-text-muted)] border border-dashed border-[var(--admin-border)] rounded-lg">
              No movies currently in Spotlight. Search TMDB above to add movies.
            </div>
          )}
        </div>
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
