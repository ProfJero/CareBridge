import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/config";

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

/** Browser: persistent session. Server (SSR): stateless, anonymous reads only. */
export function sb(): SupabaseClient {
  if (typeof window === "undefined") {
    serverClient ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    return serverClient;
  }
  browserClient ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "sambee.auth" },
  });
  return browserClient;
}

export function errText(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error && "message" in error) {
    const message = String((error as { message: unknown }).message);
    return message || fallback;
  }
  return fallback;
}

/** Throws the Supabase error so react-query sees it. */
export function must<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw new Error(errText(result.error));
  return result.data;
}
