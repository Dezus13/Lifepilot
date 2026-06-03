import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { LifePilotDatabase } from "./supabase-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isServerSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export async function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<LifePilotDatabase>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, options, value }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components не могут менять cookies. Server Actions могут.
          }
        }
      }
    }
  );
}
