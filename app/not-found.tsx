import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="placeholder-panel">
      <h1 className="mobile-title">Страница не найдена</h1>
      <p>Такого раздела нет. Вернитесь на главную страницу или начните новый кейс.</p>
      <Link className="button primary-action" href="/">
        Вернуться на главную
      </Link>
    </div>
  );
}
