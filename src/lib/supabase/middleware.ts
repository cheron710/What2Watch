// src/lib/supabase/middleware.ts
// Called from root middleware.ts to refresh Supabase Auth sessions
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./env";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const mockSession = request.cookies.get("w2w-session-mock");
  if (mockSession) {
    const { pathname } = request.nextUrl;
    const isAdminRoute = (pathname === "/admin" || pathname.startsWith("/admin/")) && pathname !== "/admin/login";
    
    if (isAdminRoute) {
      try {
        const parsed = JSON.parse(decodeURIComponent(mockSession.value));
        if (parsed.role !== "admin") {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      } catch {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
    }
    return supabaseResponse;
  }

  // Without configured credentials there is no session to refresh.
  // Still, protect admin routes using our local session cookie if mock mode is active.
  if (!isSupabaseConfigured) {
    const { pathname } = request.nextUrl;
    const isAdminRoute = (pathname === "/admin" || pathname.startsWith("/admin/")) && pathname !== "/admin/login";
    
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  return refreshSession(request, supabaseResponse);
}

async function refreshSession(request: NextRequest, initialResponse: NextResponse) {
  let supabaseResponse = initialResponse;

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = (pathname === "/admin" || pathname.startsWith("/admin/")) && pathname !== "/admin/login";

  // Protect admin routes
  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    let role = "user";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile && profile.role) {
        role = profile.role;
      }
    } catch (err) {
      console.warn("Resilient middleware profile lookup failed:", err);
    }

    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Protect authenticated areas — bounce guests to /login with a return path.
  const PROTECTED = ["/dashboard", "/watchlist", "/favorites", "/profile", "/settings", "/history"];
  if (!user && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
