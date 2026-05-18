import Link from "next/link";

export default function HistoryCasePage() {
  return (
    <div className="placeholder-panel">
      <h1 className="mobile-title">История</h1>
      <p>Просмотр сохраненного кейса пока не реализован. Вернитесь к новому кейсу или результату текущего анализа.</p>
      <Link className="button primary-action" href="/">
        Вернуться на главную
      </Link>
    </div>
  );
}
