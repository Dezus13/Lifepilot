import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="placeholder-panel">
      <h1 className="mobile-title">Ошибка</h1>
      <p>Не получилось продолжить безопасно. Вернитесь на главную страницу и начните новый кейс.</p>
      <Link className="button primary-action" href="/">
        Вернуться на главную
      </Link>
    </div>
  );
}
