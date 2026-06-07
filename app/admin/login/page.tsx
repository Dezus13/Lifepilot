import { redirect } from "next/navigation";
import { getAdminAccess } from "../../../lib/admin-auth";
import { logoutAdmin } from "../actions";
import { loginAdmin } from "./actions";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  config: "Авторизация пока не настроена. Проверьте переменные окружения Supabase.",
  invalid: "Войти не получилось. Проверьте эл. почту и пароль.",
  missing: "Введите эл. почту и пароль."
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const access = await getAdminAccess();

  if (access.status === "authorized") {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorMessage = params?.error ? errorMessages[params.error] : null;

  return (
    <div className="flow-page">
      <section className="flow-heading">
        <h1 className="mobile-title">Вход администратора</h1>
        <p>Вход только для администратора LifePilot.</p>
      </section>

      {access.status === "forbidden" ? (
        <section className="result-card warning-card">
          <div className="result-card-header">
            <span className="section-label">Доступ закрыт</span>
          </div>
          <p>Текущая сессия не имеет активного доступа администратора.</p>
          <form action={logoutAdmin}>
            <button className="button button-secondary primary-action" type="submit">
              Выйти
            </button>
          </form>
        </section>
      ) : null}

      <form action={loginAdmin} className="case-form">
        <label className="case-input-group">
          <span className="field-label">Эл. почта</span>
          <input className="history-search-input" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="case-input-group">
          <span className="field-label">Пароль</span>
          <input
            className="history-search-input"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {errorMessage ? <p className="inline-warning">{errorMessage}</p> : null}
        <button className="button primary-action" type="submit">
          Войти
        </button>
      </form>
    </div>
  );
}
