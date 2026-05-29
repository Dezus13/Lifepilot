import { createClient } from "@supabase/supabase-js";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SupabaseCaseRow = {
  id: string;
  title: string | null;
  category: string | null;
  source_text: string;
  summary: string | null;
  risk_level: string | null;
  priority_level: string | null;
  status: string | null;
  deadline_status: string | null;
  action_plan: Json | null;
  analysis: Json | null;
  created_at: string | null;
  updated_at: string | null;
};

export type LifePilotDatabase = {
  public: {
    Tables: {
      cases: {
        Row: SupabaseCaseRow;
        Insert: Partial<SupabaseCaseRow> & Pick<SupabaseCaseRow, "source_text">;
        Update: Partial<SupabaseCaseRow>;
        Relationships: [];
      };
    };
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
