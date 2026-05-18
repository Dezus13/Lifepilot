import Link from "next/link";

export default function HighRiskPage() {
  return (
    <div className="placeholder-panel">
      <h1 className="mobile-title">Риск</h1>
      <p>Если ситуация связана со штрафом, долгом, сроком или договором, проверьте результат особенно внимательно.</p>
      <Link className="button primary-action" href="/">
        Вернуться на главную
      </Link>
    </div>
  );
}
