// src/components/admin/layout/AdminLayout.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "../sidebar/AdminSidebar";
import AdminNavbar from "../navbar/AdminNavbar";
import { getSystemSettings } from "@/services/adminService";
import { ChevronRight, Home, Undo2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Toast interface
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  undoAction?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"], undoAction?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // default to dark editorial style
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [siteName, setSiteName] = useState("What2Watch");

  // Load Dark Mode and Settings
  useEffect(() => {
    const savedDark = localStorage.getItem("w2w_admin_dark");
    if (savedDark !== null) {
      setDarkMode(savedDark === "true");
    }
    
    getSystemSettings().then((s) => {
      if (s?.site_name) setSiteName(s.site_name);
    });
  }, []);

  // Telemetry page view tracker
  useEffect(() => {
    // Log visit in localStorage analytics telemetry
    try {
      const raw = localStorage.getItem("w2w_admin_analytics");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.stats) {
          parsed.stats.todayVisits = (parsed.stats.todayVisits || 0) + 1;
          localStorage.setItem("w2w_admin_analytics", JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn("Analytics telemetry fail", e);
    }
  }, [pathname]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("w2w_admin_dark", String(next));
  };

  const showToast = (message: string, type: Toast["type"] = "info", undoAction?: () => void) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message, undoAction };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove toast after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, idx) => {
      const href = "/" + paths.slice(0, idx + 1).join("/");
      const label = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { href, label, active: idx === paths.length - 1 };
    });
  };

  const crumbs = getBreadcrumbs();

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className={`admin-container ${darkMode ? "dark" : ""}`}>
        <div className="flex flex-col min-h-screen">
          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Navigation */}
            <AdminNavbar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              mobileDrawerOpen={mobileDrawerOpen}
              setMobileDrawerOpen={setMobileDrawerOpen}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              siteName={siteName}
            />

            {/* Horizontal Dashboard Navigation */}
            <AdminSidebar />

            {/* Breadcrumb Navigation */}
            <div className="px-6 py-4 flex items-center gap-2 border-b border-[var(--admin-border)] overflow-x-auto select-none bg-[var(--admin-card-bg)] text-xs text-[var(--admin-text-muted)]">
              <Link href="/admin/dashboard" className="hover:text-[var(--admin-text)] flex items-center gap-1 transition">
                <Home size={13} />
                <span>Admin</span>
              </Link>
              {crumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight size={12} className="shrink-0" />
                  <Link
                    href={crumb.href}
                    className={`transition hover:text-[var(--admin-text)] ${
                      crumb.active ? "text-[var(--admin-text)] font-semibold" : ""
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>

            {/* Main Content Body */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[var(--admin-bg)]">
              {children}
            </main>
          </div>
        </div>

        {/* Global Toast Panel */}
        <div className="admin-toast-container">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className={`admin-toast ${toast.type}`}
              >
                <div className="flex-1">
                  <p className="font-medium text-[var(--admin-text)]">{toast.message}</p>
                </div>
                {toast.undoAction && (
                  <button
                    onClick={() => {
                      toast.undoAction?.();
                      removeToast(toast.id);
                    }}
                    className="flex items-center gap-1 text-[var(--admin-accent)] hover:underline text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    <Undo2 size={12} />
                    Undo
                  </button>
                )}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] shrink-0 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
