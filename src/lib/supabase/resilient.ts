// src/lib/supabase/resilient.ts
// Utility to wrap Supabase network calls in a fast timeout and circuit-breaker.
// Prevents unreachable or dead Supabase endpoints from blocking the application for 7+ seconds.

let isSupabaseReachable = true;
let lastCheckTime = 0;
const RECHECK_INTERVAL_MS = 60000; // Retry connection after 60 seconds

export function markSupabaseUnreachable() {
  isSupabaseReachable = false;
  lastCheckTime = Date.now();
}

export function resetSupabaseReachability() {
  isSupabaseReachable = true;
  lastCheckTime = 0;
}

export function checkIsSupabaseReachable(): boolean {
  if (!isSupabaseReachable) {
    if (Date.now() - lastCheckTime > RECHECK_INTERVAL_MS) {
      // Allow re-testing connection after recheck interval
      isSupabaseReachable = true;
      return true;
    }
    return false;
  }
  return true;
}

/**
 * Executes a Supabase query with a strict timeout and circuit-breaker mechanism.
 * If Supabase is known to be unreachable or times out, it instantly falls back to fallbackFn.
 */
export async function withSupabaseTimeout<T>(
  queryFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>,
  timeoutMs: number = 400
): Promise<T> {
  if (!checkIsSupabaseReachable()) {
    return Promise.resolve(fallbackFn());
  }

  let timer: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("Supabase request timed out"));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([queryFn(), timeoutPromise]);
    if (timer) clearTimeout(timer);
    return result;
  } catch (err: any) {
    if (timer) clearTimeout(timer);
    console.warn(`[Supabase Resilience] Query bypassed (${err?.message || err}). Falling back to local data.`);
    markSupabaseUnreachable();
    return Promise.resolve(fallbackFn());
  }
}
