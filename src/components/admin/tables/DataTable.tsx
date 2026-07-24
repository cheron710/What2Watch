// src/components/admin/tables/DataTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Download,
  Trash2,
  SlidersHorizontal,
  Search,
  CheckSquare,
  Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Column<T> {
  id: string;
  label: string;
  sortable?: boolean;
  filterOptions?: string[];
  render?: (row: T) => React.ReactNode;
}

interface BulkAction<T> {
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (selectedRows: T[]) => void;
  variant?: "danger" | "primary" | "secondary";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  searchKeys?: (keyof T)[];
  bulkActions?: BulkAction<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends { id: any }>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchKey,
  searchKeys,
  bulkActions = [],
  onRowClick,
  emptyMessage = "No records found."
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map((c) => c.id));
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset selected rows when data size changes
  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [data]);

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId && prev.length > 2) // prevent hiding all columns
        : [...prev, columnId]
    );
  };

  // Checkbox interactions
  const handleSelectAll = (checked: boolean, pageRows: T[]) => {
    const next = new Set(selectedIds);
    pageRows.forEach((row) => {
      if (checked) {
        next.add(row.id);
      } else {
        next.delete(row.id);
      }
    });
    setSelectedIds(next);
  };

  const handleSelectRow = (id: any, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search query match
    if (searchQuery && (searchKey || searchKeys)) {
      const keysToSearch = searchKeys ? searchKeys : (searchKey ? [searchKey] : []);
      result = result.filter((row) => {
        return keysToSearch.some((key) => {
          const val = row[key];
          if (typeof val === "string") {
            return val.toLowerCase().includes(searchQuery.toLowerCase());
          }
          if (typeof val === "number") {
            return val.toString().includes(searchQuery);
          }
          return false;
        });
      });
    }

    // Dropdown filters
    Object.entries(filters).forEach(([colId, filterVal]) => {
      if (filterVal) {
        result = result.filter((row) => {
          const val = (row as any)[colId];
          if (Array.isArray(val)) {
            return val.some((item) => String(item).toLowerCase() === filterVal.toLowerCase());
          }
          return String(val).toLowerCase() === filterVal.toLowerCase();
        });
      }
    });

    // Sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortColumn];
        const bVal = (b as any)[sortColumn];

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortDirection === "asc"
          ? (aVal as any) - (bVal as any)
          : (bVal as any) - (aVal as any);
      });
    }

    return result;
  }, [data, searchQuery, searchKey, filters, sortColumn, sortDirection]);

  // Page index calculations
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const currentPagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const allPageRowsSelected = useMemo(() => {
    if (currentPagedRows.length === 0) return false;
    return currentPagedRows.every((row) => selectedIds.has(row.id));
  }, [currentPagedRows, selectedIds]);

  const selectedRowsList = useMemo(() => {
    return data.filter((row) => selectedIds.has(row.id));
  }, [data, selectedIds]);

  // Export to CSV helper
  const exportToCSV = () => {
    const csvHeaders = columns
      .filter((col) => visibleColumns.includes(col.id))
      .map((col) => `"${col.label.replace(/"/g, '""')}"`)
      .join(",");

    const csvRows = filteredData.map((row) => {
      return columns
        .filter((col) => visibleColumns.includes(col.id))
        .map((col) => {
          const val = (row as any)[col.id];
          const text = Array.isArray(val)
            ? val.join("; ")
            : typeof val === "object"
            ? JSON.stringify(val)
            : String(val ?? "");
          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [csvHeaders, ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `w2w_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Table controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {(searchKey || searchKeys) && (
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--admin-text-muted)] pointer-events-none">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="admin-input pl-9 w-full"
              />
            </div>
          )}

          {/* Filter dropdowns */}
          {columns.map((col) => {
            if (!col.filterOptions) return null;
            return (
              <select
                key={col.id}
                value={filters[col.id] || ""}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, [col.id]: e.target.value }));
                  setCurrentPage(1);
                }}
                className="admin-input max-w-[160px] py-1.5 px-3 h-10 shrink-0"
              >
                <option value="">All {col.label}</option>
                {col.filterOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            );
          })}
        </div>

        {/* Global Toolbar Options */}
        <div className="flex items-center justify-end gap-2">
          {/* Column Toggle Options button */}
          <div className="relative">
            <button
              onClick={() => setShowColumnToggle(!showColumnToggle)}
              className="admin-btn admin-btn-secondary p-2.5 h-10 flex items-center justify-center shrink-0 cursor-pointer"
              title="Toggle column display"
            >
              <SlidersHorizontal size={16} />
            </button>

            <AnimatePresence>
              {showColumnToggle && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowColumnToggle(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] shadow-xl rounded-lg p-3 z-20 space-y-2 select-none"
                  >
                    <span className="admin-label block pb-1 border-b border-[var(--admin-border)]">Display Columns</span>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 admin-scrollbar">
                      {columns.map((col) => (
                        <label key={col.id} className="flex items-center gap-2 text-xs cursor-pointer text-[var(--admin-text)] py-1 hover:bg-black/5 dark:hover:bg-white/5 px-1.5 rounded transition">
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(col.id)}
                            onChange={() => toggleColumn(col.id)}
                            className="rounded border-[var(--admin-border-strong)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)] cursor-pointer"
                          />
                          <span>{col.label}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Export to CSV */}
          <button
            onClick={exportToCSV}
            className="admin-btn admin-btn-secondary h-10 px-4 text-xs font-semibold tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk actions banner */}
      <AnimatePresence>
        {selectedIds.size > 0 && bulkActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-3 px-4 bg-[var(--admin-accent)] text-white dark:text-black rounded-lg text-xs"
          >
            <div className="flex items-center gap-2 font-medium">
              <span>{selectedIds.size} row(s) selected</span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="underline hover:no-underline ml-2 cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              {bulkActions.map((action, idx) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      action.onClick(selectedRowsList);
                      setSelectedIds(new Set());
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] cursor-pointer shadow-sm border transition bg-white text-black hover:bg-gray-100 border-none`}
                  >
                    {ActionIcon && <ActionIcon size={12} />}
                    {action.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table grid */}
      <div className="border border-[var(--admin-border)] rounded-lg bg-[var(--admin-card-bg)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--admin-border-strong)] bg-black/2 dark:bg-white/1 text-xs select-none">
                {/* Select All Checkbox */}
                {bulkActions.length > 0 && (
                  <th className="p-4 w-12 text-center">
                    <button
                      onClick={() => handleSelectAll(!allPageRowsSelected, currentPagedRows)}
                      className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] cursor-pointer"
                    >
                      {allPageRowsSelected ? (
                        <CheckSquare size={16} className="text-[var(--admin-accent)]" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                )}
                {columns
                  .filter((col) => visibleColumns.includes(col.id))
                  .map((col) => (
                    <th
                      key={col.id}
                      className={`p-4 font-semibold uppercase tracking-wider text-[10px] text-[var(--admin-text-muted)] ${
                        col.sortable ? "cursor-pointer hover:text-[var(--admin-text)] transition" : ""
                      }`}
                      onClick={() => col.sortable && handleSort(col.id)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        {col.sortable && sortColumn === col.id && (
                          sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        )}
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {currentPagedRows.length > 0 ? (
                currentPagedRows.map((row, rowIdx) => {
                  const selected = selectedIds.has(row.id);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => onRowClick?.(row)}
                      className={`text-sm hover:bg-black/2 dark:hover:bg-white/2 transition duration-150 cursor-pointer ${
                        selected ? "bg-[var(--admin-accent)]/5" : ""
                      }`}
                    >
                      {/* Row selection check box */}
                      {bulkActions.length > 0 && (
                        <td
                          className="p-4 w-12 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleSelectRow(row.id, !selected)}
                            className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] cursor-pointer"
                          >
                            {selected ? (
                              <CheckSquare size={16} className="text-[var(--admin-accent)]" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                      )}
                      {columns
                        .filter((col) => visibleColumns.includes(col.id))
                        .map((col) => {
                          const cellVal = (row as any)[col.id];
                          return (
                            <td key={col.id} className="p-4 align-middle text-[var(--admin-text)] whitespace-nowrap">
                              {col.render ? (
                                col.render(row)
                              ) : (
                                <span className="truncate max-w-[240px] block">
                                  {cellVal === null || cellVal === undefined
                                    ? "-"
                                    : Array.isArray(cellVal)
                                    ? cellVal.join(", ")
                                    : String(cellVal)}
                                </span>
                              )}
                            </td>
                          );
                        })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.filter((c) => visibleColumns.includes(c.id)).length + (bulkActions.length > 0 ? 1 : 0)}
                    className="p-12 text-center text-sm text-[var(--admin-text-muted)]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-[var(--admin-border)] bg-black/2 dark:bg-white/1 text-xs select-none">
          <div className="flex items-center gap-4 text-[var(--admin-text-muted)]">
            <span>
              Showing {filteredData.length ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
            </span>
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="admin-input py-1 px-2 h-7 w-16"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-[var(--admin-border-strong)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition shrink-0 cursor-pointer"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-[var(--admin-border-strong)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition shrink-0 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="px-4 py-1 border border-[var(--admin-border-strong)] rounded-md font-semibold bg-[var(--admin-card-bg)] shrink-0">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-[var(--admin-border-strong)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition shrink-0 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-[var(--admin-border-strong)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition shrink-0 cursor-pointer"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
