"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, User } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import "./header.css";

export interface HeaderUser {
  name: string;
  initial: string;
  status?: string;
}

interface SearchHit {
  id: number;
  title: string;
  year: string;
  poster: string;
  rating: number | null;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/kids", label: "Kids" },
  { href: "/watch-with-someone", label: "Watch With Someone" },
  { href: "/seasons", label: "Seasons" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/guillaume", label: "Guillaume" },
];

export default function HeaderClient({ user }: { user: HeaderUser | null }) {
  const router = useRouter();
  const logoutFormRef = useRef<HTMLFormElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isAuthenticated = user !== null;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setResults([]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) closeSearch();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  // Focus the search field when the overlay opens.
  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  // Debounced live search against the TMDb proxy.
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.warn("Header search fetch error", e);
        }
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleResultClick = (id: number) => {
    closeSearch();
    router.push(`/movie/${id}`);
  };

  const goToSearchPage = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const q = searchQuery.trim();
      if (!q) return;
      closeSearch();
      router.push(`/search?q=${encodeURIComponent(q)}`);
    },
    [searchQuery, router, closeSearch]
  );

  return (
    <>
      {/* Suspended User Warning Banner */}
      {user?.status === "suspended" && (
        <div className="w-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-md relative z-[1000] sticky top-0">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-extrabold">ACCOUNT SUSPENDED</span>
          <span>⚠️ Your account has been suspended by an administrator. Access to features is restricted.</span>
        </div>
      )}

      <header className={`site-header ${isScrolled ? "scrolled" : ""}`}>
        <Link href="/" className="brand">
          <span className="what2">What2</span>
          <span className="watch-number">Watch</span>
        </Link>

        <nav>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-a">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="search-container">
            <button
              className="search-icon"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
              suppressHydrationWarning
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
          </div>

          <ThemeToggle />

          <div className="profile-section" ref={profileRef}>
            <button
              className="profile-trigger"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              aria-label="Account menu"
              suppressHydrationWarning
            >
              {!isAuthenticated ? (
                <User className="icon-guest" size={18} strokeWidth={1.5} />
              ) : (
                <span className={`avatar-user ${user.status === "suspended" ? "ring-2 ring-red-500" : ""}`}>{user.initial}</span>
              )}
            </button>

            <div className={`profile-dropdown ${isProfileOpen ? "open" : ""}`} role="menu">
              {!isAuthenticated ? (
                <div className="dropdown-guest">
                  <Link href="/login" className="dropdown-item" role="menuitem">
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="dropdown-item dropdown-item-primary"
                    role="menuitem"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="dropdown-user">
                  {user.status === "suspended" && (
                    <div className="px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Status</span>
                      <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[9px]">SUSPENDED</span>
                    </div>
                  )}
                  <Link href="/dashboard" className="dropdown-item" role="menuitem">
                    Dashboard
                  </Link>
                  <Link href="/watchlist" className="dropdown-item" role="menuitem">
                    Watchlist
                  </Link>
                  <Link href="/favorites" className="dropdown-item" role="menuitem">
                    Favorites
                  </Link>
                  <Link href="/profile" className="dropdown-item" role="menuitem">
                    My Profile
                  </Link>
                  <Link href="/settings" className="dropdown-item" role="menuitem">
                    Settings
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="dropdown-item dropdown-item-exit w-full text-left cursor-pointer"
                    role="menuitem"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            className={`hamburger-btn ${isMobileMenuOpen ? "active" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            suppressHydrationWarning
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Search Overlay */}
      <div className={`search-overlay ${isSearchOpen ? "active" : ""}`}>
        <button
          className="search-close-overlay"
          onClick={closeSearch}
          aria-label="Close search"
          suppressHydrationWarning
        >
          ✕
        </button>
        <div className="search-overlay-inner">
          <form className="search-input-wrapper" onSubmit={goToSearchPage}>
            <input
              ref={searchInputRef}
              type="text"
              className="search-overlay-input"
              placeholder="Search films, directors, moods…"
              autoComplete="off"
              value={searchQuery}
              suppressHydrationWarning
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim().length < 2) {
                  setResults([]);
                  setSearching(false);
                }
              }}
            />
            <button
              className="search-submit-btn"
              type="submit"
              aria-label="Search"
              suppressHydrationWarning
            >
              →
            </button>
          </form>
          <div className="search-results-overlay">
            {searching && <p className="search-hint">Searching…</p>}
            {!searching && searchQuery.trim().length >= 2 && results.length === 0 && (
              <p className="search-hint">No films found for “{searchQuery}”.</p>
            )}
            {results.map((hit) => (
              <button key={hit.id} className="search-hit" onClick={() => handleResultClick(hit.id)}>
                <Image
                  src={hit.poster}
                  alt=""
                  width={46}
                  height={69}
                  className="search-hit-poster"
                />
                <span className="search-hit-body">
                  <span className="search-hit-title">{hit.title}</span>
                  <span className="search-hit-meta">
                    {hit.year}
                    {hit.rating ? ` · ★ ${hit.rating}` : ""}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-menu-top">
          <div className="mobile-menu-brand">What2Watch</div>
          <button
            className="mobile-menu-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            suppressHydrationWarning
          >
            ✕
          </button>
        </div>

        <div className="mobile-menu-links">
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-link-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="mobile-link-text">{l.label}</span>
            </Link>
          ))}
        </div>

        {!isAuthenticated ? (
          <div className="mobile-auth-guest">
            <h3>Join What2Watch</h3>
            <p>
              Create an account to save your watchlist, receive AI-powered recommendations,
              rate movies, and sync your preferences.
            </p>
            <Link
              href="/register"
              className="mobile-auth-primary text-center block"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
            <div className="mobile-auth-small">
              Already have an account?{" "}
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                Log In
              </Link>
            </div>
          </div>
        ) : (
          <div className="mobile-auth-user">
            <Link
              href="/dashboard"
              className="mobile-account-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/watchlist"
              className="mobile-account-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Watchlist
            </Link>
            <Link
              href="/settings"
              className="mobile-account-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <button
              type="button"
              className="mobile-account-link w-full text-left cursor-pointer"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowLogoutConfirm(true);
              }}
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Hidden Sign Out Form */}
      <form ref={logoutFormRef} action={signOutAction} className="hidden" />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-[var(--color-bg,#F0EBE0)] text-[var(--color-text,#1A1A1A)] border border-[var(--color-border,rgba(0,0,0,0.1))] rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10 space-y-4 font-sans">
            <h3 className="text-lg font-bold tracking-tight text-[var(--color-text)]">
              Confirm Log Out
            </h3>
            <p className="text-sm text-[var(--color-text-muted,#666)] leading-relaxed">
              Are you sure you want to log out of your What2Watch account?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold border border-[var(--color-border,rgba(0,0,0,0.15))] hover:bg-black/5 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logoutFormRef.current?.requestSubmit();
                }}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[var(--color-brand,#FF4D2D)] hover:opacity-90 cursor-pointer shadow-sm transition uppercase tracking-wider"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
