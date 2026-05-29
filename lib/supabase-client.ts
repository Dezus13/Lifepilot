import { createClient } from "@supabase/supabase-js";

export type LifePilotDatabase = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

export type LifePilotSupabaseClient = ReturnType<
  typeof createClient<LifePilotDatabase, "public", "public">
>;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: LifePilotSupabaseClient | null = null;

function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return {
    anonKey: supabaseAnonKey,
    url: supabaseUrl
  };
}

function showDevelopmentConfigError() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  throw new Error(
    "Supabase не настроен для LifePilot. Проверьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в локальном окружении."
  );
}

export function isSupabaseConfigured() {
  return hasSupabaseConfig();
}

export function getSupabaseClient(): LifePilotSupabaseClient | null {
  const config = getSupabaseConfig();

  if (!config) {
    showDevelopmentConfigError();
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient<LifePilotDatabase, "public", "public">(
      config.url,
      config.anonKey
    );
  }

  return supabaseClient;
}
