"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../../lib/supabase-server";

function getSafeLoginRedirect(error: "config" | "invalid" | "missing") {
  return `/admin/login?error=${error}`;
}

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(getSafeLoginRedirect("missing"));
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect(getSafeLoginRedirect("config"));
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(getSafeLoginRedirect("invalid"));
  }

  redirect("/admin");
}
