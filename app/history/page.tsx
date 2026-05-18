import Link from "next/link";

export default function HistoryPage() {
  return (
    <div className="placeholder-panel">
      <h1 className="mobile-title">История</h1>
      <p>Здесь появятся сохраненные кейсы. В текущем MVP показан только рабочий сценарий одного кейса.</p>
      <Link className="button primary-action" href="/case/new">
        Новый кейс
      </Link>
    </div>
  );
}
