import { redirect } from "next/navigation";
import { requireAdminAccess } from "../../lib/admin-auth";
import { logoutAdmin } from "./actions";

export default async function AdminPage() {
  const access = await requireAdminAccess();

  if (access.status === "config-error") {
    return (
      <div className="placeholder-panel">
        <h1 className="mobile-title">Администрирование</h1>
        <p>Авторизация пока не настроена. Проверьте переменные окружения Supabase.</p>
      </div>
    );
  }

  if (access.status === "forbidden") {
    return (
      <div className="placeholder-panel">
        <h1 className="mobile-title">Доступ закрыт</h1>
        <p>Текущая сессия не имеет активного доступа администратора.</p>
        <form action={logoutAdmin}>
          <button className="button primary-action" type="submit">
            Выйти
          </button>
        </form>
      </div>
    );
  }

  if (access.status !== "authorized") {
    redirect("/admin/login");
  }

  return (
    <div className="flow-page">
      <section className="flow-heading">
        <h1 className="mobile-title">Администрирование</h1>
        <p>Защищенный раздел LifePilot.</p>
      </section>

      <section className="result-card result-card-hero">
        <div className="result-card-header">
          <span className="section-label">Сессия подтверждена</span>
          <span className="result-meta">защищено</span>
        </div>
        <p>{access.email}</p>
      </section>

      <form action={logoutAdmin}>
        <button className="button button-secondary primary-action" type="submit">
          Выйти
        </button>
      </form>
    </div>
  );
}
