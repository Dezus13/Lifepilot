import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./supabase-server";
import type { SupabaseAdminUserRow } from "./supabase-client";

type AdminUserQueryRow = Pick<SupabaseAdminUserRow, "email" | "id" | "role" | "status">;

export type AdminAccess =
  | {
      adminId: string;
      email: string;
      status: "authorized";
    }
  | {
      status: "config-error" | "forbidden" | "unauthenticated";
    };

export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { status: "config-error" };
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return { status: "unauthenticated" };
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email, role, status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .eq("role", "admin")
    .maybeSingle()
    .overrideTypes<AdminUserQueryRow, { merge: false }>();

  if (adminError || !adminUser || adminUser.email.toLowerCase() !== user.email.toLowerCase()) {
    return { status: "forbidden" };
  }

  return {
    adminId: adminUser.id,
    email: user.email,
    status: "authorized"
  };
}

export async function requireAdminAccess() {
  const access = await getAdminAccess();

  if (access.status === "unauthenticated") {
    redirect("/admin/login");
  }

  return access;
}
